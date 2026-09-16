import Report from '../models/Report.js';
import User from '../models/User.js';
import { createStatusChangeNotification } from './notificationController.js';
import { getDepartmentByCategory } from './departmentController.js';
import { createAuditLog } from './auditLogController.js';


export const createReport = async (req, res) => {
    try {
        const { category, description, lat, lng, } = req.body;


        if (!req.file) {
            return res.status(400).json({ message: 'Photo is required' });
        }

        const department = await getDepartmentByCategory(category);

        const newReport = await Report.create({
            user: req.user.id,
            category,
            description,
            photoUrl: req.file.path,
            location: { lat, lng },
            department: department ? department._id : null,
        });

        res.status(201).json({
            message: 'Report submitted successfully',
            report: newReport,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getMyReports = async (req, res) => {
    try {
        const reports =  await Report.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ reports });
    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    } 
};



export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('user', 'name email').sort({ createdAt: -1 });
        res.status(200).json({ reports });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updateReportStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        report.status = status;
        await report.save();

        await createStatusChangeNotification(report.user, report._id, report.category, report.status);

        await createAuditLog(
            req.user.id,
            'status-update',
            'Report._id',
            `Changed status of ${report.category} report to ${report.status}`
        );

        res.status(200).json({ message: 'Status updated successfully', report });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const deleteReport = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isOwner = report.user.toString() === req.user.id;
        const isAdminUser = req.user.role === 'admin';

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ message: 'You can only delete your own reports' });
        }

        const reportId = report._id;
        const reportCategory = report.category;

        await report.deleteOne();

        await createAuditLog(
            req.user.id,
            'delete-report',
            'Report',
            reportId,
            `Deleted ${reportCategory} report`
        );

        res.status(200).json({ message: 'Report deleted successfully' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAnalytics = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();

        const statusCounts = await Report.aggregate([
            { $group: { _id: '$status', count: { $sum: 1} } },
        ]);

        const categoryCounts = await Report.aggregate([
            { $group: { _id: '$category', count: { $sum: 1} } },
        ]);

        const activeUsers = await User.countDocuments({ role: 'citizen' });

        res.status(200).json({
            totalReports,
            statusCounts,
            categoryCounts,
            activeUsers,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllPublicReports = async (req, res) => {
    try {
        const reports = await Report.find().select('category description location status createdAt');
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getPublicStats = async (req, res) => {
    try {
        const totalReports = await Report.countDocuments();
        const resolvedCount = await Report.countDocuments({ status: 'resolved' });
        const activeUsers = await User.countDocuments({ role: 'citizen' });

        res.status(200).json({
            totalReports,
            resolvedCount,
            activeUsers,
        });
    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};