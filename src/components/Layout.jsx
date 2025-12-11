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
            </footer>
        </div>
    );
};

export default Layout;
