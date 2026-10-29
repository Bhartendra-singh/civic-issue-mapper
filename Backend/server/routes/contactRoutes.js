import express from 'express';
import rateLimit from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';
import { submitContactMessage } from '../controllers/contactController.js';


const router = express.Router();


const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many messages sent. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    prefix: 'rl:contact:',
    sendCommand: (...args) => redisClient.call(...args),
  }),
});


router.post('/', contactLimiter, submitContactMessage);


export default router;