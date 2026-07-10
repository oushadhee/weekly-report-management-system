import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export interface AuthRequest extends Request {
    user?: IUser;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        let token;

        // Check for token in cookies first
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }
        // Check for token in Authorization header (for mobile/API clients)
        else if (req.header('Authorization')?.startsWith('Bearer ')) {
            token = req.header('Authorization')?.replace('Bearer ', '');
        }

        if (!token) {
            return res.status(401).json({ message: 'Please authenticate' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
            id: string;
        };
        const user = await User.findById(decoded.id);

        if (!user) {
            return res.status(401).json({ message: 'Please authenticate' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Please authenticate' });
    }
};

export const authorize = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                message: `User role ${req.user.role} is not authorized to access this route`,
            });
        }

        next();
    };
};