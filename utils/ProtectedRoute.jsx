import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../src/services/authService';

const ProtectedRoute = ({ children }) => {
    const isLoggedIn = authService.isLoggedIn();

    if (!isLoggedIn) {
        console.log('⚠️ Not logged in, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    // ✅ Kiểm tra token expired
    if (authService.isTokenExpired()) {
        console.log('⚠️ Token expired, logging out');
        authService.logout();
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;