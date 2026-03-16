import React from 'react';
import { Navigate, Outlet } from 'react-router';
import { useBlog } from '../context/BlogContext';

const ProtectedRoute = ({ children }) => {
    const { isAdmin } = useBlog();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    // Support both layout (Outlet) and wrapper (children) usage
    return children || <Outlet />;
};

export default ProtectedRoute;
