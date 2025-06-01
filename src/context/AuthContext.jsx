import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

export const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Configure axios defaults
    const token = localStorage.getItem('authToken');
    if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setLoading(false);
                    return;
                }

                // Verify token with backend
                const response = await axios.get('/api/auth/me');
                if (response.data.success) {
                    setUser(response.data.user);
                    setIsAuthenticated(true);
                } else {
                    localStorage.removeItem('authToken');
                    delete axios.defaults.headers.common['Authorization'];
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('authToken');
                delete axios.defaults.headers.common['Authorization'];
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    // Login function
    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            if (response.data.success) {
                const { token, user } = response.data;
                
                // Store token in localStorage
                localStorage.setItem('authToken', token);
                
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Update state
                setUser(user);
                setIsAuthenticated(true);
                
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Login failed' 
            };
        }
    };

    // Register function
    const register = async (userData) => {
        try {
            const response = await axios.post('/api/auth/register', userData);

            if (response.data.success) {
                const { token, user } = response.data;
                
                // Store token in localStorage
                localStorage.setItem('authToken', token);
                
                // Set axios default header
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                
                // Update state
                setUser(user);
                setIsAuthenticated(true);
                
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Register error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Registration failed' 
            };
        }
    };

    // Logout function
    const logout = async () => {
        try {
            await axios.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local storage and state
            localStorage.removeItem('authToken');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    // Update user profile
    const updateProfile = async (profileData) => {
        try {
            const response = await axios.put('/api/users/profile', profileData);
            
            if (response.data.success) {
                setUser(response.data.user);
                return { success: true };
            } else {
                return { success: false, message: response.data.message };
            }
        } catch (error) {
            console.error('Profile update error:', error);
            return { 
                success: false, 
                message: error.response?.data?.message || 'Profile update failed' 
            };
        }
    };

    // Check if user has specific role
    const hasRole = (role) => {
        return user && user.role === role;
    };    // Check if user is admin
    const isAdmin = () => {
        return hasRole('admin');
    };

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        updateProfile,
        hasRole,
        isAdmin
    }), [user, loading, isAuthenticated]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};
