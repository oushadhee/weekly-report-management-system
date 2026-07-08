import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config({ path: path.join(__dirname, '../.env') });

import authRoutes from './routes/authRoutes';
import reportRoutes from './routes/reportRoutes';
import projectRoutes from './routes/projectRoutes';
import managerRoutes from './routes/managerRoutes';
import { errorHandler } from './middleware/error';

const app = express();
const PORT = process.env.PORT || 5002;

console.log('🔍 Environment Check:');
console.log('  PORT:', process.env.PORT || '5002');
console.log('  MONGODB_URI:', process.env.MONGODB_URI ? '✅ Found' : '❌ Not found');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/weekly_reports';

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

// Database connection with SSL options
console.log('🔗 Connecting to MongoDB Atlas...');

mongoose
    .connect(MONGODB_URI, {
        // SSL/TLS options
        ssl: true,
        tlsAllowInvalidCertificates: true,  // Development only
        tlsAllowInvalidHostnames: true,     // Development only
        retryWrites: true,
        w: 'majority',
    })
    .then(() => {
        console.log('✅ MongoDB Atlas connected successfully!');
        console.log('📊 Database:', mongoose.connection.db?.databaseName || 'Unknown');
        app.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
        });
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error.message);
        console.log('💡 Trying alternative connection method...');
        // Try without SSL options
        mongoose
            .connect(MONGODB_URI)
            .then(() => {
                console.log('✅ MongoDB Atlas connected successfully (without SSL options)!');
                app.listen(PORT, () => {
                    console.log(`🚀 Server running on port ${PORT}`);
                });
            })
            .catch((err) => {
                console.error('❌ MongoDB connection failed:', err.message);
                process.exit(1);
            });
    });