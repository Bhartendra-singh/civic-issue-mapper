import express from 'express';
import { handleAdminChat } from '../controllers/chatController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/admin', protect, isAdmin, handleAdminChat);

export default router;