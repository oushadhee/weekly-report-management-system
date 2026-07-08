import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { user, logout, isManager } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Team Member Menu Items
    const memberMenuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/create-report', label: 'Create Report', icon: '📝' },
        { path: '/my-reports', label: 'My Reports', icon: '📋' },
        { path: '/report-history', label: 'Report History', icon: '📜' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    // Manager Menu Items (Extra)
    const managerMenuItems = [
        { path: '/manager/dashboard', label: 'Dashboard', icon: '📈' },
        { path: '/manager/all-reports', label: 'All Reports', icon: '📊' },
        { path: '/manager/projects', label: 'Projects', icon: '📁' },
        { path: '/manager/charts', label: 'Charts', icon: '📉' },
        { path: '/manager/team-members', label: 'Team Members', icon: '👥' },
        { path: '/manager/ai-assistant', label: 'AI Assistant', icon: '🤖' },
        { path: '/profile', label: 'Profile', icon: '👤' },
    ];

    const menuItems = isManager ? managerMenuItems : memberMenuItems;

    // Get role label
    const roleLabel = user?.role === 'manager' ? 'Manager' : 'Team Member';

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-full w-64 bg-indigo-800 text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                {/* Logo / Brand */}
                <div className="p-6 border-b border-indigo-700">
                    <h1 className="text-2xl font-bold">
                        📋 Weekly Reports
                    </h1>
                    <p className="text-sm text-indigo-300 mt-1">
                        {roleLabel}
                    </p>
                </div>

                {/* User Info */}
                <div className="p-4 border-b border-indigo-700 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-indigo-300 truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Navigation Menu */}
                <nav className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-indigo-700 text-white'
                                                : 'text-indigo-200 hover:bg-indigo-700 hover:text-white'
                                            }`}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-indigo-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-indigo-200 hover:bg-indigo-700 hover:text-white transition-colors"
                    >
                        <span className="text-xl">🚪</span>
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;