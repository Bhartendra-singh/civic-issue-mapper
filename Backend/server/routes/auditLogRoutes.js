import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { getAllAuditLogs } from '../controllers/auditLogController.js';


const router = express.Router();


router.get('/', protect, isAdmin, getAllAuditLogs);


export default router;