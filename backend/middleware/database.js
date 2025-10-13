const mongoose = require('mongoose');

// Database error handler middleware
const handleDatabaseError = (error, req, res, next) => {
  console.error('❌ Database Error:', error);
  
  // MongoDB connection errors
  if (error.name === 'MongoNetworkError') {
    return res.status(503).json({
      error: 'Database connection failed',
      message: 'Unable to connect to database. Please try again later.',
      code: 'DB_CONNECTION_ERROR'
    });
  }
  
  // MongoDB timeout errors
  if (error.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      error: 'Database server unavailable',
      message: 'Database server is temporarily unavailable. Please try again later.',
      code: 'DB_SERVER_ERROR'
    });
  }
  
  // MongoDB operation timeout
  if (error.name === 'MongoTimeoutError') {
    return res.status(408).json({
      error: 'Database operation timeout',
      message: 'The database operation took too long to complete.',
      code: 'DB_TIMEOUT_ERROR'
    });
  }
  
  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      message: error.message,
      code: 'VALIDATION_ERROR'
    });
  }
  
  // Cast errors (invalid ObjectId, etc.)
  if (error.name === 'CastError') {
    return res.status(400).json({
      error: 'Invalid data format',
      message: `Invalid ${error.path}: ${error.value}`,
      code: 'CAST_ERROR'
    });
  }
  
  // Duplicate key errors
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(409).json({
      error: 'Duplicate entry',
      message: `${field} already exists`,
      code: 'DUPLICATE_ERROR'
    });
  }
  
  // Generic database errors
  if (error.name.includes('Mongo')) {
    return res.status(500).json({
      error: 'Database error',
      message: process.env.NODE_ENV === 'production' 
        ? 'An error occurred while processing your request.' 
        : error.message,
      code: 'DB_ERROR'
    });
  }
  
  // Pass to next error handler if not a database error
  next(error);
};

// Database connection checker middleware
const checkDatabaseConnection = async (req, res, next) => {
  try {
    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        error: 'Database unavailable',
        message: 'Database connection is not ready. Please try again later.',
        code: 'DB_NOT_CONNECTED'
      });
    }
    
    // Ping database to ensure it's responsive
    await mongoose.connection.db.admin().ping();
    next();
    
  } catch (error) {
    console.error('❌ Database ping failed:', error);
    return res.status(503).json({
      error: 'Database health check failed',
      message: 'Database is not responding. Please try again later.',
      code: 'DB_HEALTH_CHECK_FAILED'
    });
  }
};

// Connection retry helper
const connectWithRetry = async (connectDB, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${maxRetries}`);
      await connectDB();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error(`❌ Connection attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('💥 All connection attempts failed');
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      console.log(`⏳ Waiting ${waitTime}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
};

// Database health check endpoint
const createHealthCheck = () => {
  return async (req, res) => {
    try {
      const dbStatus = {
        connected: mongoose.connection.readyState === 1,
        state: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      };
      
      if (dbStatus.connected) {
        // Test database responsiveness
        await mongoose.connection.db.admin().ping();
        
        res.json({
          status: 'healthy',
          database: dbStatus,
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(503).json({
          status: 'unhealthy',
          database: dbStatus,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  };
};

module.exports = {
  handleDatabaseError,
  checkDatabaseConnection,
  connectWithRetry,
  createHealthCheck
};