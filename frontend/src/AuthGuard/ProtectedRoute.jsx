import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthGuard';

const normalizeTypes = (types) => {
    if (!types) {
        return null;
    }

    const list = Array.isArray(types) ? types : [types];
    return list.map((type) => type?.toLowerCase()).filter(Boolean);
};

const ProtectedRoute = ({ children, requiredUserType = null, allowedUserTypes = null }) => {
    const { isAuthenticated, currentUser, loading } = useAuth();
    const location = useLocation();

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

    if (!isAuthenticated()) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const allowedTypes = normalizeTypes(allowedUserTypes || requiredUserType);

    if (allowedTypes && (!currentUser?.type || !allowedTypes.includes(currentUser.type.toLowerCase()))) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default ProtectedRoute;
