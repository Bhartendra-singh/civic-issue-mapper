import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { toggleUpvote, getMyUpvotedReportIds } from '../controllers/upvoteController.js';


const router = express.Router();


router.get('/my-upvotes', protect, getMyUpvotedReportIds);
router.patch('/:id/toggle', protect, toggleUpvote);


export default router;