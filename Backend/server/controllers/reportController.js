import Report from '../models/Report.js';


export const createReport = async (req, res) => {
    try {
        const { category, description, photoUrl, lat, lng, } = req.body;


        const newReport = await Report.create({
            user: req.user.id,
            category,
            description,
            photoUrl,
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