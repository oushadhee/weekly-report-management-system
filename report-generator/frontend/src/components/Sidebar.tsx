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

    const memberMenuItems = [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/create-report', label: 'Create Report' },
        { path: '/my-reports', label: 'My Reports' },
        { path: '/report-history', label: 'Report History' },
        { path: '/profile', label: 'Profile' },
    ];

    const managerMenuItems = [
        { path: '/manager/dashboard', label: 'Dashboard' },
        { path: '/manager/all-reports', label: 'All Reports' },
        { path: '/manager/projects', label: 'Projects' },
        { path: '/manager/charts', label: 'Charts' },
        { path: '/manager/team-members', label: 'Team Members' },
        { path: '/profile', label: 'Profile' },
    ];

    const menuItems = isManager ? managerMenuItems : memberMenuItems;
    const roleLabel = user?.role === 'manager' ? 'Manager' : 'Team Member';

    return (
        <>
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={onClose}
                />
            )}

            <div
                className={`fixed top-0 left-0 h-full w-64 bg-[#284D3D] text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    } lg:translate-x-0`}
            >
                <div className="p-6 border-b border-[#386B55]">
                    <h1 className="text-2xl font-bold">
                        Weekly Reports
                    </h1>
                    <p className="text-sm text-[#D0E6DD] mt-1">
                        {roleLabel}
                    </p>
                </div>

                <div className="p-4 border-b border-[#386B55] flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#549E7E] flex items-center justify-center text-xl font-bold">
                        {user?.name?.charAt(0) || 'U'}
                    </div>
                    <div>
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-[#D0E6DD] truncate">{user?.email}</p>
                    </div>
                </div>

                <nav className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 180px)' }}>
                    <ul className="space-y-2">
                        {menuItems.map((item) => {
                            const isActive = location.pathname === item.path;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                            ? 'bg-[#549E7E] text-white'
                                            : 'text-[#D0E6DD] hover:bg-[#386B55] hover:text-white'
                                            }`}
                                        onClick={() => {
                                            if (window.innerWidth < 1024) onClose();
                                        }}
                                    >
                                        <span>{item.label}</span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#386B55]">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-[#D0E6DD] hover:bg-[#386B55] hover:text-white transition-colors"
                    >
                        <span>Logout</span>
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;