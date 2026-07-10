import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import Layout from '../components/Layout';

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

const MyReports: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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

    const handleSubmitReport = async (reportId: string) => {
        try {
            const response = await axios.put(`${API_URL}/reports/${reportId}/submit`);
            const updatedReport = response.data.report;
            setReports(reports.map(r => r._id === reportId ? updatedReport : r));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report');
        }
    };

    const getWeekLabel = (weekStart: string, weekEnd: string) => {
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading reports...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                <button
                    onClick={() => navigate('/create-report')}
                    className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                    + New Report
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                {reports.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500">No reports yet. Create your first weekly report!</p>
                    </div>
                ) : (
                    reports.map((report) => (
                        <div key={report._id} className="bg-white shadow-md rounded-lg p-6">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {getWeekLabel(report.weekStart, report.weekEnd)}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span
                                            className="px-2 py-1 text-xs rounded-full text-white"
                                            style={{ backgroundColor: report.project?.color || '#6366f1' }}
                                        >
                                            {report.project?.name || 'No Project'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${report.status === 'submitted'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status === 'submitted' ? 'Submitted' : 'Draft'}
                                        </span>
                                        {report.submittedAt && (
                                            <span className="text-xs text-gray-500">
                                                Submitted: {new Date(report.submittedAt).toLocaleDateString()}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {report.status === 'draft' && (
                                        <>
                                            <button
                                                onClick={() => handleSubmitReport(report._id)}
                                                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700"
                                            >
                                                Submit
                                            </button>
                                            <button
                                                onClick={() => navigate(`/edit-report/${report._id}`)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                                            >
                                                Edit
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Tasks Completed</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {report.tasksCompleted.map((task, idx) => (
                                            <li key={idx} className="text-sm">{task}</li>
                                        ))}
                                        {report.tasksCompleted.length === 0 && (
                                            <li className="text-sm text-gray-400">No tasks recorded</li>
                                        )}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="font-medium text-gray-700 mb-1">Tasks Planned</h4>
                                    <ul className="list-disc list-inside space-y-1 text-gray-600">
                                        {report.tasksPlanned.map((task, idx) => (
                                            <li key={idx} className="text-sm">{task}</li>
                                        ))}
                                        {report.tasksPlanned.length === 0 && (
                                            <li className="text-sm text-gray-400">No tasks planned</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {report.blockers && report.blockers.length > 0 && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-700 mb-1">Blockers</h4>
                                    <ul className="list-disc list-inside space-y-1 text-red-600">
                                        {report.blockers.map((blocker, idx) => (
                                            <li key={idx} className="text-sm">{blocker}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {(report.hoursWorked > 0 || report.notes) && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    {report.hoursWorked > 0 && (
                                        <p className="text-sm text-gray-600">Hours: {report.hoursWorked}h</p>
                                    )}
                                    {report.notes && (
                                        <p className="text-sm text-gray-600 mt-1">{report.notes}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Layout>
    );
};

export default MyReports;