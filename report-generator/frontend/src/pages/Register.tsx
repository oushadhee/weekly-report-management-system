import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('team_member');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            await register(name, email, password, role);
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#284D3D] via-[#386B55] to-[#192F25] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">

                    <h1 className="mt-4 text-4xl font-bold text-white tracking-tight">
                        Weekly Reports
                    </h1>
                    <p className="mt-2 text-[#D0E6DD] text-sm font-light">
                        Create your account
                    </p>
                </div>

                <div className="bg-white/10 backdrop-blur-sm py-8 px-6 shadow-2xl rounded-2xl border border-white/20">
                    <h2 className="text-center text-2xl font-semibold text-white mb-6">
                        Create Account
                    </h2>

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        {error && (
                            <div className="bg-red-500/20 border border-red-400/50 text-red-100 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <div className="space-y-3">
                            <div>
                                <input
                                    type="text"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent focus:z-10 sm:text-sm transition duration-150"
                                    placeholder="Full Name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent focus:z-10 sm:text-sm transition duration-150"
                                    placeholder="Email address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent focus:z-10 sm:text-sm transition duration-150"
                                    placeholder="Password (min 6 characters)"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    required
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg placeholder-white/60 text-white focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent focus:z-10 sm:text-sm transition duration-150"
                                    placeholder="Confirm Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                            </div>
                            <div>
                                <select
                                    className="appearance-none relative block w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#549E7E] focus:border-transparent focus:z-10 sm:text-sm transition duration-150"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                >
                                    <option value="team_member" className="text-gray-900">Team Member</option>
                                    <option value="manager" className="text-gray-900">Manager</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#549E7E] to-[#386B55] hover:from-[#48896D] hover:to-[#284D3D] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#549E7E] disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 shadow-lg"
                            >
                                {loading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating...
                                    </span>
                                ) : (
                                    'Create Account'
                                )}
                            </button>
                        </div>

                        <div className="text-center">
                            <Link to="/login" className="text-sm text-[#D0E6DD] hover:text-white transition duration-150">
                                Already have an account? <span className="font-semibold text-white">Sign in</span>
                            </Link>
                        </div>
                    </form>
                </div>


            </div>
        </div>
    );
};

export default Register;