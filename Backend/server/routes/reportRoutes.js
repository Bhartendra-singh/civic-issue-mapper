import express from 'express';
import { createReport, getMyReports, getAllReports, updateReportStatus, deleteReport, getAnalytics, getAllPublicReports, getPublicStats, editReport, reopenReport, getAccountabilityMetrics, getReportById, runClustering, getReportsByCluster } from '../controllers/reportController.js';
import { protect, isAdmin, requireVerified } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';


const router = express.Router();


router.post('/', protect, requireVerified, upload.array('photo', 4), createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, isAdmin, getAllReports);
router.get('/analytics', protect, isAdmin, getAnalytics);
router.get('/public', getAllPublicReports);
router.get('/stats', getPublicStats);
router.get('/accountability', getAccountabilityMetrics);
router.post('/run-clustering', protect, isAdmin, runClustering);
router.get('/cluster/:clusterId', getReportsByCluster);
router.patch('/:id/status', protect, isAdmin, updateReportStatus);
router.patch('/:id', protect, upload.array('photos', 4), editReport);
router.patch('/:id/reopen', protect, reopenReport);
router.delete('/:id', protect, deleteReport);
router.get('/:id', getReportById);



export default router;