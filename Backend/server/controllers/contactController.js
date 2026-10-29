import ContactMessage from '../models/ContactMessage.js';
import { sendContactNotificationEmail } from '../config/sendEmail.js';


export const submitContactMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        const contact = await ContactMessage.create({ name, email, subject, message });

        try {
            await sendContactNotificationEmail({
                name: contact.name,
                email: contact.email,
                subject: contact.subject,
                message: contact.message,
            });
        } catch (emailError) {
            console.error('Contact notification email failed:', emailError.message);
        }

        res.status(201).json({ message: 'Thanks! We will get back to you soon.' });

    } catch (error) {
        if (error.name === 'ValidationError') {
            const firstError = Object.values(error.errors)[0].message;
            return res.status(400).json({ message: firstError });
        }

        console.error('Contact submit failed:', error.message);
        res.status(500).json({ message: 'Failed to send message. Please try again.' });
    }
};