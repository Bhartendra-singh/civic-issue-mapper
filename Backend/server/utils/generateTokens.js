import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import RefreshToken from '../models/RefreshToken.js';


export const generateTokens = async (userId, userRole) => {
    const accessToken = jwt.sign(
        { id: userId, role: userRole },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    );

    const refreshTokenValue = crypto.randomBytes(40).toString('hex');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await RefreshToken.create({
        user: userId,
        token: refreshTokenValue,
        expiresAt,
    });

    return { accessToken, refreshToken: refreshTokenValue };
};