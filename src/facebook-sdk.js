/**
 * Facebook SDK Initialization
 * This file initializes Facebook SDK with environment variables
 */

// Initialize Facebook SDK when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  // Get Facebook App ID from environment variable
  const facebookAppId = import.meta.env.VITE_FACEBOOK_APP_ID || '1234567890';
  
  // Only initialize if we have a valid App ID
  if (facebookAppId && facebookAppId !== 'your_facebook_app_id_here') {
    window.fbAsyncInit = function() {
      FB.init({
        appId      : facebookAppId,
        cookie     : true,
        xfbml      : true,
        version    : 'v19.0'
      });
        
      FB.AppEvents.logPageView();
      
      // Dispatch custom event to indicate FB SDK is ready
      window.dispatchEvent(new CustomEvent('fb-sdk-ready'));
    };

    // Load Facebook SDK script
    (function(d, s, id){
       let js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = "https://connect.facebook.net/vi_VN/sdk.js";
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));
  } else {
    console.warn('Facebook App ID not configured. Please set VITE_FACEBOOK_APP_ID in your .env.local file');
  }
});
