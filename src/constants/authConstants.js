// Constants and utility functions for AuthContext
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export { AuthContext };

export const useAuth = () => {
    try {
        // Check if we're in a React component context
        if (typeof useContext !== 'function') {
            console.warn('useAuth called outside React component, using fallback');
            return getFallbackAuth();
        }
        
        const context = useContext(AuthContext);
        
        // If context is null or undefined, use fallback
        if (context === null || context === undefined) {
            console.warn('AuthContext is null or undefined, using fallback auth');
            return getFallbackAuth();
        }
        
        return context;
    } catch (error) {
        console.error('useAuth hook error:', error);
        return getFallbackAuth();
    }
};

const getFallbackAuth = () => {
    // Get auth data directly from localStorage as fallback
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('userData');
    
    let user = null;
    try {
        user = userData ? JSON.parse(userData) : null;
    } catch (e) {
        console.error('Failed to parse stored user data:', e);
    }

    return {
        user,
        loading: false,
        isAuthenticated: !!token,
        login: () => Promise.resolve({ success: false }),
        loginWithToken: () => Promise.resolve({ success: false }),
        logout: () => {
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            window.location.reload();
        },
        register: () => Promise.resolve({ success: false }),
        updateUserInfo: () => Promise.resolve({ success: false }),
        changePassword: () => Promise.resolve({ success: false }),
        checkAuthStatus: () => {},
        refreshUser: () => Promise.resolve(null)
    };
};
