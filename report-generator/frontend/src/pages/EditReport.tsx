import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import Layout from '../components/Layout';

interface Project {
    _id: string;
    name: string;
    color: string;
}

interface Report {
    _id: string;
    weekStart: string;
    weekEnd: string;
    project: string | Project;
    tasksCompleted: string[];
    tasksPlanned: string[];
    blockers: string[];
    hoursWorked: number;
    notes: string;
    status: 'draft' | 'submitted';
}

const EditReport: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState<Report>({
        _id: '',
        weekStart: '',
        weekEnd: '',
        project: '',
        tasksCompleted: [''],
        tasksPlanned: [''],
        blockers: [''],
        hoursWorked: 0,
        notes: '',
        status: 'draft',
    });

    useEffect(() => {
        fetchReport();
        fetchProjects();
    }, [id]);

    const fetchReport = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports/${id}`);
            const report = response.data.report;

            if (report.status === 'submitted') {
                setError('This report has already been submitted and cannot be edited.');
                setLoading(false);
                return;
            }

            const projectId = typeof report.project === 'object' ? report.project._id : report.project;

            setFormData({
                _id: report._id,
                weekStart: report.weekStart.split('T')[0],
                weekEnd: report.weekEnd.split('T')[0],
                project: projectId,
                tasksCompleted: report.tasksCompleted.length > 0 ? report.tasksCompleted : [''],
                tasksPlanned: report.tasksPlanned.length > 0 ? report.tasksPlanned : [''],
                blockers: report.blockers.length > 0 ? report.blockers : [''],
                hoursWorked: report.hoursWorked || 0,
                notes: report.notes || '',
                status: report.status,
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch report');
        } finally {
            setLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects`);
            setProjects(response.data.projects);
        } catch (error) {
            console.error('Failed to fetch projects:', error);
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

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        const reportData = {
            ...formData,
            tasksCompleted: formData.tasksCompleted.filter(t => t.trim()),
            tasksPlanned: formData.tasksPlanned.filter(t => t.trim()),
            blockers: formData.blockers.filter(b => b.trim()),
        };

        try {
            await axios.put(`${API_URL}/reports/${id}`, reportData);
            setSuccess('Report updated successfully!');
            setTimeout(() => {
                navigate('/my-reports');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update report');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`${API_URL}/reports/${id}/submit`);
            setSuccess('Report submitted successfully!');
            setTimeout(() => {
                navigate('/my-reports');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit report');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading report...</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
                    <button
                        onClick={() => navigate('/my-reports')}
                        className="text-gray-600 hover:text-gray-900"
                    >
                        Back to Reports
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg mb-4">
                        {success}
                    </div>
                )}

                {formData.status === 'submitted' ? (
                    <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                        This report has already been submitted and cannot be edited.
                    </div>
                ) : (
                    <form onSubmit={handleUpdate} className="bg-white shadow-md rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Week Start *
                                </label>
                                <input
                                    type="date"
                                    name="weekStart"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
                                    value={formData.weekStart}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Week End *
                                </label>
                                <input
                                    type="date"
                                    name="weekEnd"
                                    required
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
                                    value={formData.weekEnd}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Project *
                            </label>
                            <select
                                name="project"
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
                                value={formData.project as string}
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

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasks Completed *
                            </label>
                            {formData.tasksCompleted.map((task, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => handleArrayInputChange(index, 'tasksCompleted', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
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
                                className="text-sm text-[#549E7E] hover:text-[#386B55]"
                            >
                                + Add task
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Tasks Planned for Next Week *
                            </label>
                            {formData.tasksPlanned.map((task, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => handleArrayInputChange(index, 'tasksPlanned', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
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
                                className="text-sm text-[#549E7E] hover:text-[#386B55]"
                            >
                                + Add planned task
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Blockers / Challenges
                            </label>
                            {formData.blockers.map((blocker, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={blocker}
                                        onChange={(e) => handleArrayInputChange(index, 'blockers', e.target.value)}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
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
                                className="text-sm text-[#549E7E] hover:text-[#386B55]"
                            >
                                + Add blocker
                            </button>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hours Worked
                            </label>
                            <input
                                type="number"
                                name="hoursWorked"
                                min="0"
                                max="168"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
                                value={formData.hoursWorked}
                                onChange={handleInputChange}
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes / Links
                            </label>
                            <textarea
                                name="notes"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E]"
                                value={formData.notes}
                                onChange={handleInputChange}
                                placeholder="Additional notes or links"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-[#386B55] text-white px-6 py-2 rounded-lg hover:bg-[#284D3D] disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Update Report'}
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading}
                                className="bg-[#549E7E] text-white px-6 py-2 rounded-lg hover:bg-[#48896D] disabled:opacity-50"
                            >
                                Submit Report
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/my-reports')}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Layout>
    );
};

export default EditReport;