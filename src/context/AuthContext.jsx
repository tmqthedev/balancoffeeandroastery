import React, { useState, useMemo, useEffect } from 'react';
import { useCallback } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { AuthContext } from '../constants/authConstants';

// Configure axios defaults
const API_BASE_URL = '/api';
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

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check if user is logged in on mount
    useEffect(() => {
        checkAuthStatus();
    }, []);

    // Refresh user data from server
    const refreshUser = useCallback(async () => {
        if (!isAuthenticated) return;
        
        try {
            const response = await api.get('/auth/me');
            setUser(response.data.user);
            return response.data.user;
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            return null;
        }
    }, [isAuthenticated]);

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
    const loginWithToken = useCallback(async (token) => {
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
    }, []);

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
            // Prepare registration data - only include required fields first
            const registrationData = {
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName,
                phone: userData.phone
            };

            // Only add optional fields if they have values
            if (userData.dateOfBirth && userData.dateOfBirth.trim()) {
                registrationData.dateOfBirth = userData.dateOfBirth;
            }
            if (userData.gender && userData.gender.trim()) {
                registrationData.gender = userData.gender;
            }
            if (userData.address && userData.address.trim()) {
                registrationData.address = userData.address;
            }
            if (userData.city && userData.city.trim()) {
                registrationData.city = userData.city;
            }
            if (userData.province && userData.province.trim()) {
                registrationData.province = userData.province;
            }
            if (userData.postalCode && userData.postalCode.trim()) {
                registrationData.postalCode = userData.postalCode;
            }

            const response = await api.post('/auth/register', registrationData);

            // Check if email verification is required
            if (response.data.requiresVerification) {
                // Return response data for frontend to handle
                return {
                    success: true,
                    requiresVerification: true,
                    message: response.data.message,
                    email: response.data.email
                };
            } else {
                // Normal registration flow (for social logins, etc.)
                const { token, user: newUser } = response.data;
                
                // Store token in localStorage
                localStorage.setItem('authToken', token);
                
                // Update state
                setUser(newUser);
                setIsAuthenticated(true);
                
                return { success: true };
            }
        } catch (error) {
            console.error('Registration failed:', error);
            
            // Handle different error response formats
            let errorMessage = 'Đăng ký thất bại';
            
            if (error.response?.data) {
                const { data } = error.response;
                if (data.error) {
                    errorMessage = data.error;
                } else if (data.errors && Array.isArray(data.errors)) {
                    // Handle validation errors from validateRequest middleware
                    errorMessage = data.errors.map(err => err.message || err.msg).join(', ');
                } else if (data.message) {
                    errorMessage = data.message;
                }
            }
            
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };    // Update user info
    const updateUserInfo = async (userData) => {
        setLoading(true);
        try {
            // Remove email from userData to prevent updating it
            // eslint-disable-next-line no-unused-vars
            const { email, ...updateData } = userData;
            
            console.log('📤 AuthContext: Sending profile update:', updateData);
            
            const response = await api.put('/users/profile', updateData, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem('authToken')}` 
                }
            });
            
            console.log('📥 AuthContext: Backend response:', response.data);
            
            if (response.data.success) {
                const updatedUser = response.data.user;
                console.log('✅ AuthContext: Updating user state with:', updatedUser);
                
                // Update context state
                setUser(updatedUser);
                
                // Update localStorage
                localStorage.setItem('user', JSON.stringify(updatedUser));
                
                return { success: true, message: response.data.message };
            } else {
                throw new Error(response.data.message || 'Cập nhật thông tin thất bại');
            }
        } catch (error) {
            console.error('❌ AuthContext: Update profile failed:', error);
            const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Cập nhật thông tin thất bại';
            return { success: false, message: errorMessage };
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
    };

    const value = useMemo(() => ({
        user,
        loading,
        isAuthenticated,
        login,
        loginWithToken,
        logout,
        register,
        updateUserInfo,
        changePassword,
        checkAuthStatus,
        refreshUser
    }), [user, loading, isAuthenticated, refreshUser, loginWithToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired,
};
