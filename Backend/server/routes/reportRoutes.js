import express from 'express';
import { createReport, getMyReports, getAllReports, updateReportStatus, deleteReport, getAnalytics, getAllPublicReports, getPublicStats } from '../controllers/reportController.js';
import { protect, isAdmin, requireVerified } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';


const router = express.Router();


router.post('/', protect, requireVerified, upload.single('photo'), createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, isAdmin, getAllReports);
router.get('/analytics', protect, isAdmin, getAnalytics);
router.get('/public', getAllPublicReports);
router.get('/stats', getPublicStats);
router.patch('/:id/status', protect, isAdmin, updateReportStatus);
router.delete('/:id', protect, deleteReport);


export default router;
