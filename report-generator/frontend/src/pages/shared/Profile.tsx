import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import axios from 'axios';
import { API_URL } from '../../utils/config';

interface Report {
    _id: string;
    status: 'draft' | 'submitted' | 'late';
}

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState<'success' | 'error'>('success');
    const [reportStats, setReportStats] = useState({
        total: 0,
        submitted: 0,
        pending: 0,
        late: 0
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchReportStats();
    }, []);

    const fetchReportStats = async () => {
        try {
            const response = await axios.get(`${API_URL}/reports`);
            const reports = response.data.reports || [];

            const total = reports.length;
            const submitted = reports.filter((r: Report) => r.status === 'submitted').length;
            const pending = reports.filter((r: Report) => r.status === 'draft').length;
            const late = reports.filter((r: Report) => r.status === 'late').length;

            setReportStats({ total, submitted, pending, late });
        } catch (error) {
            console.error('Failed to fetch report stats:', error);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProfile = async () => {
        setLoading(true);
        setMessage('');
        try {
            // Update profile API call
            // For now, just show success message
            setMessage('Profile updated successfully!');
            setMessageType('success');
            setIsEditing(false);
            setTimeout(() => setMessage(''), 3000);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to update profile');
            setMessageType('error');
            setTimeout(() => setMessage(''), 3000);
        } finally {
            setLoading(false);
        }
    };

    const getInitials = (name: string) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2) || 'U';
    };

    const getRoleBadge = (role: string) => {
        if (role === 'manager') {
            return <span className="px-3 py-1 rounded-full text-sm bg-[#549E7E]/20 text-[#386B55] font-medium">Manager</span>;
        }
        return <span className="px-3 py-1 rounded-full text-sm bg-[#D0E6DD] text-[#386B55] font-medium">Team Member</span>;
    };

    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                {/* Page Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
                    <p className="text-gray-600">Manage your personal information</p>
                </div>

                {/* Message Alert */}
                {message && (
                    <div className={`px-4 py-3 rounded-lg mb-4 ${messageType === 'success'
                            ? 'bg-green-50 border border-green-400 text-green-700'
                            : 'bg-red-50 border border-red-400 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                            {/* Profile Image Section */}
                            <div className="bg-gradient-to-br from-[#549E7E] to-[#386B55] p-6 text-center">
                                <div className="relative inline-block">
                                    <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm border-4 border-white flex items-center justify-center text-5xl font-bold text-white overflow-hidden">
                                        {profileImage ? (
                                            <img
                                                src={profileImage}
                                                alt="Profile"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <span>{getInitials(user?.name || '')}</span>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute bottom-0 right-0 bg-white text-[#386B55] p-2 rounded-full shadow-lg hover:bg-gray-100 transition"
                                        title="Change Photo"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageUpload}
                                        accept="image/*"
                                        className="hidden"
                                    />
                                </div>
                                <h2 className="mt-4 text-xl font-bold text-white">{user?.name}</h2>
                                <p className="text-white/80 text-sm">{user?.email}</p>
                                <div className="mt-2">
                                    {getRoleBadge(user?.role || 'team_member')}
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="p-4 space-y-3">
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400">Member Since</span>
                                    <span className="text-gray-700 font-medium">
                                        {new Date().toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-gray-400">Status</span>
                                    <span className="text-green-600 font-medium flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span>
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Profile Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Personal Information */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Full Name
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 font-medium text-base">{user?.name}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent"
                                        />
                                    ) : (
                                        <p className="text-gray-900 text-base">{user?.email}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <div>{getRoleBadge(user?.role || 'team_member')}</div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={loading}
                                                className="bg-[#549E7E] text-white px-6 py-2 rounded-lg hover:bg-[#48896D] disabled:opacity-50 transition"
                                            >
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setIsEditing(false);
                                                    setName(user?.name || '');
                                                    setEmail(user?.email || '');
                                                }}
                                                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="bg-[#549E7E] text-white px-6 py-2 rounded-lg hover:bg-[#48896D] transition flex items-center gap-2"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                            Edit Profile
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Account Statistics */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Statistics</h3>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-[#EEF6F3] rounded-lg">
                                    <p className="text-2xl font-bold text-[#549E7E]">{reportStats.total}</p>
                                    <p className="text-xs text-gray-600">Total Reports</p>
                                </div>
                                <div className="text-center p-3 bg-green-50 rounded-lg">
                                    <p className="text-2xl font-bold text-green-600">{reportStats.submitted}</p>
                                    <p className="text-xs text-gray-600">Submitted</p>
                                </div>
                                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                                    <p className="text-2xl font-bold text-yellow-600">{reportStats.pending}</p>
                                    <p className="text-xs text-gray-600">Pending</p>
                                </div>
                                <div className="text-center p-3 bg-red-50 rounded-lg">
                                    <p className="text-2xl font-bold text-red-600">{reportStats.late}</p>
                                    <p className="text-xs text-gray-600">Late</p>
                                </div>
                            </div>
                        </div>

                        {/* Account Actions */}
                        <div className="bg-white shadow-md rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Actions</h3>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to logout?')) {
                                            logout();
                                        }
                                    }}
                                    className="border border-red-300 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition"
                                >
                                    Logout
                                </button>
                                <button
                                    onClick={() => {
                                        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
                                            // Handle account deletion
                                        }
                                    }}
                                    className="border border-red-600 text-red-600 px-6 py-2 rounded-lg hover:bg-red-50 transition"
                                >
                                    Delete Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;