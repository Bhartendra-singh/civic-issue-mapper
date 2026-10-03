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

        photoUrls: {
            type: [
                {
                    url: {
                        type: String,
                        required: true,
                    },
                    publicId: {
                        type: String,
                        required: true,
                    },
                },
            ],

            validate: {
                validator: function (photos) {
                    return photos.length >= 1 && photos.length <= 4;
                },
                message: 'A report must have between 1 and 4 photos',
            },
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
            enum: ['pending', 'in-progress', 'resolved', 'reopened'],
            default: 'pending',
        },

        priorityScore: {
            type: Number,
            default: 0,
        },

        department: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Department',
            default: null,
        },

        upvoteCount: {
            type: Number,
            default: 0,
        },

        clusterId: {
            type: String,
            default: null,
        }, 

        slaBreachNotified: {
            type: Boolean,
            default: false,
        },

        resolvedAt: {
            type: Date,
            default: null,
        },

        hasBeenReopened: {
            type: Boolean,
            default: false,
        },
    },

    { timestamps: true }
);

const Report = mongoose.model('Report', reportSchema);


export default Report;
