import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

let refreshPromise = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isAuthEndpoint = [
      '/auth/login',
      '/auth/register',
      '/auth/refresh',
      '/auth/logout',
      '/auth/forgot-password',
      '/auth/confirm-forgot-password',
      '/auth/confirm-sign-up',
      '/auth/resend-confirmation'
    ].some((path) => url.includes(path));

    if (status !== 401 || originalRequest?._retry || isAuthEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = apiClient.post('/auth/refresh');
      }

      await refreshPromise;
      return apiClient(originalRequest);
    } catch (refreshError) {
      window.dispatchEvent(new CustomEvent('auth-session-expired'));
      return Promise.reject(refreshError);
    } finally {
      refreshPromise = null;
    }
  }
);

export default apiClient;
