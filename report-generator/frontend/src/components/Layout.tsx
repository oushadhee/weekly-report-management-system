import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';

interface LayoutProps {
    children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
    const { user } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="min-h-screen bg-[#EEF6F3]">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            <div className="lg:ml-64 min-h-screen">
                <header className="bg-white shadow-sm lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button
                            onClick={toggleSidebar}
                            className="text-[#386B55] hover:text-[#284D3D]"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                        <h1 className="text-lg font-semibold text-[#549E7E]">Weekly Reports</h1>
                        <div className="w-6" />
                    </div>
                </header>

                <main className="p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;