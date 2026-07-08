import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';

interface Project {
    _id: string;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'completed';
    color: string;
    teamMembers: any[];
    createdBy: any;
    createdAt: string;
    updatedAt: string;
}

const Projects: React.FC = () => {
    const { isManager } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Modal states
    const [showModal, setShowModal] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

    // Form data
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: 'active' as 'active' | 'inactive' | 'completed',
        color: '#6366f1',
    });

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await axios.get(`${API_URL}/projects`);
            setProjects(response.data.projects);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch projects');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const resetForm = () => {
        setFormData({
            name: '',
            description: '',
            status: 'active',
            color: '#6366f1',
        });
        setEditingProject(null);
        setError('');
        setSuccess('');
    };

    const openCreateModal = () => {
        resetForm();
        setShowModal(true);
    };

    const openEditModal = (project: Project) => {
        setEditingProject(project);
        setFormData({
            name: project.name,
            description: project.description || '',
            status: project.status,
            color: project.color || '#6366f1',
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            if (editingProject) {
                // Update project
                const response = await axios.put(
                    `${API_URL}/projects/${editingProject._id}`,
                    formData
                );
                setProjects(projects.map(p =>
                    p._id === editingProject._id ? response.data.project : p
                ));
                setSuccess('Project updated successfully!');
            } else {
                // Create project
                const response = await axios.post(`${API_URL}/projects`, formData);
                setProjects([response.data.project, ...projects]);
                setSuccess('Project created successfully!');
            }

            setTimeout(() => {
                setShowModal(false);
                resetForm();
                setSuccess('');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        try {
            await axios.delete(`${API_URL}/projects/${projectId}`);
            setProjects(projects.filter(p => p._id !== projectId));
            setSuccess('Project deleted successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete project');
            setTimeout(() => setError(''), 3000);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">🟢 Active</span>;
            case 'inactive':
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">⚪ Inactive</span>;
            case 'completed':
                return <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">🔵 Completed</span>;
            default:
                return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    if (!isManager) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <h2 className="text-2xl font-bold text-red-600">Access Denied</h2>
                    <p className="text-gray-600 mt-2">You need manager privileges to view this page.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📁 Projects</h1>
                        <p className="text-gray-600">Manage your team projects and categories</p>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                    >
                        <span className="text-xl">+</span> Add Project
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

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project._id}
                            className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-4 h-4 rounded-full flex-shrink-0"
                                        style={{ backgroundColor: project.color || '#6366f1' }}
                                    />
                                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => openEditModal(project)}
                                        className="text-blue-600 hover:text-blue-800 text-sm"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(project._id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>

                            {project.description && (
                                <p className="text-gray-600 text-sm mb-3">{project.description}</p>
                            )}

                            <div className="flex items-center justify-between">
                                {getStatusBadge(project.status)}
                                <span className="text-xs text-gray-500">
                                    {project.teamMembers?.length || 0} members
                                </span>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-400">
                                Created: {new Date(project.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

                {projects.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-4xl mb-4">📂</p>
                        <p className="text-gray-500">No projects yet. Create your first project!</p>
                    </div>
                )}

                {/* Add/Edit Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-md w-full p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingProject ? '✏️ Edit Project' : '📁 Add New Project'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowModal(false);
                                        resetForm();
                                    }}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ✕
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Project Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="name"
                                            required
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter project name"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Description
                                        </label>
                                        <textarea
                                            name="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                            placeholder="Enter project description"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Status
                                        </label>
                                        <select
                                            name="status"
                                            value={formData.status}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        >
                                            <option value="active">🟢 Active</option>
                                            <option value="inactive">⚪ Inactive</option>
                                            <option value="completed">🔵 Completed</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Color
                                        </label>
                                        <input
                                            type="color"
                                            name="color"
                                            value={formData.color}
                                            onChange={handleInputChange}
                                            className="w-20 h-10 border border-gray-300 rounded-lg cursor-pointer"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Projects;