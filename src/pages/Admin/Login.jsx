import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlog } from '../../context/BlogContext';
import { Lock } from 'lucide-react';
import SEO from '../../components/SEO';

const Login = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useBlog();
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (login(password)) {
            navigate('/admin');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="pt-4 pb-16 container mx-auto px-4 flex justify-center items-center min-h-[60vh]">
            <SEO title="Admin Login" description="Login to access admin dashboard" />
            <div className="glass-panel p-8 w-full max-w-md">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 rounded-full bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                        <Lock size={32} />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-bg-primary border border-white/10 rounded-lg p-3 focus:border-accent-primary focus:outline-none transition-colors"
                            placeholder="Enter Password"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                    <button className="w-full py-3 bg-accent-primary text-bg-primary font-bold rounded-lg hover:bg-white transition-colors">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;
