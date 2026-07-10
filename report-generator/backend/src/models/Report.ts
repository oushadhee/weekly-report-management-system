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
    status: 'draft' | 'submitted' | 'late';
    submittedAt?: Date;
    dueDate?: Date;
    isLate: boolean;
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
            default: 0,
        },
        notes: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['draft', 'submitted', 'late'],
            default: 'draft',
        },
        submittedAt: {
            type: Date,
        },
        dueDate: {
            type: Date,
        },
        isLate: {
            type: Boolean,
            default: false,
        },
    },
    {
        timestamps: true,
    }
);

// Middleware: Check if report is late
ReportSchema.pre('save', function (next) {
    if (this.status === 'draft') {
        const now = new Date();
        const endOfWeek = new Date(this.weekEnd);
        endOfWeek.setHours(23, 59, 59, 999);

        // If current date is after week end, mark as late
        if (now > endOfWeek) {
            this.isLate = true;
            this.status = 'late';
        }
    }
    next();
});

ReportSchema.index({ user: 1, weekStart: 1 }, { unique: true });

export default mongoose.model<IReport>('Report', ReportSchema);