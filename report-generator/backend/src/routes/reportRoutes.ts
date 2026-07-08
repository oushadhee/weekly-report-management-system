// backend/src/routes/reportRoutes.ts
import express from 'express';
import {
    createReport,
    getMyReports,
    getReportById,
    updateReport,
    submitReport,
} from '../controllers/reportController';
import { protect } from '../middleware/auth';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyReports)
    .post(createReport);

router.route('/:id')
    .get(getReportById)
    .put(updateReport);

router.put('/:id/submit', submitReport);

export default router;