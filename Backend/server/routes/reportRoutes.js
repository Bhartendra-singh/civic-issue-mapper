import express from 'express';
import { createReport, getMyReports, getAllReports, updateReportStatus } from '../controllers/reportController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, isAdmin, getAllReports);
router.patch('/:id/status', protect, isAdmin, updateReportStatus);


export default router;
