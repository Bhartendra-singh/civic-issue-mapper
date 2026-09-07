import express from 'express';
import { createReport, getMyReports, getAllReports } from '../controllers/reportController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';


const router = express.Router();


router.post('/', protect, createReport);
router.get('/my-reports', protect, getMyReports);
router.get('/all', protect, isAdmin, getAllReports);


export default router;
