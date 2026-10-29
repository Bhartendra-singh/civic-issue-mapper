import mongoose from "mongoose";


const feedbackSchema = new mongoose.Schema(
    {
        report: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Report',
            required: true,
        },

        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
        },

        comment: {
            type: String,
            trim: true,
            maxlength: 300,
        },

    },

    { timestamps: true }
);


feedbackSchema.index({ user: 1, report: 1 }, { unique: true });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;