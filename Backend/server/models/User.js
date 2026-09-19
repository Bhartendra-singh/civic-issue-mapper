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
            required: function () {
                return this.authProvider === 'local';
            },
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

        profilePhoto: {
            type: String,
            default: '',
        },

        profilePhotoId: {
            type: String,
            default: '',
        },

        authProvider: {
            type: String,
            enum: ['local', 'google'],
            default: 'local',
        },
    },

    { timestamps: true }
);

const User = mongoose.model('User', userSchema);    //schema lekr ke aik usable model banana


export default User;