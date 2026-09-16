import mongoose from 'mongoose';


const upvoteSchema = new mongoose.Schema(
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
    },
    { timestamps: true }
);


upvoteSchema.index({ user: 1, report: 1, }, { unique: true });

const Upvote = mongoose.model('Upvote', upvoteSchema);


export default Upvote;