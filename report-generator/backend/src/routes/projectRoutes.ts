import express from 'express';
import {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    assignTeamMembers,
} from '../controllers/projectController';
import { protect, authorize } from '../middleware/auth';
import { validateProject, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getProjects)
    .post(authorize('manager'), validateProject, handleValidationErrors, createProject);

router.route('/:id')
    .get(getProjectById)
    .put(authorize('manager'), validateProject, handleValidationErrors, updateProject)
    .delete(authorize('manager'), deleteProject);

router.put('/:id/assign', authorize('manager'), assignTeamMembers);

export default router;