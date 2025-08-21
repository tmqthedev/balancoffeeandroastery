// Error logger utility for production
const logError = (error, errorInfo = {}) => {
  const isProd = false; // Development mode
  if (isProd) {
    // In production, send errors to monitoring service
    // For now, we'll use a simple console.error with structured data
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...errorInfo
    };
    
    // Replace console.error with actual error reporting service in production
    console.error('Production Error:', errorData);
    
    // You can integrate with services like Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: errorInfo });
  } else {
    // In development, log to console
    console.error('Development Error:', error, errorInfo);
  }
};

// API error handler
const handleAPIError = (error, operation = 'API call') => {
  const errorMessage = error.response?.data?.message || error.message || 'An unexpected error occurred';
  
  logError(error, {
    operation,
    status: error.response?.status,
    data: error.response?.data
  });
  
  return {
    success: false,
    message: errorMessage,
    status: error.response?.status || 500
  };
};

// Network error detector
const isNetworkError = (error) => {
  return !error.response && error.request;
};

// Retry mechanism for failed requests
const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

export { logError, handleAPIError, isNetworkError, retryRequest };
