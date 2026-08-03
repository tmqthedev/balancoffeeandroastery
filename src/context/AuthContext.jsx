import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/apiClient';

export const AuthContext = createContext(null);

const AUTH_STATE_KEY = 'authState';

const setAuthStateMarker = (isAuthenticated) => {
  if (isAuthenticated) {
    localStorage.setItem(AUTH_STATE_KEY, 'authenticated');
  } else {
    localStorage.removeItem(AUTH_STATE_KEY);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const applyUser = useCallback((userData) => {
    setUser(userData || null);
    setIsAuthenticated(!!userData);
    setAuthStateMarker(!!userData);

    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await api.get('/auth/me');
      applyUser(response.data.user);
      return response.data.user;
    } catch (error) {
      applyUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, [applyUser]);

  useEffect(() => {
    checkAuthStatus();

    const handleSessionExpired = () => {
      applyUser(null);
    };

    window.addEventListener('auth-session-expired', handleSessionExpired);
    return () => window.removeEventListener('auth-session-expired', handleSessionExpired);
  }, [applyUser, checkAuthStatus]);

  const refreshUser = useCallback(async () => {
    if (!isAuthenticated) return null;
    return checkAuthStatus();
  }, [checkAuthStatus, isAuthenticated]);

  const login = async (email, password, remember = false) => {
    setLoading(true);

    try {
      const response = await api.post('/auth/login', {
        email,
        password,
        rememberMe: remember
      });

      applyUser(response.data.user);

      window.dispatchEvent(new CustomEvent('auth-login-complete'));
      return { success: true, user: response.data.user };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Login failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loginWithToken = useCallback(async () => {
    return checkAuthStatus();
  }, [checkAuthStatus]);

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      localStorage.removeItem('cart');
      localStorage.removeItem('buyNowProduct');
      applyUser(null);
      window.dispatchEvent(new CustomEvent('auth-logout-complete'));
    }
  };

  const register = async (userData) => {
    setLoading(true);

    try {
      const registrationData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        fullName: userData.fullName,
        phone: userData.phone
      };

      [
        'dateOfBirth',
        'gender',
        'address',
        'city',
        'province',
        'postalCode'
      ].forEach((key) => {
        if (userData[key] && String(userData[key]).trim()) {
          registrationData[key] = userData[key];
        }
      });

      const response = await api.post('/auth/register', registrationData);
      return {
        success: true,
        requiresVerification: response.data.requiresConfirmation || response.data.requiresVerification,
        message: response.data.message,
        email: response.data.email,
        user: response.data.user
      };
    } catch (error) {
      const data = error.response?.data;
      const errorMessage = data?.error || data?.message || data?.errors?.map((err) => err.msg || err.message).join(', ') || 'Registration failed';
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const confirmSignUp = async (email, code) => {
    const response = await api.post('/auth/confirm-sign-up', { email, code });
    return response.data;
  };

  const resendConfirmation = async (email) => {
    const response = await api.post('/auth/resend-confirmation', { email });
    return response.data;
  };

  const updateUserInfo = async (userData) => {
    setLoading(true);

    try {
      const { email, ...updateData } = userData;
      const response = await api.put('/users/profile', updateData);
      const updatedUser = response.data.user;
      applyUser(updatedUser);
      return { success: true, message: response.data.message };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Profile update failed';
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setLoading(true);

    try {
      await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.response?.data?.message || 'Change password failed';
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
    confirmSignUp,
    resendConfirmation,
    updateUserInfo,
    changePassword,
    checkAuthStatus,
    refreshUser
  }), [user, loading, isAuthenticated, loginWithToken, checkAuthStatus, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};
