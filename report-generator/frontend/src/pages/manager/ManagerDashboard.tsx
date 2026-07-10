import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';
import RecentActivity from '../../components/RecentActivity';
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
    totalMembers: number;
    totalReports: number;
    submittedReports: number;
    pendingReports: number;
    lateReports: number;
    complianceRate: string;
    openBlockers: number;
    reportsByProject: Array<{ projectName: string; count: number }>;
    trendData: Array<{ week: string; count: number }>;
}

const ManagerDashboard: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboardStats();
    }, []);

    // Update the fetchDashboardStats function
    const fetchDashboardStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/dashboard`);
            const data = response.data.stats;

            // Calculate late reports from actual data
            const allReports = response.data.reports || [];
            const lateReports = allReports.filter((r: any) => {
                const weekEnd = new Date(r.weekEnd);
                const now = new Date();
                return r.status === 'draft' && now > weekEnd;
            }).length;

            data.lateReports = lateReports;
            setStats(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch dashboard stats');
        } finally {
            setLoading(false);
        }
    };

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
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
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

    // Chart data
    const trendChartData = {
        labels: stats.trendData.map(d =>
            new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        ),
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
        labels: ['Submitted', 'Pending', 'Late'],
        datasets: [
            {
                data: [stats.submittedReports, stats.pendingReports, stats.lateReports || 0],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: [
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                ],
                borderWidth: 1,
            },
        ],
    };

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
                <p className="text-gray-600">Welcome back, {user?.name}! Here's your team overview</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {/* Card 1: Total Reports This Week */}
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-indigo-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalReports}</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-xl">

                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">This week</p>
                </div>

                {/* Card 2: Pending Reports */}
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pendingReports}</p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center text-xl">

                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Awaiting submission</p>
                </div>

                {/* Card 3: Late Reports */}
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Late Reports</p>
                            <p className="text-2xl font-bold text-red-600 mt-1">{stats.lateReports || 0}</p>
                        </div>
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center text-xl">

                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Overdue submissions</p>
                </div>

                {/* Card 4: Compliance Rate */}
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Compliance</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.complianceRate}%</p>
                        </div>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-xl">

                        </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                        <div
                            className="bg-green-500 rounded-full h-1.5 transition-all duration-500"
                            style={{ width: `${stats.complianceRate}%` }}
                        />
                    </div>
                </div>

                {/* Card 5: Open Blockers */}
                <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-medium text-gray-500 uppercase">Open Blockers</p>
                            <p className="text-2xl font-bold text-purple-600 mt-1">{stats.openBlockers}</p>
                        </div>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-xl">

                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Needs attention</p>
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
                    <div className="flex justify-center">
                        <div className="w-64 h-64">
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
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Total Team Members</span>
                            <span className="font-semibold">{stats.totalMembers}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Reports Submitted</span>
                            <span className="font-semibold text-green-600">{stats.submittedReports}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Pending Reports</span>
                            <span className="font-semibold text-yellow-600">{stats.pendingReports}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Late Reports</span>
                            <span className="font-semibold text-red-600">{stats.lateReports || 0}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-600">Active Projects</span>
                            <span className="font-semibold">{stats.reportsByProject.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-gray-600">Open Blockers</span>
                            <span className="font-semibold text-purple-600">{stats.openBlockers}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="mt-6">
                <RecentActivity />
            </div>
        </Layout>
    );
};

export default ManagerDashboard;