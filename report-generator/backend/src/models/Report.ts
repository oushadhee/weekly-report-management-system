// backend/src/models/Report.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
    user: mongoose.Types.ObjectId;
    weekStart: Date;
    weekEnd: Date;
    project: mongoose.Types.ObjectId;
    tasksCompleted: string[];
    tasksPlanned: string[];
    blockers: string[];
    hoursWorked: number;
    notes: string;
    status: 'draft' | 'submitted';
    submittedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const ReportSchema = new Schema<IReport>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        weekStart: {
            type: Date,
            required: true,
        },
        weekEnd: {
            type: Date,
            required: true,
        },
        project: {
            type: Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
        },
        tasksCompleted: [
            {
                type: String,
                required: true,
            },
        ],
        tasksPlanned: [
            {
                type: String,
                required: true,
            },
        ],
        blockers: [
            {
                type: String,
            },
        ],
        hoursWorked: {
            type: Number,
            min: 0,
            max: 168,
        },
        notes: {
            type: String,
        },
        status: {
            type: String,
            enum: ['draft', 'submitted'],
            default: 'draft',
        },
        submittedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

// Ensure unique report per user per week
ReportSchema.index({ user: 1, weekStart: 1 }, { unique: true });

export default mongoose.model<IReport>('Report', ReportSchema);