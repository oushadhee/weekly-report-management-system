import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_URL } from '../../utils/config';
import Layout from '../../components/Layout';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
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

interface Report {
    _id: string;
    weekStart: string;
    weekEnd: string;
    project: { name: string; color: string };
    tasksCompleted: string[];
    tasksPlanned: string[];
    blockers: string[];
    hoursWorked: number;
    status: 'draft' | 'submitted';
    submittedAt?: string;
    createdAt: string;
}

const TeamDashboard: React.FC = () => {
    const { user } = useAuth();
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        submitted: 0,
        pending: 0,
        totalHours: 0,
        totalBlockers: 0,
    });

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports`);
            const data = response.data.reports;
            setReports(data);

            // Calculate stats
            const submitted = data.filter((r: Report) => r.status === 'submitted');
            const pending = data.filter((r: Report) => r.status === 'draft');
            const totalHours = data.reduce((sum: number, r: Report) => sum + (r.hoursWorked || 0), 0);
            const totalBlockers = data.reduce((sum: number, r: Report) => sum + (r.blockers?.length || 0), 0);

            setStats({
                total: data.length,
                submitted: submitted.length,
                pending: pending.length,
                totalHours,
                totalBlockers,
            });
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    // Chart: Reports by Week (Line Chart)
    const weeklyData = reports
        .filter(r => r.status === 'submitted')
        .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
        .slice(-8);

    const lineChartData = {
        labels: weeklyData.map(r => {
            const date = new Date(r.weekStart);
            return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`;
        }),
        datasets: [
            {
                label: 'Reports Submitted',
                data: weeklyData.map((_, i) => i + 1),
                borderColor: 'rgb(99, 102, 241)',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4,
            },
        ],
    };

    // Chart: Submission Status (Doughnut)
    const doughnutData = {
        labels: ['Submitted', 'Pending'],
        datasets: [
            {
                data: [stats.submitted, stats.pending],
                backgroundColor: ['rgba(16, 185, 129, 0.8)', 'rgba(245, 158, 11, 0.8)'],
                borderColor: ['rgb(16, 185, 129)', 'rgb(245, 158, 11)'],
                borderWidth: 1,
            },
        ],
    };

    // Chart: Hours by Week (Bar Chart)
    const hoursData = reports
        .filter(r => r.status === 'submitted' && r.hoursWorked > 0)
        .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime())
        .slice(-8);

    const barChartData = {
        labels: hoursData.map(r => {
            const date = new Date(r.weekStart);
            return `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`;
        }),
        datasets: [
            {
                label: 'Hours Worked',
                data: hoursData.map(r => r.hoursWorked),
                backgroundColor: 'rgba(99, 102, 241, 0.8)',
                borderColor: 'rgb(99, 102, 241)',
                borderWidth: 1,
            },
        ],
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

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name}! 👋</h1>
                <p className="text-gray-600">Here's your weekly report summary</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Reports</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-2xl">
                            📊
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Submitted</p>
                            <p className="text-2xl font-bold text-green-600 mt-1">{stats.submitted}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            ✅
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</p>
                        </div>
                        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl">
                            ⏳
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Hours</p>
                            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.totalHours}h</p>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl">
                            ⏰
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📈 Submission Progress
                    </h3>
                    <Line
                        data={lineChartData}
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        📊 Submission Status
                    </h3>
                    <div className="flex justify-center">
                        <div className="w-64 h-64">
                            <Doughnut
                                data={doughnutData}
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
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        ⏰ Hours Worked Trend
                    </h3>
                    <Bar
                        data={barChartData}
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
                                },
                            },
                        }}
                    />
                </div>

                <div className="bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        🚨 Open Blockers
                    </h3>
                    {stats.totalBlockers === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-4xl mb-2">🎉</p>
                            <p>No blockers! Great job!</p>
                        </div>
                    ) : (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                            {reports
                                .filter(r => r.blockers && r.blockers.length > 0 && r.status === 'submitted')
                                .map((report) => (
                                    <div key={report._id} className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm font-medium text-red-800">
                                            {report.project?.name || 'No Project'}
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-red-700 mt-1">
                                            {report.blockers.map((blocker, idx) => (
                                                <li key={idx}>{blocker}</li>
                                            ))}
                                        </ul>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Week: {new Date(report.weekStart).toLocaleDateString()}
                                        </p>
                                    </div>
                                ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TeamDashboard;