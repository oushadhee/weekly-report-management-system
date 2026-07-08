// frontend/src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../utils/config';
import Layout from '../components/Layout';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DashboardStats {
    stats: {
        totalMembers: number;
        totalReports: number;
        submittedReports: number;
        pendingReports: number;
        complianceRate: string;
        openBlockers: number;
        reportsByProject: Array<{ projectName: string; count: number }>;
        trendData: Array<{ week: string; count: number }>;
    };
}

const Dashboard: React.FC = () => {
    const { isManager } = useAuth();
    const [stats, setStats] = useState<DashboardStats['stats'] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isManager) {
            fetchDashboardStats();
        }
    }, [isManager]);

    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/dashboard`);
            setStats(response.data.stats);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
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

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading dashboard...</div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </Layout>
        );
    }

    if (!stats) {
        return (
            <Layout>
                <div className="text-center py-12">
                    <p className="text-gray-500">No data available</p>
                </div>
            </Layout>
        );
    }

    // Chart data configurations
    const trendChartData = {
        labels: stats.trendData.map(d => new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Weekly Reports Submitted',
                data: stats.trendData.map(d => d.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    const projectChartData = {
        labels: stats.reportsByProject.map(p => p.projectName),
        datasets: [
            {
                label: 'Reports by Project',
                data: stats.reportsByProject.map(p => p.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const submissionChartData = {
        labels: ['Submitted', 'Pending'],
        datasets: [
            {
                data: [stats.submittedReports, stats.pendingReports],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
                borderColor: ['rgb(16, 185, 129)', 'rgb(245, 158, 11)'],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Team Dashboard</h1>
                <p className="text-gray-600">Overview of team performance and reports</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500">Team Members</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalMembers}</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500">Reports This Week</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalReports}</p>
                    <p className="text-sm text-gray-600 mt-1">{stats.submittedReports} submitted</p>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500">Compliance Rate</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{stats.complianceRate}%</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                            className="bg-indigo-600 rounded-full h-2"
                            style={{ width: `${stats.complianceRate}%` }}
                        />
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-sm font-medium text-gray-500">Open Blockers</h3>
                    <p className="text-2xl font-bold text-red-600 mt-2">{stats.openBlockers}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Trend</h3>
                    <Line
                        data={trendChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1,
                                    },
                                },
                            },
                        }}
                    />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Reports by Project</h3>
                    <Bar
                        data={projectChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    display: false,
                                },
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: {
                                        stepSize: 1,
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Submission Status</h3>
                    <Doughnut
                        data={submissionChartData}
                        options={{
                            responsive: true,
                            plugins: {
                                legend: {
                                    position: 'bottom',
                                },
                            },
                        }}
                    />
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Total Reports Submitted</span>
                            <span className="font-semibold">{stats.submittedReports}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Pending Reports</span>
                            <span className="font-semibold">{stats.pendingReports}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Active Projects</span>
                            <span className="font-semibold">{stats.reportsByProject.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Most Active Project</span>
                            <span className="font-semibold">
                                {stats.reportsByProject.length > 0
                                    ? stats.reportsByProject.reduce((a, b) => a.count > b.count ? a : b).projectName
                                    : 'N/A'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;