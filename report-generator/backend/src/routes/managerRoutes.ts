// backend/src/routes/managerRoutes.ts
import express from 'express';
import {
    getTeamReports,
    getDashboardStats,
    getTeamMembers,
    getSubmissionStatus,
} from '../controllers/managerController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);
router.use(authorize('manager'));

router.get('/reports', getTeamReports);
router.get('/dashboard', getDashboardStats);
router.get('/members', getTeamMembers);
router.get('/submission-status', getSubmissionStatus);

export default router;