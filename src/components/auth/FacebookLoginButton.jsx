import React, { useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useFacebook } from '../../hooks/useFacebook';

/**
 * Official Facebook Login Button Component
 * Uses Facebook's native login button with XFBML
 */
const FacebookLoginButton = ({ 
  onLoginSuccess, 
  onLoginError, 
  size = 'large',
  buttonText = 'continue_with',
  scope = 'email,public_profile',
  className = '',
  disabled = false,
  configId = null // Optional config_id for advanced login button configuration
}) => {
  const buttonRef = useRef(null);
  const { isLoaded, error } = useFacebook();

  // Show fallback button if Facebook SDK failed to load
  const shouldShowFallback = error && error.includes('Facebook SDK not available');

  // Handle successful login
  const handleLoginSuccess = useCallback(async (response) => {
    try {
      if (response.authResponse) {
        // Get user profile from Facebook
        const userProfile = await new Promise((resolve, reject) => {
          window.FB.api('/me', { 
            fields: 'id,name,email,picture' 
          }, (profile) => {
            if (profile.error) {
              reject(new Error(profile.error.message));
            } else {
              resolve(profile);
            }
          });
        });

        // Call success callback with both response and profile
        if (onLoginSuccess) {
          onLoginSuccess({
            authResponse: response.authResponse,
            userProfile: userProfile
          });
        }
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      if (onLoginError) {
        onLoginError(error);
      }
    }
  }, [onLoginSuccess, onLoginError]);

  // Global callback function for Facebook login button
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Status change callback
      const statusChangeCallback = function(response) {
        console.log('Facebook login response:', response);
        
        if (response.status === 'connected') {
          // User is logged into Facebook and has authorized your app
          handleLoginSuccess(response);
        } else if (response.status === 'not_authorized') {
          // User is logged into Facebook but has not authorized your app
          // This is normal - don't treat as error, just show the login button
          console.log('User is logged into Facebook but has not authorized the app');
        } else {
          // User is not logged into Facebook or status is unknown
          // This is also normal - don't treat as error
          console.log('User login status:', response.status);
        }
      };

      // Define global checkLoginState function for Facebook button
      window.checkLoginState = function() {
        if (window.FB) {
          window.FB.getLoginStatus(function(response) {
            statusChangeCallback(response);
          });
        }
      };

      // Also store the callback globally for direct access
      window.statusChangeCallback = statusChangeCallback;
    }

    return () => {
      // Cleanup global functions
      if (typeof window !== 'undefined') {
        delete window.checkLoginState;
        delete window.statusChangeCallback;
      }
    };
  }, [handleLoginSuccess]);

  // Re-parse XFBML when Facebook SDK is loaded
  useEffect(() => {
    if (isLoaded && window.FB && buttonRef.current) {
      // Parse the button element
      window.FB.XFBML.parse(buttonRef.current);
    }
  }, [isLoaded]);

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center p-3 bg-gray-100 rounded-lg ${className}`}>
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-2"></div>
        <span className="text-gray-600">Đang tải Facebook...</span>
      </div>
    );
  }

  return (
    <div 
      ref={buttonRef}
      className={`facebook-login-container ${className} ${disabled ? 'pointer-events-none opacity-50' : ''}`}
    >
      {!shouldShowFallback ? (
        <div
          className="fb-login-button"
          data-width=""
          data-size={size}
          data-button-type={buttonText}
          data-layout="default"
          data-auto-logout-link="false"
          data-use-continue-as="true"
          data-scope={scope}
          data-onlogin="checkLoginState();"
          {...(configId && { 'data-config-id': configId })}
        ></div>
      ) : null}
      
      {/* Fallback custom button if Facebook button doesn't load */}
      <div 
        className={shouldShowFallback ? "facebook-fallback-button" : "facebook-fallback-button hidden"}
        style={{ display: shouldShowFallback ? 'block' : 'none' }}
      >
        <button
          type="button"
          onClick={() => {
            if (shouldShowFallback) {
              if (onLoginError) {
                onLoginError(new Error('Facebook login is currently unavailable. Please try alternative login methods.'));
              }
            } else if (window.FB) {
              window.FB.login(function(response) {
                window.statusChangeCallback(response);
              }, { scope: scope });
            }
          }}
          disabled={disabled}
          className={`w-full flex items-center justify-center px-4 py-3 border-2 rounded-lg transition-colors ${
            shouldShowFallback 
              ? 'border-gray-400 bg-gray-400 text-white cursor-not-allowed' 
              : 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          {shouldShowFallback ? 'Facebook không khả dụng' : 'Tiếp tục với Facebook'}
        </button>
      </div>
    </div>
  );
};

FacebookLoginButton.propTypes = {
  onLoginSuccess: PropTypes.func,
  onLoginError: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  buttonText: PropTypes.string,
  scope: PropTypes.string,
  className: PropTypes.string,
  disabled: PropTypes.bool,
  configId: PropTypes.string
};

export default FacebookLoginButton;
