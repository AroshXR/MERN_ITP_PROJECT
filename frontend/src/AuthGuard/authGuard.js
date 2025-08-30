import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('token');
            console.log('Checking stored token:', storedToken ? 'exists' : 'none');
            
            if (storedToken) {
                try {
                    // Set the token in axios headers first
                    axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                    console.log('Attempting to verify token...');
                    
                    // Verify token with backend
                    const response = await axios.get('http://localhost:5001/users/verify-token'); 
                    console.log('Token verification response:', response.data);
                    
                    if (response.data.status === "ok" && response.data.user) {
                        setCurrentUser(response.data.user);
                        setToken(storedToken);
                        console.log('User authenticated:', response.data.user.username);
                    } else {
                        console.log('Invalid token response, clearing token');
                        localStorage.removeItem('token');
                        setToken(null);
                        setCurrentUser(null);
                        delete axios.defaults.headers.common['Authorization'];
                    }
                } catch (error) {
                    console.error('Token validation failed:', error);
                    console.log('Clearing invalid token');
                    localStorage.removeItem('token');
                    setToken(null);
                    setCurrentUser(null);
                    delete axios.defaults.headers.common['Authorization'];
                }
            } else {
                console.log('No stored token found');
                setToken(null);
                setCurrentUser(null);
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (token, userData) => {
        console.log('Logging in user:', userData.username);
        localStorage.setItem('token', token);
        setToken(token);
        setCurrentUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    };

    const logout = () => {
        console.log('Logging out user');
        localStorage.removeItem('token');
        setToken(null);
        setCurrentUser(null);
        delete axios.defaults.headers.common['Authorization'];
    };

    const isAuthenticated = () => {
        const hasToken = !!token && !!localStorage.getItem('token');
        const hasUser = !!currentUser;
        console.log('Auth check:', { hasToken, hasUser, token: !!token, user: !!currentUser });
        return hasToken && hasUser;
    };

    const getToken = () => {
        return token || localStorage.getItem('token');
    };

    const refreshAuth = async () => {
        const storedToken = localStorage.getItem('token');
        if (storedToken && !currentUser) {
            try {
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
                const response = await axios.get('http://localhost:5001/users/verify-token');
                if (response.data.status === "ok" && response.data.user) {
                    setCurrentUser(response.data.user);
                    setToken(storedToken);
                    return true;
                }
            } catch (error) {
                console.error('Failed to refresh auth:', error);
                logout();
            }
        }
        return false;
    };

    const value = {
        currentUser,
        token,
        login,
        logout,
        loading,
        isAuthenticated,
        getToken,
        refreshAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};