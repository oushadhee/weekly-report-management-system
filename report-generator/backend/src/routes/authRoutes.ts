import express from 'express';
import { register, login, getMe } from '../controllers/authController';
import { protect } from '../middleware/auth';
import { validateRegister, validateLogin, handleValidationErrors } from '../middleware/validation';

const router = express.Router();

router.post('/register', validateRegister, handleValidationErrors, register);
router.post('/login', validateLogin, handleValidationErrors, login);
router.get('/me', protect, getMe);

export default router;