import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../utils/config';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'team_member' | 'manager';
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, role?: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
    isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Configure axios to send cookies
    axios.defaults.withCredentials = true;

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true,
            });
            setUser(response.data.user);
        } catch (error) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/login`,
                { email, password },
                { withCredentials: true }
            );
            setUser(response.data.user);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    };

    const register = async (name: string, email: string, password: string, role?: string) => {
        try {
            const response = await axios.post(
                `${API_URL}/auth/register`,
                { name, email, password, role },
                { withCredentials: true }
            );
            setUser(response.data.user);
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/auth/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
        }
    };

    const isManager = user?.role === 'manager';

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!user,
                isManager,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};