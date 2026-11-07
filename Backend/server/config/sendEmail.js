import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();


const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

const SENDER_NAME = 'Civic Issue Mapper';

const getSenderEmail = () => process.env.EMAIL_FROM || process.env.EMAIL_USER;


// Local fallback: purana Gmail SMTP (sirf tab use hoga jab BREVO_API_KEY na ho)
const smtpTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    family: 4,
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 20000,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});


const sendMail = async ({ to, subject, html, replyTo }) => {
    if (process.env.BREVO_API_KEY) {
        const payload = {
            sender: { name: SENDER_NAME, email: getSenderEmail() },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        };

        if (replyTo) {
            payload.replyTo = { email: replyTo };
        }

        const response = await fetch(BREVO_URL, {
            method: 'POST',
            headers: {
                'api-key': process.env.BREVO_API_KEY,
                'content-type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Brevo API ${response.status}: ${errorText}`);
        }

        return;
    }

    await smtpTransporter.sendMail({
        from: `"${SENDER_NAME}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        ...(replyTo && { replyTo }),
    });
};


export const sendVerificationEmail = async (toEmail, verificationLink) => {
    await sendMail({
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
    await sendMail({
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
    await sendMail({
        to: getSenderEmail(),
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