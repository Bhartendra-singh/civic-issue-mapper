import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        category: {
            type: String,
            enum: ['pothole', 'garbage', 'waterlogging', 'streetlight', 'drain', 'other'],
            required: true,
        },
        
        description: {
            type: String,
            required: true,
        },

        photoUrl: {
            type: String,
            required: true,
        },

        location: {
            lat: {
                type: Number,
                required: true,
            },

            lng: {
                type: Number,
                required: true,
            },
        },

        status: {
            type: String,
            enum: ['pending', 'in-progress', 'resolved'],
            default: 'pending',
        },

        priorityScore: {
            type: Number,
            default: 0,
        },
    },

    { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);


export default Report;
