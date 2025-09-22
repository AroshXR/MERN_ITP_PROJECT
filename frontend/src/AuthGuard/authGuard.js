import React, { createContext, useState, useContext, useEffect, useMemo } from 'react';
import axios from 'axios';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'authUser';

const normalizeUser = (user) => {
    if (!user) {
        return null;
    }

    return {
        ...user,
        id: user.id || user._id || user?.userId
    };
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(null);

    const clearAuthState = () => {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
        delete axios.defaults.headers.common['Authorization'];
        setToken(null);
        setCurrentUser(null);
    };

    const persistSession = (sessionToken, userData) => {
        const normalizedUser = normalizeUser(userData);
        localStorage.setItem(TOKEN_STORAGE_KEY, sessionToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));
        axios.defaults.headers.common['Authorization'] = `Bearer ${sessionToken}`;
        setToken(sessionToken);
        setCurrentUser(normalizedUser);
    };

    const refreshAuth = async (userId, sessionToken = token) => {
        const effectiveUserId = userId || currentUser?.id;
        const effectiveToken = sessionToken || token;
        const storedUserRaw = localStorage.getItem(USER_STORAGE_KEY);

        if (!effectiveUserId || !effectiveToken || !storedUserRaw) {
            clearAuthState();
            return false;
        }

        try {
            const response = await axios.get(`http://localhost:5001/users/${effectiveUserId}`);
            if (response.data?.status === 'ok' && response.data.user) {
                const updatedUser = normalizeUser(response.data.user);
                localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
                setCurrentUser(updatedUser);
            }
            axios.defaults.headers.common['Authorization'] = `Bearer ${effectiveToken}`;
            setToken(effectiveToken);
            return true;
        } catch (error) {
            console.error('Failed to refresh auth state:', error);
            clearAuthState();
            return false;
        }
    };

    useEffect(() => {
        const initialiseAuth = async () => {
            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            const storedUserRaw = localStorage.getItem(USER_STORAGE_KEY);

            if (!storedToken || !storedUserRaw) {
                clearAuthState();
                setLoading(false);
                return;
            }

            try {
                const parsedUser = normalizeUser(JSON.parse(storedUserRaw));
                setToken(storedToken);
                setCurrentUser(parsedUser);
                axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

                await refreshAuth(parsedUser.id, storedToken);
            } catch (error) {
                console.error('Failed to restore session:', error);
                clearAuthState();
            } finally {
                setLoading(false);
            }
        };

        initialiseAuth();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const login = (sessionToken, userData) => {
        if (!sessionToken || !userData) {
            throw new Error('Token and user data are required to establish a session');
        }
        persistSession(sessionToken, userData);
    };

    const logout = () => {
        clearAuthState();
    };

    const isAuthenticated = () => Boolean(token && currentUser);

    const getToken = () => token || localStorage.getItem(TOKEN_STORAGE_KEY);

    const updateStoredUser = (updates) => {
        setCurrentUser((prev) => {
            const merged = normalizeUser({ ...prev, ...updates });
            localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(merged));
            return merged;
        });
    };

    const value = useMemo(() => ({
        currentUser,
        token,
        login,
        logout,
        loading,
        isAuthenticated,
        getToken,
        refreshAuth,
        updateStoredUser
    }), [currentUser, token, loading]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
