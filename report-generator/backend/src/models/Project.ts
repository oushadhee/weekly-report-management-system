import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    color: string;
    teamMembers: mongoose.Types.ObjectId[];
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: '',
        },
        status: {
            type: String,
            enum: ['active', 'inactive', 'completed'],
            default: 'active',
        },
        color: {
            type: String,
            default: '#6366f1',
        },
        teamMembers: [
            {
                type: Schema.Types.ObjectId,
                ref: 'User',
            },
        ],
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.model<IProject>('Project', ProjectSchema);