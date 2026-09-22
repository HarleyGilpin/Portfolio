import React from 'react';
import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
            <SEO title="404 Not Found" description="Page not found" />

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent-primary/10 rounded-full blur-[100px] pointer-events-none" />

            <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary mb-4">404</h1>
            <h2 className="text-3xl font-bold mb-6">Page Not Found</h2>
            <p className="text-text-secondary text-lg max-w-md mb-8">
                The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
            </p>

            <Link
                to="/"
                className="px-8 py-3 bg-accent-primary text-bg-primary rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
                <ArrowLeft size={20} /> Back to Home
            </Link>
        </div>
    );
};

export default NotFound;
