import Feedback from '../models/Feedback.js';
import Report from '../models/Report.js';


export const addFeedback = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const reportId = req.params.reportId;

        const report = await Report.findById(reportId);

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        const isOwner = report.user.toString() === req.user.id;

        if (!isOwner) {
            return res.status(403).json({ message: 'Only the report owner can give feedback' });
        }

        if (report.status !== 'resolved') {
            return res.status(400).json({ message: 'Feedback can only be given after the report is resolved' });
        }

        const feedback = await Feedback.create({
            report: reportId,
            user: req.user.id,
            rating,
            comment,
        });

        res.status(201).json({ message: 'Feedback submitted', feedback });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({ message: 'You have already given feedback for this report' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getFeedbackByReport = async (req, res) => {
    try {
        const reportId = req.params.reportId;

        const feedback = await Feedback.findOne({ report: reportId }).populate('user', 'name');

        res.status(200).json({ feedback });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};