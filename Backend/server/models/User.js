import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true, 
        },

        email: {
            type: String,
            required: true,
            unique: true,
        },

        password: {
            type: String,
            required: true,
        },

        role: {
            type: String,
            enum: ['citizen', 'admin'],
            default: 'citizen',
        },

        isVerified: {
            type: Boolean, 
            default: false,
        },

        verificationToken: {
            type: String,
        },
    },

    { timestamps: true }
);

const User = mongoose.model('User', userSchema);    //schema lekr ke aik usable model banana


export default User;