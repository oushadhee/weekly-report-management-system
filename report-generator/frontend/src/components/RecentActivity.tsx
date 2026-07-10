import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/config';

interface Activity {
    id: string;
    type: 'submitted' | 'edited' | 'created' | 'deleted';
    user: string;
    project: string;
    reportId: string;
    timestamp: string;
    message: string;
}

const RecentActivity: React.FC = () => {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchActivities();
        // Refresh every 30 seconds
        const interval = setInterval(fetchActivities, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchActivities = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/reports?limit=10`);
            const reports = response.data.reports || [];

            // Convert reports to activities
            const activityData: Activity[] = reports.map((report: any) => ({
                id: report._id,
                type: report.status === 'submitted' ? 'submitted' : 'created',
                user: report.user?.name || 'Unknown',
                project: report.project?.name || 'No Project',
                reportId: report._id,
                timestamp: report.submittedAt || report.createdAt,
                message: report.status === 'submitted'
                    ? `${report.user?.name || 'Someone'} submitted a report for ${report.project?.name || 'a project'}`
                    : `${report.user?.name || 'Someone'} created a draft report`
            }));

            setActivities(activityData.slice(0, 10));
        } catch (error) {
            console.error('Failed to fetch activities:', error);
            // Set mock data for demo
            setActivities(getMockActivities());
        } finally {
            setLoading(false);
        }
    };

    const getMockActivities = (): Activity[] => {
        const names = ['John Doe', 'Kasun Perera', 'Nimal Silva', 'Amara Jaya', 'Saman Kumara'];
        const projects = ['Client A', 'Client B', 'Internal Tool', 'Marketing', 'R&D'];
        const types: ('submitted' | 'edited' | 'created')[] = ['submitted', 'edited', 'created'];

        return Array.from({ length: 8 }, (_, i) => ({
            id: `mock-${i}`,
            type: types[i % 3],
            user: names[i % names.length],
            project: projects[i % projects.length],
            reportId: `mock-report-${i}`,
            timestamp: new Date(Date.now() - i * 3600000).toISOString(),
            message: `${names[i % names.length]} ${types[i % 3] === 'submitted' ? 'submitted' :
                types[i % 3] === 'edited' ? 'edited' : 'created'
                } a report for ${projects[i % projects.length]}`
        }));
    };

    const getActivityIcon = (type: string) => {
        switch (type) {
            case 'submitted':
                return '';
            case 'edited':
                return '';
            case 'created':
                return '';
            case 'deleted':
                return '';
            default:
                return '';
        }
    };

    const getActivityColor = (type: string) => {
        switch (type) {
            case 'submitted':
                return 'border-green-500 bg-green-50';
            case 'edited':
                return 'border-blue-500 bg-blue-50';
            case 'created':
                return 'border-yellow-500 bg-yellow-50';
            case 'deleted':
                return 'border-red-500 bg-red-50';
            default:
                return 'border-gray-500 bg-gray-50';
        }
    };

    const getTimeAgo = (timestamp: string) => {
        const diff = Date.now() - new Date(timestamp).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-center items-center h-32">
                    <div className="text-gray-500">Loading activities...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                <span className="text-xs text-gray-500">Live feed</span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
                {activities.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p className="text-gray-500 text-center">No recent activity</p>
                        <p>No recent activity</p>
                    </div>
                ) : (
                    activities.map((activity) => (
                        <div
                            key={activity.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border-l-4 ${getActivityColor(activity.type)} hover:shadow-sm transition`}
                        >
                            <div className="text-2xl flex-shrink-0">
                                {getActivityIcon(activity.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm text-gray-800">
                                    {activity.message}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-gray-500">
                                        {getTimeAgo(activity.timestamp)}
                                    </span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-500">
                                        Project: {activity.project}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RecentActivity;