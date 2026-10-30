import passport from '../config/passport.js';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { signup, login, getProfile, logout, verifyEmail, forgotPassword, resetPassword, updateProfile, googleCallback, refreshAccessToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';
import { RedisStore } from 'rate-limit-redis';
import redisClient from '../config/redis.js';


const router = express.Router();


const getClientUrl = () => process.env.CLIENT_URL || 'http://localhost:5173';


const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { message: 'Too many attempts. Please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    sendCommand: (...args) => redisClient.call(...args),
  }),
});


router.post('/signup', authLimiter, signup);
router.post('/login', authLimiter, login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, upload.single('photo'), updateProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', authLimiter, forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));

router.get(
  '/google/callback',
  (req, res, next) => {
    passport.authenticate('google', {
      session: false,
      failureRedirect: `${getClientUrl()}/login`,
    })(req, res, next);
  },
  googleCallback
);


export default router;