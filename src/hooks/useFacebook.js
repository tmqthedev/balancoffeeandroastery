import { useState, useEffect } from 'react';
import facebookService from '../services/facebookService';

/**
 * React hook for Facebook SDK integration
 * @param {Object} options - Configuration options
 * @returns {Object} Facebook SDK state and methods
 */
export const useFacebook = (options = {}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedIntoFacebook, setIsLoggedIntoFacebook] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loginStatus, setLoginStatus] = useState('unknown');

  useEffect(() => {
    const initializeFacebook = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize Facebook SDK
        await facebookService.init();
        setIsLoaded(true);

        // Check login status if requested
        if (options.checkLoginStatus !== false) {
          const statusInfo = await facebookService.checkLoginStatus();
          
          setLoginStatus(statusInfo.status);
          setIsLoggedIn(statusInfo.isConnected);
          setIsLoggedIntoFacebook(statusInfo.isLoggedIntoFacebook);
          
          // Get user profile if connected
          if (statusInfo.isConnected && options.getUserProfile !== false) {
            try {
              const userProfile = await facebookService.getUserProfile();
              setUser(userProfile);
            } catch (profileError) {
              console.warn('Could not fetch user profile:', profileError);
            }
          }
        }
      } catch (err) {
        setError(err.message);
        // Only log warning for SDK not available, not a full error
        if (err.message.includes('Facebook SDK not available')) {
          console.warn('Facebook login disabled:', err.message);
        } else {
          console.error('Facebook initialization error:', err);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeFacebook();

    // Listen for status changes
    const handleStatusChange = (event) => {
      const statusInfo = event.detail;
      setLoginStatus(statusInfo.status);
      setIsLoggedIn(statusInfo.isConnected);
      setIsLoggedIntoFacebook(statusInfo.isLoggedIntoFacebook);
      
      if (!statusInfo.isConnected) {
        setUser(null);
      }
    };

    window.addEventListener('fb-status-change', handleStatusChange);

    return () => {
      window.removeEventListener('fb-status-change', handleStatusChange);
    };
  }, [options.checkLoginStatus, options.getUserProfile]);

  /**
   * Login with Facebook
   * @param {Array} permissions - Facebook permissions to request
   * @returns {Promise<Object>} Login response
   */
  const login = async (permissions = ['email', 'public_profile']) => {
    try {
      setLoading(true);
      setError(null);

      const response = await facebookService.login(permissions);
      
      if (response.authResponse) {
        setIsLoggedIn(true);
        
        // Get user profile
        const userProfile = await facebookService.getUserProfile();
        setUser(userProfile);
        
        return response;
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout from Facebook
   */
  const logout = async () => {
    try {
      setLoading(true);
      setError(null);

      await facebookService.logout();
      setIsLoggedIn(false);
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Share content on Facebook
   * @param {Object} shareData - Content to share
   * @returns {Promise<Object>} Share response
   */
  const share = async (shareData) => {
    try {
      setError(null);
      return await facebookService.share(shareData);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  /**
   * Get fresh user profile data
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object>} User profile
   */
  const getUserProfile = async (fields) => {
    try {
      setError(null);
      const profile = await facebookService.getUserProfile(fields);
      setUser(profile);
      return profile;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    // State
    isLoaded,
    isLoggedIn,
    isLoggedIntoFacebook,
    user,
    loading,
    error,
    loginStatus,
    
    // Methods
    login,
    logout,
    share,
    getUserProfile,
    checkLoginStatus: () => facebookService.checkLoginStatus(),
    
    // Service instance for advanced usage
    service: facebookService
  };
};

export default useFacebook;
