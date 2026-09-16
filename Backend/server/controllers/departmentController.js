import Department from '../models/Department.js';
import { createAuditLog } from './auditLogController.js';


export const createDepartment = async (req, res) => {
    try {
        const { name, description, categories } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const department = await Department.create({
            name, 
            description,
            categories,
        });

        await createAuditLog(
            req.user.id,
            'create-department',
            'Department',
            department._id,
            `Created department: ${department.name}`
        );

        res.status(201).json({ message: 'Department created', department });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(400).json({ message: 'A department with this name already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().Sort({ name: 1 });
        res.status(200).json({ departments });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getDepartmentByCategory = async (category) => {
    const department = await Department.findOne({ categories: category });
    return department;
};