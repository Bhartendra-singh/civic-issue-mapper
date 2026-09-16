import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { toggleUpvote } from '../controllers/upvoteController.js';


const router = express.Router();


router.patch('/:id/toggle', protect, toggleUpvote);


export default router;