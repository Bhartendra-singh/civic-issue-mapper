import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addFeedback, getFeedbackByReport } from '../controllers/feedbackController.js';


const router = express.Router();


router.post('/:reportId', protect, addFeedback);
router.get('/:reportId', getFeedbackByReport);


export default router;