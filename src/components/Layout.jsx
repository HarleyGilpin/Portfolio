import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow pt-24">
                <Outlet />
            </main>
            <footer className="py-8 text-center text-text-muted text-sm">
                <p>&copy; {new Date().getFullYear()} Harley Gilpin</p>
                <div className="mt-2">
                    <a href="/portal" className="text-xs text-text-secondary hover:text-accent-primary transition-colors">Client Portal</a>
                    <span className="mx-2 text-text-muted">•</span>
                    <a href="/faq" className="text-xs text-text-secondary hover:text-accent-primary transition-colors">FAQ</a>
                </div>
            </footer>
        </div>
    );
};

export default Layout;
