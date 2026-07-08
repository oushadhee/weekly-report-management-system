// backend/src/controllers/reportController.ts
import { Request, Response } from 'express';
import Report from '../models/Report';
import { AuthRequest } from '../middleware/auth';

export const createReport = async (req: AuthRequest, res: Response) => {
    try {
        const { weekStart, weekEnd, project, tasksCompleted, tasksPlanned, blockers, hoursWorked, notes } = req.body;

        const existingReport = await Report.findOne({
            user: req.user?._id,
            weekStart: new Date(weekStart),
        });

        if (existingReport) {
            return res.status(400).json({
                message: 'Report already exists for this week',
            });
        }

        const report = await Report.create({
            user: req.user?._id,
            weekStart,
            weekEnd,
            project,
            tasksCompleted,
            tasksPlanned,
            blockers,
            hoursWorked,
            notes,
        });

        res.status(201).json({
            success: true,
            report,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getMyReports = async (req: AuthRequest, res: Response) => {
    try {
        const reports = await Report.find({ user: req.user?._id })
            .populate('project')
            .sort({ weekStart: -1 });

        res.json({
            success: true,
            reports,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getReportById = async (req: AuthRequest, res: Response) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user?._id,
        }).populate('project');

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        res.json({ success: true, report });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateReport = async (req: AuthRequest, res: Response) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user?._id,
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.status === 'submitted') {
            return res.status(400).json({
                message: 'Cannot update a submitted report',
            });
        }

        const updatedReport = await Report.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('project');

        res.json({
            success: true,
            report: updatedReport,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const submitReport = async (req: AuthRequest, res: Response) => {
    try {
        const report = await Report.findOne({
            _id: req.params.id,
            user: req.user?._id,
        });

        if (!report) {
            return res.status(404).json({ message: 'Report not found' });
        }

        if (report.status === 'submitted') {
            return res.status(400).json({ message: 'Report already submitted' });
        }

        report.status = 'submitted';
        report.submittedAt = new Date();
        await report.save();

        res.json({
            success: true,
            report,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};