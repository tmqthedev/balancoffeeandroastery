import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext, useAuth } from './authConstants';

// Configure axios defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to all requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Re-export AuthContext and useAuth hook
export { AuthContext, useAuth };

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('authToken');
        } finally {
            setLoading(false);
        }
    };

    // Login function with real API call
    const login = async (email, password, remember = false) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                remember
            });

            const { token, user: userData } = response.data;
            
            // Store token in localStorage
            localStorage.setItem('authToken', token);
            
            // Update state
            setUser(userData);
            setIsAuthenticated(true);
            
            return { success: true };
        } catch (error) {
            console.error('Login failed:', error);
            const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Login with token (for OAuth callbacks)
    const loginWithToken = async (token) => {
        setLoading(true);
        try {
            // Store token in localStorage
            localStorage.setItem('authToken', token);
            
            // Get user data using the token
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            setIsAuthenticated(true);
            
            return { success: true };
        } catch (error) {
            console.error('Login with token failed:', error);
            localStorage.removeItem('authToken');
            const errorMessage = error.response?.data?.error || 'Đăng nhập thất bại';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout API error:', error);
        } finally {
            localStorage.removeItem('authToken');
            setUser(null);
            setIsAuthenticated(false);
        }
    };    // Register function with real API call
    const register = async (userData) => {
        setLoading(true);
        try {
            const response = await api.post('/auth/register', {
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone
            });

            const { token, user: newUser } = response.data;
            
            // Store token in localStorage
            localStorage.setItem('authToken', token);
            
            // Update state
            setUser(newUser);
            setIsAuthenticated(true);
            
            return { success: true };
        } catch (error) {
            console.error('Registration failed:', error);
            const errorMessage = error.response?.data?.error || 'Đăng ký thất bại';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Update user info
    const updateUserInfo = async (userData) => {
        setLoading(true);
        try {
            const response = await api.put('/auth/profile', userData);
            setUser(response.data.user);
            return { success: true };
        } catch (error) {
            console.error('Update profile failed:', error);
            const errorMessage = error.response?.data?.error || 'Cập nhật thông tin thất bại';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    // Change password
    const changePassword = async (currentPassword, newPassword) => {
        setLoading(true);
        try {
            await api.put('/auth/password', {
                currentPassword,
                newPassword
            });
            return { success: true };
        } catch (error) {
            console.error('Change password failed:', error);
            const errorMessage = error.response?.data?.error || 'Đổi mật khẩu thất bại';
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        loginWithToken,
        logout,
        register,
        updateUserInfo,
        changePassword,
        checkAuthStatus
    }), [user, loading, isAuthenticated]);return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
