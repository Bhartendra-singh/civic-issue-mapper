import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

export const sendVerificationEmail = async (toEmail, verificationLink) => {
    await transporter.sendMail({
        from: `"Civic Issue Mapper" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verify your email address',
        html: `
            <h2>Welcome to Civic Issue Mapper!</h2>
            <p>Please verify your email by clicking below:</p>
            <a href="${verificationLink}">Verify Email</a>
        `,

    });
};


export const sendPasswordResetEmail = async (toEmail, resetLink) => {
    await transporter.sendMail({
        from: `"Civic Issue Mapper" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Reset your Password',
        html: `
            <h2>Password Reset Request</h2>
            <p>Click the link below to reset your password. This link expires in 15 minutes.</p>
            <a href="${resetLink}">Reset Password</a>
        `,
    });
};