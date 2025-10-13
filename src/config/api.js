// API Configuration for Production and Development
const config = {
  development: {
    API_BASE_URL: 'http://localhost:5000',
    API_ENDPOINTS: {
      products: '/api/products',
      users: '/api/users',
      auth: '/api/auth',
      cart: '/api/cart',
      orders: '/api/orders',
      blogs: '/api/blogs',
      contacts: '/api/contacts',
      payments: '/api/payments',
      upload: '/api/upload'
    }
  },
  production: {
    // Same domain deployment - use relative paths
    API_BASE_URL: '',
    API_ENDPOINTS: {
      products: '/api/products',
      users: '/api/users', 
      auth: '/api/auth',
      cart: '/api/cart',
      orders: '/api/orders',
      blogs: '/api/blogs',
      contacts: '/api/contacts',
      payments: '/api/payments',
      upload: '/api/upload'
    }
  }
};

// Get current environment
const environment = import.meta.env.MODE || 'development';
const isProd = environment === 'production';

// Export configuration
export const API_BASE_URL = config[environment].API_BASE_URL;
export const API_ENDPOINTS = config[environment].API_ENDPOINTS;

// Helper function to build API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Environment check
export const isDevelopment = !isProd;
export const isProduction = isProd;

// MongoDB Connection Status Check
export const checkApiHealth = async () => {
  try {
    const response = await fetch(buildApiUrl('/health'));
    return response.ok;
  } catch (error) {
    console.error('API Health Check Failed:', error);
    return false;
  }
};

export default config[environment];