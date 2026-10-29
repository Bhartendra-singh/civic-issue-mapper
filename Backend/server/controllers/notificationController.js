import Notification from "../models/Notification.js";
import { getIO } from '../config/socket.js';


// GET /api/notifications — logged-in user ke apne notifications, latest first
export const getMyNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .populate('report', 'category status');

        res.status(200).json(notifications);

    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
    }
};


// PATCH /api/notifications/:id/read — ek notification ko read mark karna
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, user: req.user.id },
            { isRead: true },
            { returnDocument: 'after' }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};


// PATCH /api/notifications/read-all — sab notifications ek saath read mark karna
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { user: req.user.id, isRead: false },
            { isRead: true }
        );

        res.status(200).json({ message: 'All notifications marked as read' });

    } catch (error) {
        res.status(500).json({ message: 'Failed to update notification', error: error.message });
    }
};


const pushNotification = (userId, notification, report) => {
    const io = getIO();
    if (!io) return;

    io.to(`user:${userId}`).emit('notification', {
        _id: notification._id,
        message: notification.message,
        type: notification.type,
        isRead: notification.isRead,
        createdAt: notification.createdAt,
        report,
    });
};


// Helper — reportController se call hoga jab status change ho
export const createStatusChangeNotification = async (userId, reportId, category, status) => {
    const notification = await Notification.create({
        user: userId,
        report: reportId,
        message: `Your ${category} report is now ${status}`,
        type: 'status-change',
    });

    pushNotification(userId, notification, { _id: reportId, category, status });
};


// Helper — reportController se call hoga jab SLA breach detect ho
export const createSlaBreachNotification = async (adminId, reportId, category, departmentName) => {
    const notification = await Notification.create({
        user: adminId,
        report: reportId,
        message: `SLA breach: ${category} report (${departmentName}) is overdue`,
        type: 'sla-breach',
    });

    pushNotification(adminId, notification, { _id: reportId, category });
};


// Helper — reportController se call hoga jab citizen resolved report ko reopen kare
export const createReopenNotification = async (adminId, reportId, category) => {
    const notification = await Notification.create({
        user: adminId,
        report: reportId,
        message: `A citizen reopened a ${category} report: the fix was not accepted`,
        type: 'status-change',
    });

    pushNotification(adminId, notification, { _id: reportId, category, status: 'reopened' });
};