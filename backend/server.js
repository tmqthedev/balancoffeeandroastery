const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { getRuntimeConfig } = require('./config/runtimeConfig');
const { getPostgresPool, testPostgresConnection, closePostgresPool } = require('./config/postgres');
const logger = require('./utils/logger');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


logger.info('🔗 Database Configuration (Backend):');
logger.info('   Environment:', process.env.NODE_ENV || 'development');
logger.info('   Using Secrets Manager:', !!process.env.DATABASE_SECRET_ID);
logger.info('   Database provider:', process.env.DATABASE_PROVIDER || 'postgres');

// Global database connection flag
let isConnected = false;
let db = null;
let activeDatabaseProvider = null;

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "https://api.payos.vn", "https://pay.payos.vn"]
    }
  }
}));

// CORS configuration - Enhanced for production
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CORS_ORIGIN,
  'https://balancoffeeandroastery.vercel.app', // Production domain
  /https:\/\/.*\.vercel\.app$/ // All Vercel preview deployments
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed
    const isAllowed = allowedOrigins.some(allowed => {
      if (typeof allowed === 'string') return allowed === origin;
      if (allowed instanceof RegExp) return allowed.test(origin);
      return false;
    });
    
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn('⚠️ CORS blocked origin:', origin);
      callback(null, false); // Allow but log warning in production
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'cache-control', 'pragma', 'expires'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  maxAge: 86400 // 24 hours
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  // Return a JSON response and include Retry-After header to be friendly to API clients
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the deprecated `X-RateLimit-*` headers
  handler: (req, res /*, next */) => {
    const retryAfterSec = Math.ceil((15 * 60));
    res.set('Retry-After', String(retryAfterSec));
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP, please try again later.'
    });
  }
});
// Mount rate limiter only in non-development environments to avoid blocking local dev/testing
if (process.env.NODE_ENV === 'development') {
  logger.info('⚠️ Rate limiter disabled in development mode');
} else {
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// PostgreSQL connection function with enhanced logging
async function connectToDatabase() {
  if (isConnected && db) {
    logger.debug(`Using existing ${activeDatabaseProvider || 'database'} connection (Backend)`);
    return db;
  }

  try {
    const runtimeConfig = await getRuntimeConfig();

    logger.info('Backend: Attempting to connect to PostgreSQL...');

    const connectStart = Date.now();
    const postgresPool = await getPostgresPool();
    const connectionInfo = await testPostgresConnection();
    const connectTime = Date.now() - connectStart;

    db = postgresPool;
    isConnected = true;
    activeDatabaseProvider = runtimeConfig.databaseProvider;

    logger.info(`Backend: PostgreSQL connected in ${connectTime}ms`);
    logger.info('Backend: Connected to PostgreSQL database:', connectionInfo.database);

    return db;
  } catch (error) {
    logger.error('Backend: Database connection failed:');
    logger.error('   Error Type:', error.name);
    logger.error('   Error Message:', error.message);
    logger.error('   Error Code:', error.code);

    if (error.code === 8000) {
      logger.error('Backend: Authentication failed - check username/password');
    } else if (error.code === 6) {
      logger.error('Backend: Network error - check connection and firewall');
    } else if (error.message.includes('ENOTFOUND')) {
      logger.error('Backend: DNS resolution failed - check connection string');
    }

    isConnected = false;
    throw error;
  }
}
// Logging middleware
app.use(morgan('combined'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  logger.debug(`🔍 ${req.method} ${req.url}`);
  next();
});

// Static files - serve from backend uploads directory
// Maps /uploads/products/file.jpg to backend/uploads/products/file.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Maps /backend/uploads/products/file.jpg to backend/uploads/products/file.jpg  
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint with detailed logging
app.get('/health', async (req, res) => {
  logger.info('🏥 Backend: Health check requested from:', req.ip);
  
  try {
    const healthStart = Date.now();
    const database = await connectToDatabase();
    const healthTime = Date.now() - healthStart;
    
    logger.info(`✅ Backend: Health check successful in ${healthTime}ms`);
    
    const healthData = { 
      status: 'OK', 
      message: 'Backend server and database are healthy',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected',
      databaseProvider: activeDatabaseProvider || 'unknown',
      responseTime: `${healthTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      server: 'backend'
    };
    
    logger.debug('📊 Backend: Health check response:', healthData);
    res.json(healthData);
    
  } catch (error) {
    logger.error('❌ Backend: Health check failed:');
    logger.error('   IP Address:', req.ip);
    logger.error('   User Agent:', req.get('User-Agent'));
    logger.error('   Error Type:', error.name);
    logger.error('   Error Message:', error.message);
    logger.error('   Full Error:', error);
    
    const errorData = { 
      status: 'ERROR', 
      message: 'Backend database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      server: 'backend'
    };
    
    logger.debug('📊 Backend: Health check error response:', errorData);
    res.status(503).json(errorData);
  }
});

// Root endpoint - API info
app.get('/', (req, res) => {
  res.status(200).json({
    name: 'Balan Coffee & Roastery API',
    version: '1.0.0',
    status: 'running',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: '/health',
      products: '/api/products',
      featured: '/api/products/featured',
      categories: '/api/categories',
      blogs: '/api/blogs',
      orders: '/api/orders',
      auth: '/api/auth',
      payments: '/api/payments'
    },
    docs: 'API server for Balan Coffee e-commerce platform',
    frontend: process.env.CORS_ORIGIN || 'http://localhost:5173'
  });
});

// Passport configuration
require('./config/passport');

// Database middleware - makes db available to routes with detailed logging
app.use(async (req, res, next) => {
  const middlewareStart = Date.now();
  
  try {
    logger.debug(`🔌 Backend: Database middleware for ${req.method} ${req.originalUrl}`);
    const databaseConnection = await connectToDatabase();
    req.databaseProvider = activeDatabaseProvider || 'postgres';
    req.db = null;
    req.pg = databaseConnection;
    
    const middlewareTime = Date.now() - middlewareStart;
    logger.debug(`✅ Backend: Database available for route in ${middlewareTime}ms`);
    
    next();
  } catch (error) {
    const middlewareTime = Date.now() - middlewareStart;
    
    logger.error('❌ Backend: Database middleware failed:');
    logger.error('   Route:', `${req.method} ${req.originalUrl}`);
    logger.error('   IP:', req.ip);
    logger.error('   Time taken:', `${middlewareTime}ms`);
    logger.error('   Error Type:', error.name);
    logger.error('   Error Message:', error.message);
    logger.error('   Full Error:', error);
    
    res.status(503).json({ 
      success: false, 
      message: 'Backend database connection failed',
      error: error.message,
      route: req.originalUrl,
      timestamp: new Date().toISOString(),
      server: 'backend'
    });
  }
});

// Routes with request logging
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart'));

// Add request logging for products
app.use('/api/products', (req, res, next) => {
  logger.debug(`📝 Backend Products API: ${req.method} ${req.originalUrl}`);
  logger.debug('Query params:', req.query);
  next();
});

// Routes with enhanced logging
logger.info('🛒 Backend: Products router loading');
app.use('/api/products', require('./routes/products'));

logger.info('📂 Backend: Categories router loading');
app.use('/api/categories', require('./routes/categories'));

logger.info('🛍️ Backend: Orders router loading');
app.use('/api/orders', require('./routes/orders'));

logger.info('📝 Backend: Blogs router loading');
app.use('/api/blogs', require('./routes/blogs'));

logger.info('📞 Backend: Contacts router loading');
app.use('/api/contacts', require('./routes/contacts'));

try {
  logger.info('💳 Backend: Payments router loading...');
  app.use('/api/payments', require('./routes/payments'));
  logger.info('✅ Backend: Payments router loaded successfully');
} catch (error) {
  logger.error('❌ Backend: Payments router failed to load:', error.message);
}

// Upload routes for file management
app.use('/api/upload', require('./routes/upload'));

// Enhanced Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  logger.error('🚨 BACKEND SERVER ERROR OCCURRED:');
  logger.error('   Error ID:', errorId);
  logger.error('   Timestamp:', new Date().toISOString());
  logger.error('   Error Type:', err.name || 'Unknown');
  logger.error('   Error Message:', err.message);
  logger.error('   HTTP Status:', err.status || 500);
  logger.error('   Request Details:');
  logger.error('     - Method:', req.method);
  logger.error('     - URL:', req.originalUrl);
  logger.error('     - IP:', req.ip);
  logger.error('     - User-Agent:', req.get('User-Agent'));
  logger.error('   Stack Trace:', err.stack);
  
  if (err.code) {
    logger.error('   Error Code:', err.code);
  }
  
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    errorId: errorId,
    timestamp: new Date().toISOString(),
    server: 'backend'
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.originalUrl,
      method: req.method,
      status: err.status || 500
    };
  }
  
  logger.debug('📤 Backend: Error response sent:', errorResponse);
  res.status(err.status || 500).json(errorResponse);
});

// Enhanced 404 handler with detailed logging
app.use((req, res) => {
  logger.info('🔍 Backend: 404 NOT FOUND:');
  logger.info('   URL:', req.originalUrl);
  logger.info('   Method:', req.method);
  logger.info('   IP:', req.ip);
  logger.info('   User-Agent:', req.get('User-Agent'));
  logger.info('   Timestamp:', new Date().toISOString());
  
  const notFoundResponse = {
    success: false,
    error: 'Route not found',
    url: req.originalUrl,
    method: req.method,
    timestamp: new Date().toISOString(),
    server: 'backend',
    availableRoutes: [
      '/health',
      '/api/products',
      '/api/auth',
      '/api/cart',
      '/api/orders',
      '/api/blogs',
      '/api/contacts',
      '/api/payments'
    ]
  };
  
  logger.debug('📤 Backend: 404 response sent:', notFoundResponse);
  res.status(404).json(notFoundResponse);
});

// Enhanced Graceful shutdown handlers with detailed logging
process.on('SIGTERM', async () => {
  logger.info('🛑 Backend: SIGTERM received - initiating graceful shutdown');
  logger.info('   Timestamp:', new Date().toISOString());
  logger.info('   Process ID:', process.pid);
  logger.info('   Environment:', process.env.NODE_ENV);
  
  try {
    logger.info('🔌 Backend: Closing PostgreSQL connection...');
    const closeStart = Date.now();
    await closePostgresPool();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ Backend: PostgreSQL connection closed successfully in ${closeTime}ms`);
    console.log('👋 Backend: Server shutdown complete');
  } catch (error) {
    console.error('❌ Backend: Error during PostgreSQL connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Backend: Process exiting with code 0');
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('🛑 Backend: SIGINT received - initiating graceful shutdown');
  logger.info('   Timestamp:', new Date().toISOString());
  logger.info('   Process ID:', process.pid);
  logger.info('   Environment:', process.env.NODE_ENV);
  
  try {
    logger.info('🔌 Backend: Closing PostgreSQL connection...');
    const closeStart = Date.now();
    await closePostgresPool();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ Backend: PostgreSQL connection closed successfully in ${closeTime}ms`);
    console.log('👋 Backend: Server shutdown complete');
  } catch (error) {
    console.error('❌ Backend: Error during PostgreSQL connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Backend: Process exiting with code 0');
  process.exit(0);
});

// Enhanced server initialization with detailed logging
logger.info('🚀 BALAN COFFEE BACKEND SERVER STARTING...');
logger.info('📊 Backend Server Information:');
logger.info('   Timestamp:', new Date().toISOString());
logger.info('   Node.js Version:', process.version);
logger.info('   Platform:', process.platform);
logger.info('   Architecture:', process.arch);
logger.info('   Process ID:', process.pid);
logger.info('   Environment:', process.env.NODE_ENV || 'development');
logger.info('   Vercel Environment:', process.env.VERCEL ? 'Yes' : 'No');

if (process.env.VERCEL) {
  logger.info('🏭 Backend: PRODUCTION MODE - Vercel Serverless Functions');
  logger.info('⚡ Backend: Pre-connecting to database for optimal performance...');
  
  const initStart = Date.now();
  connectToDatabase().then(() => {
    const initTime = Date.now() - initStart;
    logger.info(`✅ Backend: Database pre-connected successfully in ${initTime}ms`);
    logger.info('🎯 Backend: Server ready for Vercel deployment');
    logger.info('📍 Backend: Health endpoint will be available at: /health');
    logger.info('🔗 Backend: API endpoints will be available at: /api/*');
  }).catch(error => {
    logger.error('❌ Backend: Database pre-connection failed:');
    logger.error('   Error Type:', error.name);
    logger.error('   Error Message:', error.message);
    logger.error('   This may cause API requests to fail!');
    logger.error('   Full Error:', error);
  });
} else {
  logger.info('🧪 Backend: DEVELOPMENT MODE - Local Server');
  
  const startServer = async () => {
    try {
      logger.info('🔌 Backend: Initializing database connection for local development...');
      const dbStart = Date.now();
      await connectToDatabase();
      const dbTime = Date.now() - dbStart;
      logger.info(`✅ Backend: Database connected in ${dbTime}ms`);
      
      logger.info('🌐 Backend: Starting HTTP server...');
      const serverStart = Date.now();
      app.listen(PORT, () => {
        const serverTime = Date.now() - serverStart;
        logger.info(`✅ Backend: HTTP server started in ${serverTime}ms`);
        logger.info('🎉 BACKEND SERVER READY!');
        logger.info('   📍 Health check: http://localhost:' + PORT + '/health');
        logger.info('   🔗 API Base URL: http://localhost:' + PORT + '/api');
        logger.info('   📊 Server Info: http://localhost:' + PORT + '/');
        logger.info('   🏠 Port:', PORT);
        logger.info('   🌍 Environment:', process.env.NODE_ENV || 'development');
      });
    } catch (error) {
      logger.error('❌ Backend: FAILED TO START SERVER:');
      logger.error('   Error Type:', error.name);
      logger.error('   Error Message:', error.message);
      logger.error('   Full Error:', error);
      logger.error('🔚 Backend: Exiting process...');
      process.exit(1);
    }
  };

  startServer();
}

// Export the Express app for Vercel
module.exports = app;
