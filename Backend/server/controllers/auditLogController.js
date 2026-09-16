import AuditLog from '../models/AuditLog.js';


export const createAuditLog = async (adminId, action, targetType, targetId, description) => {
    await AuditLog.create({
        admin: adminId,
        action,
        targetType,
        targetId,
        description,
    });
};


export const getAllAuditLogs = async (req, res) => {
    try {
        const logs = await AuditLog.find()
            .populate('admin', 'name')
            .sort({ createdAt: -1 });


            res.status(200).json({ logs });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};