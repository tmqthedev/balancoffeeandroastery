// Constants and utility functions for AuthContext
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export { AuthContext };

export const useAuth = () => {
    try {
        const context = useContext(AuthContext);
        
        // If context is null or undefined, use fallback
        if (context === null || context === undefined) {
            console.warn('❌ AuthContext is not available - component may be outside AuthProvider');
            return getFallbackAuth();
        }
        
        return context;
    } catch (error) {
        console.error('❌ useAuth error:', error);
        return getFallbackAuth();
    }
    
    // If context is null or undefined, use fallback
    if (context === null || context === undefined) {
        console.warn('❌ AuthContext is not available - component may be outside AuthProvider');
        return getFallbackAuth();
    }
    
    return context;
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
