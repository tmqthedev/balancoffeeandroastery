// Facebook SDK Debug Utility
// Add this to browser console to debug Facebook issues

console.log('=== FACEBOOK SDK DEBUG ===');

// Check environment variables
console.log('VITE_FACEBOOK_APP_ID:', import.meta.env.VITE_FACEBOOK_APP_ID);

// Check if Facebook SDK is loaded
console.log('FB object exists:', typeof window.FB !== 'undefined');

// Check if Facebook App ID is valid
const appId = import.meta.env.VITE_FACEBOOK_APP_ID;
const isValidAppId = appId && 
                    appId !== 'your_facebook_app_id_here' && 
                    appId !== '1234567890' &&
                    appId.length > 10;

console.log('App ID is valid:', isValidAppId);
console.log('App ID value:', appId);

// Check Facebook login status
if (window.FB) {
  window.FB.getLoginStatus(function(response) {
    console.log('Facebook login status:', response);
  });
} else {
  console.log('Facebook SDK not loaded');
}

// Check for Facebook script tag
const fbScript = document.getElementById('facebook-jssdk');
console.log('Facebook script tag exists:', !!fbScript);
if (fbScript) {
  console.log('Facebook script src:', fbScript.src);
}
