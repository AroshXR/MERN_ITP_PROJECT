import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './authGuard';

const ProtectedRoute = ({ children, requiredUserType = null }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();
    const location = useLocation();

    // Show loading spinner while checking authentication
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                fontSize: '18px'
            }}>
                Loading...
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check if specific user type is required
    if (requiredUserType && currentUser?.type !== requiredUserType) {
        return <Navigate to="/unauthorized" replace />;
    }

    // Render the protected content
    return children;
};

export default ProtectedRoute;
