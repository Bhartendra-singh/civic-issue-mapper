import mongoose from 'mongoose';
import Department from '../models/Department.js';
import Report from '../models/Report.js';
import { createAuditLog } from './auditLogController.js';

const VALID_CATEGORIES = ['pothole', 'garbage', 'waterlogging', 'streetlight', 'drain', 'other'];
const MIN_SLA_HOURS = 1;
const MAX_SLA_HOURS = 720;


const cleanCategories = (categories) => {
    if (categories === undefined) return { value: undefined };

    if (!Array.isArray(categories)) {
        return { error: 'Categories must be a list' };
    }

    const unique = [...new Set(categories)];
    const invalid = unique.filter((c) => !VALID_CATEGORIES.includes(c));

    if (invalid.length > 0) {
        return { error: `Invalid categories: ${invalid.join(', ')}` };
    }

    return { value: unique };
};


const validateSlaHours = (slaHours) => {
    if (slaHours === undefined) return null;

    const n = Number(slaHours);
    if (!Number.isInteger(n) || n < MIN_SLA_HOURS || n > MAX_SLA_HOURS) {
        return `SLA hours must be a whole number between ${MIN_SLA_HOURS} and ${MAX_SLA_HOURS}`;
    }

    return null;
};


const findCategoryConflict = async (categories, excludeId = null) => {
    if (!categories || categories.length === 0) return null;

    const filter = { categories: { $in: categories } };
    if (excludeId) filter._id = { $ne: excludeId };

    const other = await Department.findOne(filter);
    if (!other) return null;

    const clashing = categories.filter((c) => other.categories.includes(c));
    return `${clashing.join(', ')} already belongs to ${other.name}`;
};


const backfillReports = async (department) => {
    if (!department.categories || department.categories.length === 0) return 0;

    const result = await Report.updateMany(
        { department: null, category: { $in: department.categories } },
        { $set: { department: department._id } }
    );

    return result.modifiedCount;
};


export const createDepartment = async (req, res) => {
    try {
        const { name, description, categories, slaHours } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        const cleaned = cleanCategories(categories);
        if (cleaned.error) {
            return res.status(400).json({ message: cleaned.error });
        }

        const slaError = validateSlaHours(slaHours);
        if (slaError) {
            return res.status(400).json({ message: slaError });
        }

        const conflict = await findCategoryConflict(cleaned.value);
        if (conflict) {
            return res.status(409).json({ message: conflict });
        }

        const department = await Department.create({
            name,
            description,
            categories: cleaned.value,
            ...(slaHours !== undefined && { slaHours: Number(slaHours) }),
        });

        const backfilled = await backfillReports(department);

        await createAuditLog(
            req.user.id,
            'create-department',
            'Department',
            department._id,
            `Created department: ${department.name}`
        );

        res.status(201).json({ message: 'Department created', department, backfilled });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'A department with this name already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid department id' });
        }

        const department = await Department.findById(id);

        if (!department) {
            return res.status(404).json({ message: 'Department not found' });
        }

        const { name, description, categories, slaHours } = req.body;

        if (name !== undefined && !name.trim()) {
            return res.status(400).json({ message: 'Department name cannot be empty' });
        }

        const cleaned = cleanCategories(categories);
        if (cleaned.error) {
            return res.status(400).json({ message: cleaned.error });
        }

        const slaError = validateSlaHours(slaHours);
        if (slaError) {
            return res.status(400).json({ message: slaError });
        }

        const conflict = await findCategoryConflict(cleaned.value, department._id);
        if (conflict) {
            return res.status(409).json({ message: conflict });
        }

        const changes = [];

        if (name !== undefined && name.trim() !== department.name) {
            changes.push(`name "${department.name}" to "${name.trim()}"`);
            department.name = name;
        }

        if (description !== undefined && description.trim() !== (department.description || '')) {
            changes.push('description');
            department.description = description;
        }

        if (cleaned.value !== undefined) {
            const before = [...department.categories].sort().join(',');
            const after = [...cleaned.value].sort().join(',');

            if (before !== after) {
                changes.push(`categories to [${cleaned.value.join(', ') || 'none'}]`);
                department.categories = cleaned.value;
            }
        }

        if (slaHours !== undefined && Number(slaHours) !== department.slaHours) {
            changes.push(`SLA from ${department.slaHours}h to ${Number(slaHours)}h`);
            department.slaHours = Number(slaHours);
        }

        if (changes.length === 0) {
            return res.status(200).json({ message: 'No changes', department, backfilled: 0 });
        }

        await department.save();

        const backfilled = await backfillReports(department);

        await createAuditLog(
            req.user.id,
            'update-department',
            'Department',
            department._id,
            `Updated ${department.name}: ${changes.join('; ')}`
        );

        res.status(200).json({ message: 'Department updated', department, backfilled });

    } catch (error) {
        console.log(error);

        if (error.code === 11000) {
            return res.status(409).json({ message: 'A department with this name already exists' });
        }

        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


export const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.find().sort({ name: 1 });
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