import passport from '../config/passport.js';
import express from 'express';
import { signup, login, getProfile, logout, verifyEmail, forgotPassword, resetPassword, updateProfile, googleCallback, refreshAccessToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../config/multer.js';


const router = express.Router();


router.post('/signup', signup);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.patch('/profile', protect, upload.single('photo'), updateProfile);
router.get('/verify-email/:token', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.patch('/reset-password/:token', resetPassword);
router.post('/logout', logout);
router.post('/refresh', refreshAccessToken);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'], session: false }));
router.get('/google/callback', passport.authenticate('google', { session: false, failureRedirect: 'http://localhost:5173/login' }), googleCallback);


export default router;

