import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';
import { Line, Bar, Doughnut, Pie, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    RadialLinearScale,
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
    RadialLinearScale,
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
    memberActivity?: Array<{ name: string; count: number }>;
}

const Charts: React.FC = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeRange, setTimeRange] = useState('8');

    useEffect(() => {
        fetchStats();
    }, [timeRange]);

    const fetchStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/manager/dashboard`);
            const data = response.data.stats;

            // Add member activity data
            data.memberActivity = [
                { name: 'John Doe', count: 8 },
                { name: 'Kasun Perera', count: 6 },
                { name: 'Nimal Silva', count: 5 },
                { name: 'Amara Jaya', count: 4 },
                { name: 'Saman Kumara', count: 3 },
            ];

            setStats(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to fetch stats');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="flex justify-center items-center h-64">
                    <div className="text-gray-500">Loading charts...</div>
                </div>
            </Layout>
        );
    }

    if (error || !stats) {
        return (
            <Layout>
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                    {error || 'No data available'}
                </div>
            </Layout>
        );
    }

    // Chart: Submission Trend
    const trendChartData = {
        labels: stats.trendData.map(d => new Date(d.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })),
        datasets: [
            {
                label: 'Reports Submitted',
                data: stats.trendData.map(d => d.count),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Chart: Reports by Project
    const projectChartData = {
        labels: stats.reportsByProject.map(p => p.projectName),
        datasets: [
            {
                label: 'Reports',
                data: stats.reportsByProject.map(p => p.count),
                backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                ],
                borderColor: [
                    'rgb(99, 102, 241)',
                    'rgb(16, 185, 129)',
                    'rgb(245, 158, 11)',
                    'rgb(239, 68, 68)',
                    'rgb(139, 92, 246)',
                    'rgb(236, 72, 153)',
                ],
                borderWidth: 2,
            },
        ],
    };

    // Chart: Submission Status
    const statusChartData = {
        labels: ['Submitted', 'Pending', 'Late'],
        datasets: [
            {
                data: [stats.submittedReports, stats.pendingReports, stats.lateReports || 0],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.8)',
                    'rgba(245, 158, 11, 0.8)',
                    'rgba(239, 68, 68, 0.8)',
                ],
                borderColor: ['rgb(16, 185, 129)', 'rgb(245, 158, 11)', 'rgb(239, 68, 68)'],
                borderWidth: 2,
            },
        ],
    };

    // Chart: Member Activity
    const memberActivityData = {
        labels: stats.memberActivity?.map(m => m.name) || [],
        datasets: [
            {
                label: 'Reports Submitted',
                data: stats.memberActivity?.map(m => m.count) || [],
                backgroundColor: 'rgba(99, 102, 241, 0.6)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 2,
            },
        ],
    };

    // Chart: Compliance Radar
    const radarData = {
        labels: ['Submission', 'Quality', 'Timeliness', 'Engagement', 'Blockers'],
        datasets: [
            {
                label: 'Team Performance',
                data: [85, 78, 92, 70, 88],
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                borderColor: 'rgb(99, 102, 241)',
                pointBackgroundColor: 'rgb(99, 102, 241)',
                borderWidth: 2,
            },
        ],
    };

    return (
        <Layout>
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">📉 Analytics & Charts</h1>
                        <p className="text-gray-600">Visual insights into team performance</p>
                    </div>
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    >
                        <option value="4">Last 4 Weeks</option>
                        <option value="8">Last 8 Weeks</option>
                        <option value="12">Last 12 Weeks</option>
                    </select>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="text-3xl font-bold text-indigo-600">{stats.totalReports}</p>
                        <p className="text-sm text-gray-600">Total Reports</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="text-3xl font-bold text-green-600">{stats.submittedReports}</p>
                        <p className="text-sm text-gray-600">Submitted</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="text-3xl font-bold text-yellow-600">{stats.pendingReports}</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-6 text-center">
                        <p className="text-3xl font-bold text-purple-600">{stats.complianceRate}%</p>
                        <p className="text-sm text-gray-600">Compliance Rate</p>
                    </div>
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Submission Trend</h3>
                        <Line
                            data={trendChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false },
                                    tooltip: {
                                        callbacks: {
                                            label: (context) => `${context.parsed.y} reports`
                                        }
                                    }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Reports by Project</h3>
                        <Bar
                            data={projectChartData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">🍩 Submission Status</h3>
                        <div className="flex justify-center">
                            <div className="w-64 h-64">
                                <Doughnut
                                    data={statusChartData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Member Activity</h3>
                        <Bar
                            data={memberActivityData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { display: false }
                                },
                                scales: {
                                    y: {
                                        beginAtZero: true,
                                        ticks: { stepSize: 1 }
                                    }
                                }
                            }}
                        />
                    </div>

                    <div className="bg-white shadow-md rounded-lg p-6 lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📡 Team Performance Radar</h3>
                        <div className="flex justify-center">
                            <div className="w-96 h-96">
                                <Radar
                                    data={radarData}
                                    options={{
                                        responsive: true,
                                        plugins: {
                                            legend: { position: 'bottom' }
                                        },
                                        scales: {
                                            r: {
                                                beginAtZero: true,
                                                max: 100,
                                                ticks: { stepSize: 20 }
                                            }
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Charts;