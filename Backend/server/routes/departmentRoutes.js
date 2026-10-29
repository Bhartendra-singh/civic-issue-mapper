import express from 'express';
import { protect, isAdmin } from '../middleware/authMiddleware.js';
import { createDepartment, getAllDepartments, updateDepartment } from '../controllers/departmentController.js';


const router = express.Router();


router.post('/', protect, isAdmin, createDepartment);
router.get('/', protect, isAdmin, getAllDepartments);
router.patch('/:id', protect, isAdmin, updateDepartment);


export default router;