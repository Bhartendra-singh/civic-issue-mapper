import mongoose from 'mongoose';


const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        isRead: {
            type: Boolean,
            default: false,
        },
        type: {
            type: String,
            enum: ['status-change', 'sla-breach'],
            default: 'status-change',
        },
    },
    { timestamps: true }
);


const Notification = mongoose.model('Notification', notificationSchema);


export default Notification;