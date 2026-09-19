import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../config/sendEmail.js';
import cloudinary from '../config/cloudinary.js';
import RefreshToken from '../models/RefreshToken.js';
import { generateTokens } from '../utils/generateTokens.js';


export const signup = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        
        if(existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verificationToken = crypto.randomBytes(32).toString('hex');


        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            verificationToken,
        });

        const verificationLink = `http://localhost:5173/verify-email/${verificationToken}`;
        await sendVerificationEmail(newUser.email, verificationLink);


        const { accessToken, refreshToken } = await generateTokens(newUser._id, newUser.role);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.status(201).json({
            message: 'User created. Please check your email to verify your account.',
            user: { id: newUser._id, name: newUser.name, email: newUser.email, role: newUser.role, isVerified: newUser.isVerified },
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email });

        if(!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);

        if(!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // const token = jwt.sign(
        //     { id: existingUser._id, role: existingUser.role },
        //     process.env.JWT_SECRET,
        //     { expiresIn: '7d' }
        // );

        // res.cookie('token', token, {
        //     httpOnly: true,
        //     maxAge: 7 * 24 * 60 * 60 * 1000,
        // });

        const { accessToken, refreshToken } = await generateTokens(existingUser._id, existingUser.role);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        

        res.status(200).json({
            message: 'Login successful',
            user: { id: existingUser._id, name: existingUser.name, email: existingUser.email, role: existingUser.role, isVerified: existingUser.isVerified },
        });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// export const logout = (req, res) => {
//     res.clearCookie('token');
//     res.status(200).json({ message: 'Logged out successfully' });
// };

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (refreshToken) {
            await RefreshToken.deleteOne({ token: refreshToken });
        }

        res.clearCookie('accessToken');
        res.clearCookie('refreshToken');

        res.status(200).json({ message: 'Logged out successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        const user = await User.findOne({ verificationToken: token });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired verification link' });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ message: 'Email verification successfully' });
    
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });

    }
};


export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
        }

        const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const resetLink = `http://localhost:5173/reset-password/${resetToken}`;
        await sendPasswordResetEmail(user.email, resetLink);

        res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });

    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { newPassword } = req.body;

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset link' });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: 'Password reset successful. Please log in with your new  password.' });
    } catch (error) {
        res.status(400).json({ message: 'Invalid or expired reset link' });
    }
};


export const updateProfile = async (req, res) => {
    try {
        const { name } = req.body;

        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) {
            user.name = name;
        }

        if (req.file) {
            if (user.profilePhotoId) {
                await cloudinary.uploader.destroy(user.profilePhotoId);
            }

            user.profilePhoto = req.file.path;
            user.profilePhotoId = req.file.filename;
        }

        await user.save();

        res.status(200).json({
            message: 'Profile updated successfully' ,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                profilePhoto: user.profilePhoto,
            },
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const googleCallback = async (req, res) => {
    try {
        const user = req.user;

        const { accessToken, refreshToken } = await generateTokens(user._id, user.role);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });


        res.redirect('http://localhost:5173');

    } catch (error) {
        console.log(error);
        res.redirect('http://localhost:5173/login?error=google-auth-failed');
    }
};


export const refreshAccessToken = async (req, res) => {
    try {
        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({ message: 'No refresh token provided' });
        }

        const storedToken = await RefreshToken.findOne({ token: oldRefreshToken });

        if (!storedToken) {
            return res.status(401).json({ message: 'Invalid refresh token' });
        }

        if (storedToken.expiresAt < new Date()) {
            await storedToken.deleteOne();
            return res.status(401).json({ message: 'Refresh token expired, please log in again' });
        }

        const user = await User.findById(storedToken.user);

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        await storedToken.deleteOne();

        const { accessToken, refreshToken } = await generateTokens(user._id, user.role);

        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            maxAge: 15 * 60 * 1000,
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json({ message: 'Token refreshed successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};