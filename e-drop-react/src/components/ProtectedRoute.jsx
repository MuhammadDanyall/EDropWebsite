import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requireAdmin }) => {
    const userStr = sessionStorage.getItem('user');
    let user = null;

    try {
        if (userStr) {
            user = JSON.parse(userStr);
        }
    } catch (error) {
        console.error("Error parsing user from localStorage", error);
    }

    // Check if user is logged in
    if (!user) {
        return <Navigate to="/" replace />;
    }

    // Check if admin is required
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
