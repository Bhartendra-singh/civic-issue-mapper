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


const escapeHtml = (text) =>
    String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');


export const sendContactNotificationEmail = async ({ name, email, subject, message }) => {
    await transporter.sendMail({
        from: `"Civic Issue Mapper" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        replyTo: email,
        subject: `[Contact] ${subject}`,
        html: `
            <h2>New contact message</h2>
            <p><strong>Name:</strong> ${escapeHtml(name)}</p>
            <p><strong>Email:</strong> ${escapeHtml(email)}</p>
            <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
            <p><strong>Message:</strong></p>
            <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
        `,
    });
};