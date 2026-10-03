import Upvote from '../models/Upvote.js';
import Report from '../models/Report.js';
import { calculatePriorityScore } from '../utils/priorityScore.js';


export const toggleUpvote = async (req, res) => {
    try {
        const reportId = req.params.id;
        const userId = req.user.id;

        const existingUpvote = await Upvote.findOne({ user: userId, report: reportId });

        if (existingUpvote) {
            await existingUpvote.deleteOne();

            const report = await Report.findByIdAndUpdate(
                reportId,
                { $inc: { upvoteCount: -1 } },
                { new: true }
            );

            report.priorityScore = calculatePriorityScore(report);
            await report.save();

            return res.status(200).json({ message: 'Upvote removed', upvoted: false });
        }

        await Upvote.create({ user: userId, report: reportId });

        const report = await Report.findByIdAndUpdate(
            reportId,
            { $inc: { upvoteCount: 1 } },
            { new: true }
        );

        report.priorityScore = calculatePriorityScore(report);
        await report.save();

        res.status(200).json({ message: 'Report upvoted', upvoted: true });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getMyUpvotedReportIds = async (req, res) => {
  try {
    const upvotes = await Upvote.find({ user: req.user.id }).select('report');
    const reportIds = upvotes.map((u) => u.report.toString());
    res.status(200).json({ reportIds });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};