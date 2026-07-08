// backend/src/controllers/managerController.ts
import { Request, Response } from 'express';
import Report from '../models/Report';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';
import mongoose from 'mongoose';

export const getTeamReports = async (req: AuthRequest, res: Response) => {
    try {
        const { weekStart, weekEnd, userId, projectId, status } = req.query;

        const filter: any = {};

        if (weekStart) {
            filter.weekStart = new Date(weekStart as string);
        }

        if (weekEnd) {
            filter.weekEnd = new Date(weekEnd as string);
        }

        if (userId) {
            filter.user = new mongoose.Types.ObjectId(userId as string);
        }

        if (projectId) {
            filter.project = new mongoose.Types.ObjectId(projectId as string);
        }

        if (status) {
            filter.status = status;
        }

        const reports = await Report.find(filter)
            .populate('user', 'name email role')
            .populate('project')
            .sort({ weekStart: -1, createdAt: -1 });

        res.json({
            success: true,
            reports,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
    try {
        const currentWeek = new Date();
        const weekStart = new Date(currentWeek);
        weekStart.setDate(currentWeek.getDate() - currentWeek.getDay());

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);

        // Total team members
        const totalMembers = await User.countDocuments({
            role: { $in: ['team_member', 'manager'] },
        });

        // Reports this week
        const weeklyReports = await Report.find({
            weekStart: { $gte: weekStart, $lte: weekEnd },
        });

        const submittedReports = weeklyReports.filter(
            (r) => r.status === 'submitted'
        );

        // Open blockers
        const allReports = await Report.find({
            status: 'submitted',
        });

        const openBlockers = allReports.filter((r) => r.blockers && r.blockers.length > 0);

        // Reports by project
        const reportsByProject = await Report.aggregate([
            {
                $match: {
                    status: 'submitted',
                },
            },
            {
                $group: {
                    _id: '$project',
                    count: { $sum: 1 },
                },
            },
            {
                $lookup: {
                    from: 'projects',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'project',
                },
            },
            {
                $unwind: '$project',
            },
            {
                $project: {
                    projectName: '$project.name',
                    count: 1,
                },
            },
        ]);

        // Weekly trend (last 8 weeks)
        const trendData = [];
        for (let i = 7; i >= 0; i--) {
            const weekStartDate = new Date(weekStart);
            weekStartDate.setDate(weekStartDate.getDate() - i * 7);

            const weekEndDate = new Date(weekStartDate);
            weekEndDate.setDate(weekStartDate.getDate() + 6);

            const count = await Report.countDocuments({
                weekStart: { $gte: weekStartDate, $lte: weekEndDate },
                status: 'submitted',
            });

            trendData.push({
                week: weekStartDate.toISOString().split('T')[0],
                count,
            });
        }

        res.json({
            success: true,
            stats: {
                totalMembers,
                totalReports: weeklyReports.length,
                submittedReports: submittedReports.length,
                pendingReports: weeklyReports.length - submittedReports.length,
                complianceRate: totalMembers > 0
                    ? ((submittedReports.length / totalMembers) * 100).toFixed(1)
                    : 0,
                openBlockers: openBlockers.length,
                reportsByProject,
                trendData,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getTeamMembers = async (req: AuthRequest, res: Response) => {
    try {
        const members = await User.find({
            role: { $in: ['team_member', 'manager'] },
        })
            .select('name email role projects')
            .populate('projects');

        res.json({
            success: true,
            members,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getSubmissionStatus = async (req: AuthRequest, res: Response) => {
    try {
        const { weekStart } = req.query;

        if (!weekStart) {
            return res.status(400).json({ message: 'weekStart query parameter is required' });
        }

        const startDate = new Date(weekStart as string);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        const members = await User.find({
            role: { $in: ['team_member', 'manager'] },
        }).select('name email');

        const reports = await Report.find({
            weekStart: { $gte: startDate, $lte: endDate },
        }).select('user status');

        const statusMap = new Map();
        reports.forEach((report) => {
            statusMap.set(report.user.toString(), report.status);
        });

        const submissionStatus = members.map((member) => ({
            userId: member._id,
            name: member.name,
            email: member.email,
            status: statusMap.get(member._id.toString()) || 'pending',
        }));

        res.json({
            success: true,
            weekStart: startDate,
            submissionStatus,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};