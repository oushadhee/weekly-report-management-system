import express from 'express';
import {
    createReport,
    getMyReports,
    getReportById,
    updateReport,
    submitReport,
    deleteReport,  // ✅ Make sure this is imported
} from '../controllers/reportController';
import { protect } from '../middleware/auth';
import { validateReport, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.use(protect);

router.route('/')
    .get(getMyReports)
    .post(validateReport, handleValidationErrors, createReport);

router.route('/:id')
    .get(getReportById)
    .put(validateReport, handleValidationErrors, updateReport)
    .delete(deleteReport);  // ✅ Now deleteReport is defined

router.put('/:id/submit', submitReport);

export default router;