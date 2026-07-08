import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from the correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

// Also try this if above doesn't work
// dotenv.config();

import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import projectRoutes from './routes/projectRoutes';
import managerRoutes from './routes/managerRoutes';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 5000;

// Debug: Check if .env is loaded
console.log('🔍 Environment variables loaded:');
console.log('PORT:', process.env.PORT);
console.log('MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Not found');

// Use the MongoDB URI from .env
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly_reports';

console.log('📊 Using MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@')); // Hide password in logs

// Middleware
app.use(helmet());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/manager', managerRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
    });
});

// Error handling
app.use(errorHandler);

// Database connection
mongoose
    .connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB connected successfully');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Make sure your .env file has MONGODB_URI');
        process.exit(1);
    });