import mongoose from 'mongoose';


const auditLogSchema = new mongoose.Schema(
    {
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        action: {
            type: String,
            enum: ['status-update', 'delete-report', 'create-department', 'update-department'],
            required: true,
        },

        targetType: {
            type: String,
            enum: ['Report', 'Department'],
            required: true,
        },

        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
        },

        description: {
            type: String,
            trim: true,
        },
    },

    { timestamps: true }
);


const AuditLog = mongoose.model('AuditLog', auditLogSchema);


export default AuditLog;