import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (id: string) => {
    return jwt.sign({ id }, process.env.JWT_SECRET!, {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// Set cookie options
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password, role } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'team_member',
        });

        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        // Set cookie
        res.cookie('token', token, cookieOptions);

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req: Request, res: Response) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req: AuthRequest, res: Response) => {
    try {
        const user = await User.findById(req.user?._id).populate('projects');
        res.json({ success: true, user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};