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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState(localStorage.getItem('token'));

    const checkAuth = useCallback(async () => {
        // CRITICAL: If returning from OAuth callback, skip the /me check.
        // AuthCallback will exchange the session_id and establish the session first.
        if (window.location.hash?.includes('session_id=')) {
            setLoading(false);
            return;
        }

        const storedToken = localStorage.getItem('token');
        if (!storedToken) {
            setLoading(false);
            return;
        }

        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${storedToken}` },
                withCredentials: true
            });
            setUser(response.data);
            setToken(storedToken);
        } catch (error) {
            localStorage.removeItem('token');
            setUser(null);
            setToken(null);
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
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const register = async (username, email, password) => {
        const response = await axios.post(`${API}/auth/register`, { username, email, password });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const loginWithGoogle = () => {
        // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        const redirectUrl = window.location.origin + '/auth/callback';
        window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
    };

    const processGoogleCallback = async (sessionId) => {
        const response = await axios.get(`${API}/auth/session?session_id=${sessionId}`, {
            withCredentials: true
        });
        const { token: newToken, user: userData } = response.data;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        setUser(userData);
        return userData;
    };

    const logout = async () => {
        try {
            await axios.post(`${API}/auth/logout`, {}, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
        } catch (error) {
            // Ignore logout errors
        }
        localStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    const refreshUser = async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${API}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true
            });
            setUser(response.data);
        } catch (error) {
            // Ignore
        }
    };

    const value = {
        user,
        token,
        loading,
        login,
        register,
        loginWithGoogle,
        processGoogleCallback,
        logout,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin'
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
