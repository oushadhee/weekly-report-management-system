import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import Layout from '../../components/Layout';
import axios from 'axios';
import { API_URL } from '../../utils/config';

const Profile: React.FC = () => {
    const { user, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
            // Update profile API call (you need to implement this backend endpoint)
            // For now, just show success message
            setMessage('Profile updated successfully!');
            setIsEditing(false);
        } catch (error: any) {
            setMessage(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <div className="max-w-3xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">My Profile</h1>

                {message && (
                    <div className={`px-4 py-3 rounded-lg mb-4 ${message.includes('success')
                        ? 'bg-green-50 border border-green-400 text-green-700'
                        : 'bg-red-50 border border-red-400 text-red-700'
                        }`}>
                        {message}
                    </div>
                )}

                <div className="bg-white shadow-md rounded-lg p-6">
                    {/* Profile Image */}
                    <div className="flex flex-col items-center mb-6">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-6xl overflow-hidden">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span>{user?.name?.charAt(0) || 'U'}</span>
                                )}
                            </div>
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute bottom-0 right-0 bg-primary-500 text-white p-2 rounded-full hover:bg-primary-600"
                            >
                                Photo
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleImageUpload}
                                accept="image/*"
                                className="hidden"
                            />
                        </div>
                        <p className="text-sm text-gray-500 mt-2">Click the button to upload photo</p>
                    </div>

                    {/* Profile Info */}
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900 font-medium">{user?.name}</p>
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            ) : (
                                <p className="text-gray-900">{user?.email}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <p className="text-gray-900">
                                <span className={`px-3 py-1 rounded-full text-sm ${user?.role === 'manager'
                                    ? 'bg-purple-100 text-purple-800'
                                    : 'bg-blue-100 text-blue-800'
                                    }`}>
                                    {user?.role === 'manager' ? 'Manager' : 'Team Member'}
                                </span>
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Member Since
                            </label>
                            <p className="text-gray-900">
                                {new Date().toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                            {isEditing ? (
                                <>
                                    <button
                                        onClick={handleUpdateProfile}
                                        disabled={loading}
                                        className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 disabled:opacity-50"
                                    >
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setIsEditing(false);
                                            setName(user?.name || '');
                                            setEmail(user?.email || '');
                                        }}
                                        className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                </>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600"
                                >
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Account Stats */}
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white shadow-md rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-primary-600">12</p>
                        <p className="text-sm text-gray-600">Total Reports</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">8</p>
                        <p className="text-sm text-gray-600">Submitted</p>
                    </div>
                    <div className="bg-white shadow-md rounded-lg p-4 text-center">
                        <p className="text-2xl font-bold text-yellow-600">4</p>
                        <p className="text-sm text-gray-600">Pending</p>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Profile;