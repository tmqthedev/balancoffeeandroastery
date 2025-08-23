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
          reject(new Error('Facebook SDK failed to load. Please check if VITE_FACEBOOK_APP_ID is configured.'));
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
    
    return new Promise((resolve) => {
      window.FB.getLoginStatus((response) => {
        resolve(response);
      });
    });
  }

  /**
   * Login with Facebook
   * @param {Array} permissions - Facebook permissions to request
   * @returns {Promise<Object>} Facebook login response
   */
  async login(permissions = ['email', 'public_profile']) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      window.FB.login((response) => {
        if (response.authResponse) {
          resolve(response);
        } else {
          reject(new Error('Facebook login was cancelled or failed'));
        }
      }, { scope: permissions.join(',') });
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
