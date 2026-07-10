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
    user: { _id: string; name: string; email: string; role: string };
    tasksCompleted: string[];
    tasksPlanned: string[];
    blockers: string[];
    hoursWorked: number;
    status: 'draft' | 'submitted';
    submittedAt?: string;
    createdAt: string;
}

interface Project {
    _id: string;
    name: string;
    color: string;
}

interface User {
    _id: string;
    name: string;
    email: string;
}

const AllReports: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [filteredReports, setFilteredReports] = useState<Report[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        employee: '',
        project: '',
        dateRange: '',
        week: '',
        status: '',
    });

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [reports, filters]);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch all reports
            const reportsRes = await axios.get(`${API_URL}/manager/reports`);
            setReports(reportsRes.data.reports);
            setFilteredReports(reportsRes.data.reports);

            // Fetch projects
            const projectsRes = await axios.get(`${API_URL}/projects`);
            setProjects(projectsRes.data.projects);

            // Fetch team members
            const membersRes = await axios.get(`${API_URL}/manager/members`);
            setTeamMembers(membersRes.data.members);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...reports];

        // Filter by Employee
        if (filters.employee) {
            filtered = filtered.filter(r => r.user?._id === filters.employee);
        }

        // Filter by Project
        if (filters.project) {
            filtered = filtered.filter(r => r.project?._id === filters.project);
        }

        // Filter by Status
        if (filters.status) {
            filtered = filtered.filter(r => r.status === filters.status);
        }

        // Filter by Week (compare only date part, not time)
        if (filters.week) {
            const selectedDate = new Date(filters.week);
            const selectedDateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

            filtered = filtered.filter(r => {
                const reportStartDate = new Date(r.weekStart).toISOString().split('T')[0]; // YYYY-MM-DD
                return reportStartDate === selectedDateString;
            });
        }

        // Filter by Date Range (filter reports created on this specific date)
        if (filters.dateRange) {
            const selectedDate = new Date(filters.dateRange);
            const selectedDateString = selectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

            filtered = filtered.filter(r => {
                const reportCreatedDate = new Date(r.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD
                return reportCreatedDate === selectedDateString;
            });
        }

        setFilteredReports(filtered);
    };

    const handleFilterChange = (key: string, value: string) => {
        setFilters({ ...filters, [key]: value });
    };

    const clearFilters = () => {
        setFilters({
            employee: '',
            project: '',
            dateRange: '',
            week: '',
            status: '',
        });
    };

    const getWeekLabel = (weekStart: string, weekEnd: string) => {
        const start = new Date(weekStart);
        const end = new Date(weekEnd);
        return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    };

    const getStatusBadge = (status: string) => {
        if (status === 'submitted') {
            return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Submitted</span>;
        }
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">Draft</span>;
    };

    const handleViewReport = (report: Report) => {
        setSelectedReport(report);
    };

    const closeModal = () => {
        setSelectedReport(null);
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
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">All Reports</h1>
                        <p className="text-gray-600">View and manage all team reports</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Total: {filteredReports.length} reports
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {/* Filters */}
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <div className="flex flex-wrap items-end gap-4">
                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Employee
                            </label>
                            <select
                                value={filters.employee}
                                onChange={(e) => handleFilterChange('employee', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">All Employees</option>
                                {teamMembers.map((member) => (
                                    <option key={member._id} value={member._id}>
                                        {member.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project
                            </label>
                            <select
                                value={filters.project}
                                onChange={(e) => handleFilterChange('project', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">All Projects</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                value={filters.status}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            >
                                <option value="">All Status</option>
                                <option value="submitted">Submitted</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Week Start
                            </label>
                            <input
                                type="date"
                                value={filters.week}
                                onChange={(e) => handleFilterChange('week', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>

                        <div className="flex-1 min-w-[150px]">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Date Range
                            </label>
                            <input
                                type="date"
                                value={filters.dateRange}
                                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            />
                        </div>

                        <button
                            onClick={clearFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                        >
                            Clear Filters
                        </button>
                    </div>

                    {/* Active Filters Display */}
                    {Object.values(filters).some(v => v) && (
                        <div className="mt-3 flex flex-wrap gap-2">
                            {filters.employee && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                    Employee: {teamMembers.find(m => m._id === filters.employee)?.name}
                                </span>
                            )}
                            {filters.project && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                    Project: {projects.find(p => p._id === filters.project)?.name}
                                </span>
                            )}
                            {filters.status && (
                                <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs">
                                    Status: {filters.status}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Reports Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Employee Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Week
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Action
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredReports.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                                            No reports found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-sm font-bold text-primary-600">
                                                        {report.user?.name?.charAt(0) || 'U'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900">
                                                            {report.user?.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-gray-500">
                                                            {report.user?.email || ''}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
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
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(report.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                {report.submittedAt
                                                    ? new Date(report.submittedAt).toLocaleDateString()
                                                    : '-'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => handleViewReport(report)}
                                                    className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm hover:bg-primary-600"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* View Report Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Report Details</h2>
                            <button
                                onClick={closeModal}
                                className="text-gray-500 hover:text-gray-700 text-2xl"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">Employee</p>
                                <p className="font-medium">{selectedReport.user?.name}</p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Week</p>
                                <p className="font-medium">
                                    {getWeekLabel(selectedReport.weekStart, selectedReport.weekEnd)}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Project</p>
                                <span
                                    className="px-2 py-1 text-xs rounded-full text-white"
                                    style={{ backgroundColor: selectedReport.project?.color || '#6366f1' }}
                                >
                                    {selectedReport.project?.name || 'No Project'}
                                </span>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Status</p>
                                {getStatusBadge(selectedReport.status)}
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Tasks Completed</p>
                                <ul className="list-disc list-inside mt-1">
                                    {selectedReport.tasksCompleted.map((task, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">{task}</li>
                                    ))}
                                </ul>
                            </div>

                            <div>
                                <p className="text-sm text-gray-500">Tasks Planned</p>
                                <ul className="list-disc list-inside mt-1">
                                    {selectedReport.tasksPlanned.map((task, idx) => (
                                        <li key={idx} className="text-sm text-gray-700">{task}</li>
                                    ))}
                                </ul>
                            </div>

                            {selectedReport.blockers && selectedReport.blockers.length > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500">Blockers</p>
                                    <ul className="list-disc list-inside mt-1 text-red-600">
                                        {selectedReport.blockers.map((blocker, idx) => (
                                            <li key={idx} className="text-sm">{blocker}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {selectedReport.hoursWorked > 0 && (
                                <div>
                                    <p className="text-sm text-gray-500">Hours Worked</p>
                                    <p className="font-medium">{selectedReport.hoursWorked}h</p>
                                </div>
                            )}

                            {(selectedReport as any).notes && (
                                <div>
                                    <p className="text-sm text-gray-500">Notes</p>
                                    <p className="text-sm text-gray-700">{(selectedReport as any).notes}</p>
                                </div>
                            )}

                            <button
                                onClick={closeModal}
                                className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default AllReports;