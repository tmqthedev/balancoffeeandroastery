# Facebook Login Setup Guide

## Prerequisites

1. **Facebook Developer Account**: Create an account at [developers.facebook.com](https://developers.facebook.com)
2. **Facebook App**: Create a new app in the Facebook Developer Console

## Step 1: Create Facebook App

1. Go to [Facebook Developer Console](https://developers.facebook.com)
2. Click "My Apps" → "Create App"
3. Choose "Consumer" as app type
4. Fill in app details:
   - **App Name**: Balan Coffee & Roastery
   - **Contact Email**: your-email@example.com
   - **App Purpose**: E-commerce website with blog

## Step 2: Configure Facebook Login

1. In your Facebook app dashboard, click "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" platform
4. Enter your site URL: `http://localhost:3000` (for development)

### Configure OAuth Settings

1. Go to Facebook Login → Settings
2. Set **Valid OAuth Redirect URIs**:
   ```
   http://localhost:5000/api/auth/facebook/callback
   https://yourdomain.com/api/auth/facebook/callback
   ```
3. Set **Valid Client OAuth Login**: `Yes`
4. Set **Valid Web OAuth Login**: `Yes`

## Step 3: Get App Credentials

1. Go to Settings → Basic
2. Copy your **App ID** and **App Secret**
3. Add these to your environment variables

## Step 4: Environment Configuration

### Backend (.env)
```env
FACEBOOK_APP_ID=your_facebook_app_id
FACEBOOK_APP_SECRET=your_facebook_app_secret
FACEBOOK_CALLBACK_URL=http://localhost:5000/api/auth/facebook/callback
```

### Frontend (.env.local)
```env
VITE_FACEBOOK_APP_ID=your_facebook_app_id
```

## Step 5: Update Facebook SDK Script

The Facebook SDK is already configured in `index.html`:

```html
<script>
  window.fbAsyncInit = function() {
    FB.init({
      appId      : import.meta.env.VITE_FACEBOOK_APP_ID,
      cookie     : true,
      xfbml      : true,
      version    : 'v18.0'
    });
      
    FB.AppEvents.logPageView();   
  };

  (function(d, s, id){
     var js, fjs = d.getElementsByTagName(s)[0];
     if (d.getElementById(id)) {return;}
     js = d.createElement(s); js.id = id;
     js.src = "https://connect.facebook.net/vi_VN/sdk.js";
     fjs.parentNode.insertBefore(js, fjs);
   }(document, 'script', 'facebook-jssdk'));
</script>
```

## Step 6: App Review (Production)

For production deployment, you need to submit your app for review:

1. Go to App Review in Facebook Developer Console
2. Add permissions you need:
   - `email` (automatically approved)
   - `public_profile` (automatically approved)
3. Submit for review if additional permissions needed

## Step 7: Production Configuration

### Update App Domains
1. Go to Settings → Basic
2. Add your production domain to **App Domains**
3. Update **Privacy Policy URL** and **Terms of Service URL**

### Update OAuth Settings
1. Go to Facebook Login → Settings
2. Add production URLs to **Valid OAuth Redirect URIs**:
   ```
   https://yourdomain.com/api/auth/facebook/callback
   ```

## Step 8: Testing

### Test Facebook Login Flow

1. Start your development server
2. Go to login page
3. Click "Đăng nhập với Facebook"
4. Complete Facebook login
5. Verify user is created/logged in

### Debug Issues

Use Facebook's debug tools:
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)
- [Sharing Debugger](https://developers.facebook.com/tools/debug/)

## Common Issues

### 1. "App Not Setup" Error
- Ensure Facebook Login product is added to your app
- Check that OAuth redirect URIs are configured correctly

### 2. "Invalid OAuth access token" Error
- Verify your App Secret is correct
- Check that the access token hasn't expired

### 3. "Domain not allowed" Error
- Add your domain to App Domains in Facebook app settings
- Ensure OAuth redirect URI matches exactly

### 4. CORS Issues
- Add your frontend domain to CORS configuration in your backend

## Security Best Practices

1. **Never expose App Secret** in frontend code
2. **Always verify** access tokens on the backend
3. **Use HTTPS** in production
4. **Validate user data** from Facebook API
5. **Implement rate limiting** for auth endpoints

## Available Features

### 1. Facebook Login
- Login with email and public profile
- Automatic account creation
- Link existing accounts

### 2. Facebook SDK Service
```javascript
import facebookService from './services/facebookService';

// Login
const response = await facebookService.login(['email', 'public_profile']);

// Get user profile
const profile = await facebookService.getUserProfile();

// Share content
await facebookService.share({
  href: 'https://yoursite.com/product/123'
});
```

### 3. React Hook
```javascript
import { useFacebook } from './hooks/useFacebook';

const { isLoggedIn, user, login, logout, share } = useFacebook();
```

## Support

For issues or questions:
1. Check Facebook Developer Documentation
2. Use Facebook Developer Support
3. Check browser console for error messages
4. Verify environment variables are set correctly
