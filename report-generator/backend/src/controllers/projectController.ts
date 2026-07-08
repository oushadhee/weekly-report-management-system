import { Request, Response } from 'express';
import Project from '../models/Project';
import { AuthRequest } from '../middleware/auth';

export const createProject = async (req: AuthRequest, res: Response) => {
    try {
        const { name, description, color } = req.body;

        const project = await Project.create({
            name,
            description,
            color,
            createdBy: req.user?._id,
        });

        res.status(201).json({
            success: true,
            project,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjects = async (req: AuthRequest, res: Response) => {
    try {
        const projects = await Project.find()
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email');

        res.json({
            success: true,
            projects,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('createdBy', 'name email')
            .populate('teamMembers', 'name email');

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        res.json({
            success: true,
            project,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json({
            success: true,
            project: updatedProject,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await project.deleteOne();

        res.json({
            success: true,
            message: 'Project deleted successfully',
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const assignTeamMembers = async (req: AuthRequest, res: Response) => {
    try {
        const { teamMembers } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        project.teamMembers = teamMembers;
        await project.save();

        res.json({
            success: true,
            project,
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};