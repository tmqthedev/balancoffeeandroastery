/**
 * Advanced logging middleware for tracking application activity and errors
 */
const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Create access and error log streams
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom format for access logs
const accessLogFormat = process.env.NODE_ENV === 'production'
  ? ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'
  : 'dev';

// Access logging middleware
const accessLogger = morgan(accessLogFormat, { 
  stream: accessLogStream,
  skip: (req, res) => res.statusCode >= 400 
});

// Error logging middleware
const errorLogger = morgan(
  ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms - ERROR: :message', 
  {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  }
);

// Custom error handler middleware
const errorHandler = (err, req, res, next) => {
  const timestamp = new Date().toISOString();
  const errorMessage = err.stack || err.message || 'Unknown error';
  const logEntry = `[${timestamp}] ${req.method} ${req.url} - ${err.status || 500}: ${errorMessage}\n`;
  
  // Write to error log
  fs.appendFileSync(path.join(logsDir, 'error.log'), logEntry);
  
  // Add error to request for morgan error logger
  req.errorMessage = err.message || 'Unknown error';
  
  // Determine if error details should be exposed to client
  const isProduction = process.env.NODE_ENV === 'production';
  const clientError = {
    status: 'error',
    statusCode: err.status || 500,
    message: isProduction && err.status !== 400
      ? 'Đã xảy ra lỗi. Vui lòng thử lại sau.'
      : err.message || 'Đã xảy ra lỗi'
  };
  
  // In development, add stack trace to response
  if (!isProduction) {
    clientError.stack = err.stack;
  }
  
  res.status(err.status || 500).json(clientError);
};

// Request tracking middleware
const requestTracker = (req, res, next) => {
  const startTime = Date.now();
  
  // Function to execute after response has finished
  function logResponse() {
    const duration = Date.now() - startTime;
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'Unknown';
    
    // For authenticated users, include user ID
    const userId = req.user ? req.user.userId : 'guest';
    
    const logEntry = {
      timestamp,
      method: req.method,
      url: req.originalUrl || req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent,
      ip: req.ip || req.headers['x-forwarded-for'] || 'Unknown',
      userId
    };
    
    // Log to application insights or similar service in production
    if (process.env.NODE_ENV === 'production') {
      // Application Insights or other monitoring service would go here
      // applicationInsights.trackRequest(logEntry);
      console.log(JSON.stringify(logEntry));
    } else {
      // Simpler console logging for development
      console.log(`${timestamp} | ${req.method} ${req.originalUrl} | ${res.statusCode} | ${duration}ms | User: ${userId}`);
    }
  }
  
  // Listen for response finish event
  res.on('finish', logResponse);
  
  next();
};

// Throttle middleware for high-frequency routes
const throttle = (maxRequests, timeWindow, message) => {
  const requests = {};
  
  return (req, res, next) => {
    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    
    if (!requests[ip]) {
      requests[ip] = {
        count: 1,
        resetAt: Date.now() + timeWindow
      };
      return next();
    }
    
    // Reset count if time window has passed
    if (Date.now() > requests[ip].resetAt) {
      requests[ip] = {
        count: 1,
        resetAt: Date.now() + timeWindow
      };
      return next();
    }
    
    // Increment count
    requests[ip].count++;
    
    // Check if threshold exceeded
    if (requests[ip].count > maxRequests) {
      return res.status(429).json({
        status: 'error',
        message: message || 'Quá nhiều yêu cầu, vui lòng thử lại sau.'
      });
    }
    
    next();
  };
};

module.exports = {
  accessLogger,
  errorLogger,
  errorHandler,
  requestTracker,
  throttle
};
