// frontend/src/pages/MyReports.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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

interface Project {
    _id: string;
    name: string;
    color: string;
}

const MyReports: React.FC = () => {
    const { user, isManager } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        weekStart: '',
        weekEnd: '',
        project: '',
        tasksCompleted: [''],
        tasksPlanned: [''],
        blockers: [''],
        hoursWorked: 0,
        notes: '',
    });

    useEffect(() => {
        fetchReports();
        fetchProjects();
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

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects`);
            setProjects(response.data.projects);
        } catch (err: any) {
            console.error('Failed to fetch projects:', err);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleArrayInputChange = (index: number, field: 'tasksCompleted' | 'tasksPlanned' | 'blockers', value: string) => {
        const newArray = [...formData[field]];
        newArray[index] = value;
        setFormData({ ...formData, [field]: newArray });
    };

    const addArrayItem = (field: 'tasksCompleted' | 'tasksPlanned' | 'blockers') => {
        setFormData({ ...formData, [field]: [...formData[field], ''] });
    };

    const removeArrayItem = (index: number, field: 'tasksCompleted' | 'tasksPlanned' | 'blockers') => {
        const newArray = formData[field].filter((_, i) => i !== index);
        setFormData({ ...formData, [field]: newArray });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const reportData = {
            ...formData,
            tasksCompleted: formData.tasksCompleted.filter(t => t.trim()),
            tasksPlanned: formData.tasksPlanned.filter(t => t.trim()),
            blockers: formData.blockers.filter(b => b.trim()),
        };

        try {
            const response = await axios.post(`${API_URL}/reports`, reportData);
            setReports([response.data.report, ...reports]);
            setShowCreateForm(false);
            setFormData({
                weekStart: '',
                weekEnd: '',
                project: '',
                tasksCompleted: [''],
                tasksPlanned: [''],
                blockers: [''],
                hoursWorked: 0,
                notes: '',
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create report');
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

    if (loading && reports.length === 0) {
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
                <h1 className="text-2xl font-bold text-gray-900">My Weekly Reports</h1>
                {!showCreateForm && (
                    <button
                        onClick={() => setShowCreateForm(true)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        New Report
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {showCreateForm && (
                <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Create Weekly Report</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Week Start
                                </label>
                                <input
                                    type="date"
                                    name="weekStart"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.weekStart}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Week End
                                </label>
                                <input
                                    type="date"
                                    name="weekEnd"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    value={formData.weekEnd}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project
                            </label>
                            <select
                                name="project"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.project}
                                onChange={handleInputChange}
                            >
                                <option value="">Select a project</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasks Completed
                            </label>
                            {formData.tasksCompleted.map((task, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => handleArrayInputChange(index, 'tasksCompleted', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter completed task"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(index, 'tasksCompleted')}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('tasksCompleted')}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                + Add task
                            </button>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasks Planned for Next Week
                            </label>
                            {formData.tasksPlanned.map((task, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => handleArrayInputChange(index, 'tasksPlanned', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter planned task"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(index, 'tasksPlanned')}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('tasksPlanned')}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                + Add planned task
                            </button>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Blockers / Challenges
                            </label>
                            {formData.blockers.map((blocker, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={blocker}
                                        onChange={(e) => handleArrayInputChange(index, 'blockers', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="Enter blocker"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeArrayItem(index, 'blockers')}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        Remove
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => addArrayItem('blockers')}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                            >
                                + Add blocker
                            </button>
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hours Worked
                            </label>
                            <input
                                type="number"
                                name="hoursWorked"
                                min="0"
                                max="168"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.hoursWorked}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes / Links
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Additional notes or links"
                            />
                        </div>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="submit"
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                            >
                                Save Draft
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCreateForm(false)}
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
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
                                            className="px-2 py-1 text-xs rounded-full"
                                            style={{
                                                backgroundColor: report.project?.color || '#6366f1',
                                                color: 'white',
                                            }}
                                        >
                                            {report.project?.name || 'No Project'}
                                        </span>
                                        <span className={`px-2 py-1 text-xs rounded-full ${report.status === 'submitted'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {report.status}
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
                                                onClick={() => {/* Navigate to edit */ }}
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