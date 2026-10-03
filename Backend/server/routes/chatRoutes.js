import express from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { handleAdminChat, handleUserChat } from '../controllers/chatController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  message: { message: 'Too many questions. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});

router.post('/admin', protect, isAdmin, chatLimiter, handleAdminChat);
router.post('/user', protect, chatLimiter, handleUserChat);

export default router;