import express from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { 
createReport, getMyReports, getAllReports, updateReportStatus,
deleteReport, getAnalytics, getAllPublicReports, getPublicStats, 
editReport, reopenReport, getAccountabilityMetrics, getReportById,
runClustering, getReportsByCluster, recalculateAllPriorityScores, getCategorySuggestion, triggerSlaCheck
} from '../controllers/reportController.js';

import { protect, isAdmin, requireVerified, optionalAuth } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';


const router = express.Router();


const suggestCategoryLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: { message: 'Too many suggestion requests. Please slow down.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:suggest:',
    sendCommand: (...args) => redisClient.call(...args),
  }),
});


router.post('/', protect, requireVerified, upload.array('photo', 4), createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, isAdmin, getAllReports);
router.get('/analytics', protect, isAdmin, getAnalytics);
router.get('/public', getAllPublicReports);
router.get('/stats', getPublicStats);
router.get('/accountability', getAccountabilityMetrics);
router.post('/run-clustering', protect, isAdmin, runClustering);
router.post('/check-sla', protect, isAdmin, triggerSlaCheck);
router.post('/recalculate-priority', protect, isAdmin, recalculateAllPriorityScores);
router.get('/cluster/:clusterId', getReportsByCluster);
router.post('/suggest-category', suggestCategoryLimiter, getCategorySuggestion);
router.patch('/:id/status', protect, isAdmin, updateReportStatus);
router.patch('/:id', protect, upload.array('photos', 4), editReport);
router.patch('/:id/reopen', protect, reopenReport);
router.delete('/:id', protect, deleteReport);
router.get('/:id', optionalAuth, getReportById);


export default router;