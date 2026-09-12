import Report from '../models/Report.js';


export const createReport = async (req, res) => {
    try {
        const { category, description, lat, lng, } = req.body;


        if (!req.file) {
            return res.status(400).json({ message: 'Photo is required' });
        }

        const newReport = await Report.create({
            user: req.user.id,
            category,
            description,
            photoUrl: req.file.path,
            location: { lat, lng },
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

        res.status(200).json({ message: 'Status updated successfully', report });

    } catch (error) {
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

        await report.deleteOne();

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

        res.status(200).json({
            totalReports,
            statusCounts,
            categoryCounts,
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllPublicReports = async (req, res) => {
    try {
        const reports = await Report.find().select('category location status createdAt');
        res.status(200).json({ reports });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};