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
    status: 'draft' | 'submitted' | 'late';
    submittedAt?: string;
    createdAt: string;
}

const MyReports: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [success, setSuccess] = useState('');
    const [expandedReport, setExpandedReport] = useState<string | null>(null);

    useEffect(() => {
        fetchReports();
    }, []);

    useEffect(() => {
        if (Array.isArray(reports) && reports.length > 0) {
            applyFilters();
        } else {
            setFilteredReports([]);
        }
    }, [reports, filterStatus]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/reports`);
            console.log('📊 Reports from API:', response.data);

            const reportsData = Array.isArray(response.data.reports) ? response.data.reports : [];

            const formattedReports: Report[] = reportsData.map((r: any) => ({
                ...r,
                status: r.status || 'draft',
                tasksCompleted: Array.isArray(r.tasksCompleted) ? r.tasksCompleted : [],
                tasksPlanned: Array.isArray(r.tasksPlanned) ? r.tasksPlanned : [],
                blockers: Array.isArray(r.blockers) ? r.blockers : [],
                project: r.project || { _id: '', name: 'No Project', color: '#549E7E' }
            }));

            setReports(formattedReports);
            setFilteredReports(formattedReports);
        } catch (err: any) {
            console.error('❌ Error fetching reports:', err);
            setError(err.response?.data?.message || 'Failed to fetch reports');
            setReports([]);
            setFilteredReports([]);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        if (!Array.isArray(reports)) {
            setFilteredReports([]);
            return;
        }

        let filtered = [...reports];

        if (filterStatus === 'submitted') {
            filtered = filtered.filter(r => r.status === 'submitted');
        } else if (filterStatus === 'draft') {
            filtered = filtered.filter(r => r.status === 'draft');
        } else if (filterStatus === 'late') {
            filtered = filtered.filter(r => r.status === 'late');
        }

        setFilteredReports(filtered);
    };

    const handleSubmitReport = async (reportId: string) => {
        if (!window.confirm('Are you sure you want to submit this report?')) {
            return;
        }

        try {
            setLoading(true);
            const response = await axios.put(`${API_URL}/reports/${reportId}/submit`);
            console.log('✅ Submit response:', response.data);

            const updatedReport = response.data.report;

            const updatedReports: Report[] = reports.map((r: Report) => {
                if (r._id === reportId) {
                    return {
                        ...r,
                        status: 'submitted' as 'submitted',
                        submittedAt: updatedReport.submittedAt || new Date().toISOString()
                    };
                }
                return r;
            });

            setReports(updatedReports);
            setSuccess('Report submitted successfully!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteReport = async (reportId: string) => {
        if (!window.confirm('Are you sure you want to delete this draft report? This action cannot be undone.')) {
            return;
        }

        try {
            setLoading(true);
            await axios.delete(`${API_URL}/reports/${reportId}`);

            const updatedReports: Report[] = reports.filter((r: Report) => r._id !== reportId);
            setReports(updatedReports);
            setSuccess('Report deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete report');
            setTimeout(() => setError(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (reportId: string) => {
        setExpandedReport(expandedReport === reportId ? null : reportId);
    };

    const getWeekLabel = (weekStart: string, weekEnd: string) => {
        try {
            const start = new Date(weekStart);
            const end = new Date(weekEnd);
            return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'submitted':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                        Submitted
                    </span>
                );
            case 'late':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        Late
                    </span>
                );
            case 'draft':
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                        Draft
                    </span>
                );
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'submitted': return 'submitted';
            case 'late': return 'late';
            case 'draft': return 'draft';
            default: return 'draft';
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex flex-col items-center justify-center h-64">
                    <div className="w-12 h-12 border-4 border-[#549E7E] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 mt-4">Loading reports...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
                    <p className="text-gray-500 text-sm">Manage and track your weekly reports</p>
                </div>
                <button
                    onClick={() => navigate('/create-report')}
                    className="bg-[#549E7E] text-white px-5 py-2.5 rounded-lg hover:bg-[#48896D] transition shadow-sm flex items-center gap-2"
                >
                    <span className="text-lg">+</span>
                    New Report
                </button>
            </div>

            {/* Success/Error Messages */}
            {success && (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">

                    {success}
                </div>
            )}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">

                    {error}
                </div>
            )}

            {/* Filter Section */}
            <div className="bg-white shadow-sm border border-gray-100 rounded-xl p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E] text-sm bg-gray-50"
                        >
                            <option value="all">All Reports</option>
                            <option value="submitted">Submitted</option>
                            <option value="draft">Draft</option>
                            <option value="late">Late</option>
                        </select>
                    </div>

                    {filterStatus !== 'all' && (
                        <button
                            onClick={() => setFilterStatus('all')}
                            className="text-sm text-[#549E7E] hover:text-[#386B55] font-medium"
                        >
                            Clear Filter ✕
                        </button>
                    )}

                    <div className="ml-auto text-sm text-gray-500">
                        Showing <span className="font-medium text-gray-700">{filteredReports.length}</span> of{' '}
                        <span className="font-medium text-gray-700">{reports.length}</span> reports
                    </div>
                </div>
            </div>

            {/* Reports List */}
            <div className="space-y-4">
                {(!Array.isArray(filteredReports) || filteredReports.length === 0) ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">

                        <p className="text-gray-500 text-lg">
                            {!Array.isArray(reports) || reports.length === 0
                                ? 'No reports yet. Create your first weekly report!'
                                : 'No reports match the selected filter.'}
                        </p>
                        {(!Array.isArray(reports) || reports.length === 0) && (
                            <button
                                onClick={() => navigate('/create-report')}
                                className="mt-4 bg-[#549E7E] text-white px-6 py-2 rounded-lg hover:bg-[#48896D] transition"
                            >
                                Create Report
                            </button>
                        )}
                    </div>
                ) : (
                    filteredReports.map((report) => {
                        const isExpanded = expandedReport === report._id;
                        return (
                            <div
                                key={report._id}
                                className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200 overflow-hidden"
                            >
                                {/* Report Header - Click to Expand */}
                                <div
                                    className="p-5 cursor-pointer hover:bg-gray-50/50 transition"
                                    onClick={() => toggleExpand(report._id)}
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {getWeekLabel(report.weekStart, report.weekEnd)}
                                                </h3>
                                                <span
                                                    className="px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                                                    style={{ backgroundColor: report.project?.color || '#549E7E' }}
                                                >
                                                    {report.project?.name || 'No Project'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                                {getStatusBadge(report.status)}
                                                {report.submittedAt && (
                                                    <span className="text-xs text-gray-400 flex items-center gap-1">

                                                        {new Date(report.submittedAt).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {/* Action Buttons */}
                                            {report.status !== 'submitted' && (
                                                <>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleSubmitReport(report._id);
                                                        }}
                                                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-green-700 transition shadow-sm flex items-center gap-1"
                                                    >
                                                        Submit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            navigate(`/edit-report/${report._id}`);
                                                        }}
                                                        className="bg-[#386B55] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#284D3D] transition shadow-sm flex items-center gap-1"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeleteReport(report._id);
                                                        }}
                                                        className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-red-700 transition shadow-sm flex items-center gap-1"
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                            {report.status === 'submitted' && (
                                                <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                                    View Only
                                                </span>
                                            )}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleExpand(report._id);
                                                }}
                                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
                                            >
                                                <svg
                                                    className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Report Details - Expandable */}
                                {isExpanded && (
                                    <div className="border-t border-gray-100 bg-gray-50/50 p-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    Tasks Completed
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {Array.isArray(report.tasksCompleted) && report.tasksCompleted.length > 0 ? (
                                                        report.tasksCompleted.map((task, idx) => (
                                                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="text-[#549E7E] mt-0.5">•</span>
                                                                {task}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-sm text-gray-400">No tasks recorded</li>
                                                    )}
                                                </ul>
                                            </div>

                                            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                                                    Tasks Planned
                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {Array.isArray(report.tasksPlanned) && report.tasksPlanned.length > 0 ? (
                                                        report.tasksPlanned.map((task, idx) => (
                                                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="text-[#386B55] mt-0.5">•</span>
                                                                {task}
                                                            </li>
                                                        ))
                                                    ) : (
                                                        <li className="text-sm text-gray-400">No tasks planned</li>
                                                    )}
                                                </ul>
                                            </div>
                                        </div>

                                        {/* Blockers */}
                                        {Array.isArray(report.blockers) && report.blockers.length > 0 && (
                                            <div className="mt-4 bg-red-50 border border-red-100 rounded-lg p-4">
                                                <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center gap-2">

                                                </h4>
                                                <ul className="space-y-1.5">
                                                    {report.blockers.map((blocker, idx) => (
                                                        <li key={idx} className="text-sm text-red-600 flex items-start gap-2">
                                                            <span className="text-red-400 mt-0.5">•</span>
                                                            {blocker}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Additional Info */}
                                        {(report.hoursWorked > 0 || report.notes) && (
                                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {report.hoursWorked > 0 && (
                                                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex items-center gap-3">

                                                        <div>
                                                            <p className="text-xs text-gray-500">Hours Worked</p>
                                                            <p className="font-semibold text-gray-800">{report.hoursWorked}h</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {report.notes && (
                                                    <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                                                        <p className="text-xs text-gray-500">Notes</p>
                                                        <p className="text-sm text-gray-700">{report.notes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer Stats */}
            {reports.length > 0 && (
                <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-[#549E7E]">{reports.length}</p>
                        <p className="text-xs text-gray-500">Total Reports</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {reports.filter(r => r.status === 'submitted').length}
                        </p>
                        <p className="text-xs text-gray-500">Submitted</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">
                            {reports.filter(r => r.status === 'draft').length}
                        </p>
                        <p className="text-xs text-gray-500">Draft</p>
                    </div>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
                        <p className="text-2xl font-bold text-red-600">
                            {reports.filter(r => r.status === 'late').length}
                        </p>
                        <p className="text-xs text-gray-500">Late</p>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default MyReports;