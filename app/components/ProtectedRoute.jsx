import React from 'react';
import { Navigate } from 'react-router';
import { useBlog } from '../context/BlogContext';

const ProtectedRoute = ({ children }) => {
    const { isAdmin } = useBlog();

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
