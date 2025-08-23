/**
 * Facebook SDK Service
 * Handles Facebook login and SDK interactions
 */

class FacebookService {
  constructor() {
    this.isInitialized = false;
    this.initPromise = null;
  }

  /**
   * Initialize Facebook SDK
   * @returns {Promise} Promise that resolves when SDK is ready
   */
  init() {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      // Check if FB SDK is already loaded
      if (window.FB) {
        this.isInitialized = true;
        resolve();
        return;
      }

      // Listen for SDK ready event
      const handleSdkReady = () => {
        this.isInitialized = true;
        window.removeEventListener('fb-sdk-ready', handleSdkReady);
        resolve();
      };

      window.addEventListener('fb-sdk-ready', handleSdkReady);

      // Fallback: Check periodically for FB object
      const checkFB = () => {
        if (window.FB) {
          this.isInitialized = true;
          window.removeEventListener('fb-sdk-ready', handleSdkReady);
          resolve();
        } else if (!this.isInitialized) {
          setTimeout(checkFB, 100);
        }
      };

      // Set timeout to avoid infinite waiting
      setTimeout(() => {
        if (!this.isInitialized) {
          window.removeEventListener('fb-sdk-ready', handleSdkReady);
          console.warn('Facebook SDK failed to load. Facebook login will be disabled. Check VITE_FACEBOOK_APP_ID configuration.');
          reject(new Error('Facebook SDK not available'));
        }
      }, 10000); // 10 second timeout

      checkFB();
    });

    return this.initPromise;
  }

  /**
   * Check if user is logged in to Facebook
   * @returns {Promise<Object|null>} User login status or null
   */
  async getLoginStatus() {
    await this.init();
    
    // Check if we're on HTTPS (required by Facebook)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      console.warn('Facebook login requires HTTPS. Current protocol:', window.location.protocol);
      throw new Error('Facebook login requires HTTPS. Please access the site via HTTPS.');
    }
    
    return new Promise((resolve, reject) => {
      try {
        window.FB.getLoginStatus((response) => {
          console.log('Facebook login status:', response);
          resolve(response);
        });
      } catch (error) {
        if (error.message && error.message.includes('http pages')) {
          console.error('Facebook requires HTTPS for login functionality. Please access the site via HTTPS.');
          reject(new Error('Facebook login requires HTTPS. Please access the site at https://localhost:5173'));
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Handle status change callback
   * @param {Object} response - Facebook login status response
   * @returns {Object} Processed status information
   */
  statusChangeCallback(response) {
    console.log('Facebook status change:', response);
    
    const statusInfo = {
      isConnected: response.status === 'connected',
      isAuthorized: response.status === 'connected' || response.status === 'not_authorized',
      isLoggedIntoFacebook: response.status === 'connected' || response.status === 'not_authorized',
      status: response.status,
      authResponse: response.authResponse || null,
      userID: response.authResponse?.userID || null,
      accessToken: response.authResponse?.accessToken || null
    };

    // Dispatch custom event for components to listen
    window.dispatchEvent(new CustomEvent('fb-status-change', { 
      detail: statusInfo 
    }));

    return statusInfo;
  }

  /**
   * Check login status and trigger status change callback
   * @returns {Promise<Object>} Login status information
   */
  async checkLoginStatus() {
    const response = await this.getLoginStatus();
    return this.statusChangeCallback(response);
  }

  /**
   * Login with Facebook
   * @param {Array} permissions - Facebook permissions to request
   * @returns {Promise<Object>} Facebook login response
   */
  async login(permissions = ['email', 'public_profile']) {
    await this.init();
    
    // Check if we're on HTTPS (required by Facebook)
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      throw new Error('Facebook login requires HTTPS. Please access the site via HTTPS.');
    }
    
    return new Promise((resolve, reject) => {
      try {
        window.FB.login((response) => {
          if (response.authResponse) {
            resolve(response);
          } else {
            reject(new Error('Facebook login was cancelled or failed'));
          }
        }, { scope: permissions.join(',') });
      } catch (error) {
        if (error.message && error.message.includes('http pages')) {
          reject(new Error('Facebook login requires HTTPS. Please access the site at https://localhost:5173'));
        } else {
          reject(error);
        }
      }
    });
  }

  /**
   * Logout from Facebook
   * @returns {Promise<Object>} Facebook logout response
   */
  async logout() {
    await this.init();
    
    return new Promise((resolve) => {
      window.FB.logout((response) => {
        resolve(response);
      });
    });
  }

  /**
   * Get user profile information
   * @param {Array} fields - Fields to retrieve
   * @returns {Promise<Object>} User profile data
   */
  async getUserProfile(fields = ['id', 'name', 'email', 'picture']) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      window.FB.api('/me', { fields: fields.join(',') }, (response) => {
        if (response && !response.error) {
          resolve(response);
        } else {
          reject(new Error(response.error?.message || 'Failed to get user profile'));
        }
      });
    });
  }

  /**
   * Share content on Facebook
   * @param {Object} shareData - Content to share
   * @returns {Promise<Object>} Share response
   */
  async share(shareData) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      window.FB.ui({
        method: 'share',
        href: shareData.href || window.location.href,
        ...shareData
      }, (response) => {
        if (response && !response.error_message) {
          resolve(response);
        } else {
          reject(new Error(response.error_message || 'Share cancelled'));
        }
      });
    });
  }

  /**
   * Check if Facebook SDK is loaded and initialized
   * @returns {boolean} True if SDK is ready
   */
  isReady() {
    return this.isInitialized && window.FB;
  }
}

// Export singleton instance
export default new FacebookService();
