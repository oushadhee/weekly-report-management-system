// backend/src/routes/projectRoutes.ts
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

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getProjects)
    .post(authorize('manager'), createProject);

router.route('/:id')
    .get(getProjectById)
    .put(authorize('manager'), updateProject)
    .delete(authorize('manager'), deleteProject);

router.put('/:id/assign', authorize('manager'), assignTeamMembers);

export default router;