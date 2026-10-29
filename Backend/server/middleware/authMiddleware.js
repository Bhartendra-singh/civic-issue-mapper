import jwt from 'jsonwebtoken';
import User from '../models/User.js';


export const protect = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = user;
        next();

    } catch (error) {
        return res.status(401).json({ message: 'Not authorized, invalid token' });
    }
};


export const optionalAuth = async (req, res, next) => {
    const token = req.cookies.accessToken;

    if (!token) {
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('-password');

        if (user) {
            req.user = user;
        }
    } catch (error) {
        // token expire ya invalid ho to guest ki tarah aage badho
    }

    next();
};


export const isAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied, admin only' });
    }

    next();
};


export const requireVerified = (req, res, next) => {
    if (!req.user.isVerified) {
        return res.status(403).json({ message: 'Please verify your email before submitting a report' });
    }
    next();
};