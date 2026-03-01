import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        // Try to restore user from localStorage on initial load
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(() => localStorage.getItem('token'));

    const saveAuth = (newToken, userData) => {
        if (newToken) {
            localStorage.setItem('token', newToken);
            setToken(newToken);
        }
        if (userData) {
            localStorage.setItem('user', JSON.stringify(userData));
            setUser(userData);
        }
    };

    const clearAuth = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const checkAuth = useCallback(async () => {
        // Skip if OAuth callback
        const searchParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash?.replace('#', ''));
        
        if (searchParams.has('session_id') || hashParams.has('session_id')) {
            setLoading(false);
            return;
        }

        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (!storedToken) {
            setLoading(false);
            return;
        }

        // Set token immediately from storage
        setToken(storedToken);
        
        // If we have cached user data, use it immediately
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.warn('Failed to parse stored user');
            }
        }

        // Then verify with server in background
        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${storedToken}` }
            });
            // Update with fresh data from server
            saveAuth(storedToken, response.data);
        } catch (error) {
            if (error.response?.status === 401) {
                // Token is truly invalid
                clearAuth();
            }
            // For network errors, keep using cached data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    const login = async (email, password) => {
        const response = await axios.post(`${API}/auth/login`, { email, password });
        const { token: newToken, user: userData } = response.data;
        saveAuth(newToken, userData);
        return userData;
    };

    const register = async (username, email, password, firstName, lastName, phone) => {
        const response = await axios.post(`${API}/auth/register`, { 
            username, 
            email, 
            password,
            first_name: firstName,
            last_name: lastName,
            phone: phone
        });
        const { token: newToken, user: userData } = response.data;
        saveAuth(newToken, userData);
        return userData;
    };

    const loginWithGoogle = async (sessionId) => {
        const response = await axios.post(`${API}/auth/google/exchange`, { session_id: sessionId });
        const { token: newToken, user: userData } = response.data;
        saveAuth(newToken, userData);
        return userData;
    };

    const logout = () => {
        clearAuth();
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            saveAuth(token, response.data);
        } catch (error) {
            console.error('Failed to refresh user');
        }
    };

    const isAdmin = user?.role === 'admin';
    const isAuthenticated = !!token && !!user;

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            isAdmin,
            isAuthenticated,
            login,
            register,
            loginWithGoogle,
            logout,
            refreshUser
        }}>
            {children}
        </AuthContext.Provider>
    );
};
