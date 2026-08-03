import api from './apiClient';

const AUTH_STATE_KEY = 'authState';

class AuthService {
  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return {
      success: true,
      user: response.data.user,
      requiresVerification: response.data.requiresConfirmation || response.data.requiresVerification,
      email: response.data.email,
      message: response.data.message
    };
  }

  async confirmSignUp(email, code) {
    const response = await api.post('/auth/confirm-sign-up', { email, code });
    return response.data;
  }

  async resendConfirmation(email) {
    const response = await api.post('/auth/resend-confirmation', { email });
    return response.data;
  }

  async login(email, password, remember = false) {
    const response = await api.post('/auth/login', {
      email,
      password,
      rememberMe: remember
    });

    localStorage.setItem(AUTH_STATE_KEY, 'authenticated');
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return {
      success: true,
      user: response.data.user
    };
  }

  async logout() {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem('user');
    }

    return { success: true };
  }

  async resetPassword(email) {
    await api.post('/auth/forgot-password', { email });
    return { success: true };
  }

  async confirmForgotPassword(email, code, newPassword) {
    await api.post('/auth/confirm-forgot-password', {
      email,
      code,
      newPassword
    });
    return { success: true };
  }

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    localStorage.setItem('user', JSON.stringify(response.data.user));

    return {
      success: true,
      user: response.data.user
    };
  }

  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      localStorage.setItem(AUTH_STATE_KEY, 'authenticated');
      localStorage.setItem('user', JSON.stringify(response.data.user));

      return {
        success: true,
        user: response.data.user
      };
    } catch (error) {
      localStorage.removeItem(AUTH_STATE_KEY);
      localStorage.removeItem('user');
      return { success: false, user: null };
    }
  }

  isAuthenticated() {
    return localStorage.getItem(AUTH_STATE_KEY) === 'authenticated';
  }

  getToken() {
    return null;
  }

  storeAuthData(_token, user) {
    localStorage.setItem(AUTH_STATE_KEY, 'authenticated');
    localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredUser() {
    try {
      const userData = localStorage.getItem('user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing stored user data:', error);
      return null;
    }
  }
}

export default new AuthService();
