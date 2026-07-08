import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user, logout, isManager } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navigation Bar */}
            <nav className="bg-white shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            {/* Logo */}
                            <div className="flex-shrink-0 flex items-center">
                                <Link to="/" className="text-xl font-bold text-indigo-600">
                                    Weekly Reports
                                </Link>
                            </div>

                            {/* Navigation Links - Sidebar Items */}
                            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                {/* Dashboard Link */}
                                <Link
                                    to="/"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Dashboard
                                </Link>

                                {/* Create Report Link */}
                                <Link
                                    to="/create-report"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Create Report
                                </Link>

                                {/* My Reports Link */}
                                <Link
                                    to="/my-reports"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    My Reports
                                </Link>

                                {/* Profile Link */}
                                <Link
                                    to="/profile"
                                    className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                >
                                    Profile
                                </Link>

                                {/* Manager only links */}
                                {isManager && (
                                    <>
                                        <Link
                                            to="/dashboard"
                                            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                        >
                                            Team Dashboard
                                        </Link>
                                        <Link
                                            to="/projects"
                                            className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900"
                                        >
                                            Projects
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* User Info & Logout */}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-700">{user?.name}</span>
                            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                                {user?.role === 'manager' ? 'Manager' : 'Team Member'}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>
        </div>
    );
};

export default Layout;