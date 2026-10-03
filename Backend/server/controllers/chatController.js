import Report from '../models/Report.js';
import { parseQueryToFilter, generateAnswer } from '../services/geminiService.js';

export const handleAdminChat = async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || query.trim().length === 0) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const filter = await parseQueryToFilter(query);

        const reports = await Report.find(filter)
            .select('category status description createdAt department')
            .populate('department', 'name')
            .limit(50);

        const summaryData = {
            totalCount: reports.length,
            reports: reports.map((r) => ({
                category: r.category,
                status: r.status,
                department: r.department?.name || 'Unassigned',
                description: r.description,
            })),
        };

        const answer = await generateAnswer(query, summaryData);

        res.status(200).json({ answer, filter, resultCount: reports.length });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};