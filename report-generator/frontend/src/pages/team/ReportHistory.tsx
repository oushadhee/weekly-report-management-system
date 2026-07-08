import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';

interface Report {
    _id: string;
    weekStart: string;
    weekEnd: string;
    project: { _id: string; name: string; color: string };
    tasksCompleted: string[];
    tasksPlanned: string[];
    blockers: string[];
    hoursWorked: number;
    notes: string;
    status: 'draft' | 'submitted';
    submittedAt?: string;
    createdAt: string;
}

const ReportHistory: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports`);
            setReports(response.data.reports);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };

    const getWeekLabel = (weekStart: string, weekEnd: string) => {
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'submitted') {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">✅ Submitted</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">📝 Draft</span>;
    };

    const filteredReports = filterStatus === 'all'
        ? reports
        : reports.filter(r => r.status === filterStatus);

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading report history...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📜 Report History</h1>
                        <p className="text-gray-600">View all your past reports</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <label className="text-sm text-gray-600">Filter:</label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                        >
                            <option value="all">All Reports</option>
                            <option value="submitted">Submitted</option>
                            <option value="draft">Drafts</option>
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-4xl mb-4">📭</p>
                        <p className="text-gray-500">No reports yet. Create your first weekly report!</p>
                    </div>
                ) : (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Week
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Project
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Tasks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Submission Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {getWeekLabel(report.weekStart, report.weekEnd)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className="px-2 py-1 text-xs rounded-full text-white"
                                                    style={{ backgroundColor: report.project?.color || '#6366f1' }}
                                                >
                                                    {report.project?.name || 'No Project'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {report.tasksCompleted.length} completed
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {report.submittedAt
                                                    ? new Date(report.submittedAt).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.status)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                {reports.length > 0 && (
                    <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white shadow-md rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-indigo-600">{reports.length}</p>
                            <p className="text-sm text-gray-600">Total Reports</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-green-600">
                                {reports.filter(r => r.status === 'submitted').length}
                            </p>
                            <p className="text-sm text-gray-600">Submitted</p>
                        </div>
                        <div className="bg-white shadow-md rounded-lg p-4 text-center">
                            <p className="text-2xl font-bold text-yellow-600">
                                {reports.filter(r => r.status === 'draft').length}
                            </p>
                            <p className="text-sm text-gray-600">Pending</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default ReportHistory;