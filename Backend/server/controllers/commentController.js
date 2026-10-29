import Comment from '../models/Comment.js';
import { getIO } from '../config/socket.js';


export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const reportId = req.params.reportId;

        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const comment = await Comment.create({
            report: reportId,
            user: req.user.id,
            text,
        });

        const populatedComment = await comment.populate('user', 'name');

        const io = getIO();
        if (io) {
            io.to(`report:${reportId}`).emit('comment:new', populatedComment.toObject());
        }

        res.status(201).json({ message: 'Comment added', comment: populatedComment });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getCommentsByReport = async (req, res) => {
    try {
        const reportId = req.params.reportId;

        const comments = await Comment.find({ report: reportId })
            .populate('user', 'name')
            .sort({ createdAt: -1 });

            res.status(200).json({ comments });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const deleteComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const isOwner = comment.user.toString() === req.user.id;
        const isAdminUser = req.user.role === 'admin';

        if (!isOwner && !isAdminUser) {
            return res.status(403).json({ message: 'You can only delete your own comments' });
        }

        const reportId = comment.report.toString();
        const commentId = comment._id.toString();

        await comment.deleteOne();

        const io = getIO();
        if (io) {
            io.to(`report:${reportId}`).emit('comment:deleted', { commentId });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
};