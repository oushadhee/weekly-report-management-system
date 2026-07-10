import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// Validation rules for User Registration
export const validateRegister = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Name can only contain letters and spaces'),

    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Password must contain at least one letter and one number'),

    body('role')
        .optional()
        .isIn(['team_member', 'manager'])
        .withMessage('Role must be either team_member or manager'),
];

// Validation rules for User Login
export const validateLogin = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .trim(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),
];

// Validation rules for Report
export const validateReport = [
    body('weekStart')
        .isISO8601()
        .withMessage('Week start must be a valid date'),

    body('weekEnd')
        .isISO8601()
        .withMessage('Week end must be a valid date')
        .custom((value, { req }) => {
            const start = new Date(req.body.weekStart);
            const end = new Date(value);
            if (end < start) {
                throw new Error('Week end must be after week start');
            }
            return true;
        }),

    body('project')
        .notEmpty()
        .withMessage('Project is required')
        .isMongoId()
        .withMessage('Invalid project ID'),

    body('tasksCompleted')
        .isArray({ min: 1 })
        .withMessage('At least one completed task is required')
        .custom((value) => {
            if (value.some((task: string) => task.trim() === '')) {
                throw new Error('Tasks cannot be empty');
            }
            return true;
        }),

    body('tasksPlanned')
        .isArray({ min: 1 })
        .withMessage('At least one planned task is required')
        .custom((value) => {
            if (value.some((task: string) => task.trim() === '')) {
                throw new Error('Tasks cannot be empty');
            }
            return true;
        }),

    body('blockers')
        .optional()
        .isArray()
        .withMessage('Blockers must be an array'),

    body('hoursWorked')
        .optional()
        .isFloat({ min: 0, max: 168 })
        .withMessage('Hours must be between 0 and 168'),

    body('notes')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Notes must not exceed 1000 characters')
        .trim(),
];

// Validation rules for Project
export const validateProject = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Project name must be between 2 and 50 characters'),

    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters')
        .trim(),

    body('status')
        .optional()
        .isIn(['active', 'inactive', 'completed'])
        .withMessage('Invalid status value'),

    body('color')
        .optional()
        .isHexColor()
        .withMessage('Color must be a valid hex color'),
];

// Middleware to handle validation errors
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.param,
                message: err.msg,
            })),
        });
    }
    next();
};