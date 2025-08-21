// API Configuration for Balan Coffee & Roastery
// Backend API connection configuration

const apiConfig = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
};

// API endpoints
const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FACEBOOK: '/auth/facebook'
  },
  
  // Products
  PRODUCTS: {
    LIST: '/products',
    DETAIL: '/products',
    FEATURED: '/products/featured',
    SEARCH: '/products/search',
    CATEGORIES: '/categories'
  },
  
  // Orders
  ORDERS: {
    CREATE: '/orders',
    LIST: '/orders',
    DETAIL: '/orders',
    UPDATE: '/orders'
  },
  
  // Cart
  CART: {
    GET: '/cart',
    ADD: '/cart/add',
    UPDATE: '/cart/update',
    REMOVE: '/cart/remove',
    CLEAR: '/cart/clear'
  },
  
  // User
  USERS: {
    PROFILE: '/users/profile',
    UPDATE: '/users/profile',
    ADDRESSES: '/users/addresses',
    ORDERS: '/users/orders'
  },
  
  // Contact
  CONTACTS: {
    CREATE: '/contacts'
  },
  
  // Blog
  BLOGS: {
    LIST: '/blogs',
    DETAIL: '/blogs',
    FEATURED: '/blogs/featured'
  },
  
  // Payments
  PAYMENTS: {
    MOMO: '/payments/momo',
    MOMO_NOTIFY: '/payments/momo/notify',
    MOMO_RETURN: '/payments/momo/return'
  },
  
  // Upload
  UPLOAD: {
    IMAGE: '/upload/image',
    IMAGES: '/upload/images'
  }
};

// API utility functions
export const buildUrl = (endpoint, params = {}) => {
  let url = `${apiConfig.baseURL}${endpoint}`;
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      searchParams.append(key, value);
    }
  });
  
  const queryString = searchParams.toString();
  if (queryString) {
    url += `?${queryString}`;
  }
  
  return url;
};

export const getAuthHeaders = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Export configuration
export const config = apiConfig;
export const endpoints = API_ENDPOINTS;

// Legacy compatibility - for smooth transition from Firebase
export const auth = null; // No Firebase auth
export const db = null; // No Firebase Firestore
export const analytics = null; // No Firebase Analytics
export const storage = null; // No Firebase Storage

export default {
  config: apiConfig,
  endpoints: API_ENDPOINTS,
  buildUrl,
  getAuthHeaders
};
