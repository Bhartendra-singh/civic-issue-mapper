import mongoose from "mongoose";


const departmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        categories: {
            type: [String],
            default: [],
        },

        slaHours: {
            type: Number,
            required: true,
            default: 72,
        },
    },

    { timestamps: true }
);


const Department = mongoose.model('Department', departmentSchema);


export default Department;