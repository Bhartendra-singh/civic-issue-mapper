import express from 'express';
import { protect, requireVerified } from '../middleware/authMiddleware.js';
import {
    addComment,
    getCommentsByReport,
    deleteComment,
} from '../controllers/commentController.js';


const router = express.Router();


router.post('/:reportId', protect, requireVerified, addComment);
router.get('/:reportId', getCommentsByReport);
router.delete('/:commentId', protect, deleteComment);


export default router;