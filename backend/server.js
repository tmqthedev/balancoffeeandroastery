const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
const { getRuntimeConfig } = require('./config/runtimeConfig');
const { getPostgresPool, testPostgresConnection, closePostgresPool } = require('./config/postgres');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;


console.log('🔗 Database Configuration (Backend):');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Using Secrets Manager:', !!process.env.DATABASE_SECRET_ID);
console.log('   Database provider:', process.env.DATABASE_PROVIDER || 'mongodb');

// MongoDB Client with optimized configuration for production
const clientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Connection timeouts - increased for better reliability
  connectTimeoutMS: 30000,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
  
  // Connection pool settings optimized for Vercel serverless
  maxPoolSize: process.env.NODE_ENV === 'production' ? 5 : 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true,
  
  // Heartbeat settings
  heartbeatFrequencyMS: 10000,
  
  // Compression for better performance
  compressors: ['zlib'],
  
  // SSL/TLS settings - relaxed for development, strict for production
  ...(process.env.NODE_ENV === 'development' ? {
    tls: true,
    tlsAllowInvalidCertificates: true,
    tlsAllowInvalidHostnames: true
  } : {
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false
  })
};

let client = null;

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
  console.log('⚠️ Rate limiter disabled in development mode');
} else {
  app.use('/api/', limiter);
}

// Body parsing middleware
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection Function with Enhanced Logging
async function connectToDatabase() {
  if (isConnected && db) {
    console.log(`✅ Using existing ${activeDatabaseProvider || 'database'} connection (Backend)`);
    return db;
  }

  try {
    const runtimeConfig = await getRuntimeConfig();

    if (runtimeConfig.databaseProvider === 'postgres') {
      console.log('Backend: Attempting to connect to PostgreSQL...');

      const connectStart = Date.now();
      const postgresPool = await getPostgresPool();
      const connectionInfo = await testPostgresConnection();
      const connectTime = Date.now() - connectStart;

      db = postgresPool;
      isConnected = true;
      activeDatabaseProvider = 'postgres';

      console.log(`Backend: PostgreSQL connected in ${connectTime}ms`);
      console.log('Backend: Connected to PostgreSQL database:', connectionInfo.database);

      return db;
    }

    if (!client) {
      client = new MongoClient(runtimeConfig.mongoUri, clientOptions);
    }

    console.log('🔄 Backend: Attempting to connect to MongoDB...');
    
    const connectStart = Date.now();
    await client.connect();
    const connectTime = Date.now() - connectStart;
    console.log(`⚡ Backend: MongoDB client connected in ${connectTime}ms`);
    
    // Send a ping to confirm a successful connection
    console.log('🏓 Backend: Sending ping to MongoDB admin database...');
    const pingStart = Date.now();
    await client.db("admin").command({ ping: 1 });
    const pingTime = Date.now() - pingStart;
    console.log(`✅ Backend: MongoDB ping successful in ${pingTime}ms`);
    
    db = client.db("balancoffee");
    isConnected = true;
    activeDatabaseProvider = 'mongodb';
    
    console.log('🎯 Backend: Connected to database: balancoffee');
    console.log('📊 Backend Connection status:', { 
      isConnected: true, 
      timestamp: new Date().toISOString(),
      serverApi: 'v1'
    });
    
    return db;
  } catch (error) {
    console.error('❌ Backend: Database connection failed:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    
    if (error.code === 8000) {
      console.error('🔐 Backend: Authentication failed - check username/password');
    } else if (error.code === 6) {
      console.error('🌐 Backend: Network error - check connection and firewall');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 Backend: DNS resolution failed - check connection string');
    }
    
    isConnected = false;
    throw error;
  }
}

// Logging middleware
app.use(morgan('combined'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  next();
});

// Static files - serve from backend uploads directory
// Maps /uploads/products/file.jpg to backend/uploads/products/file.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Maps /backend/uploads/products/file.jpg to backend/uploads/products/file.jpg  
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint with detailed logging
app.get('/health', async (req, res) => {
  console.log('🏥 Backend: Health check requested from:', req.ip);
  
  try {
    const healthStart = Date.now();
    const database = await connectToDatabase();
    const healthTime = Date.now() - healthStart;
    
    console.log(`✅ Backend: Health check successful in ${healthTime}ms`);
    
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
    
    console.log('📊 Backend: Health check response:', healthData);
    res.json(healthData);
    
  } catch (error) {
    console.error('❌ Backend: Health check failed:');
    console.error('   IP Address:', req.ip);
    console.error('   User Agent:', req.get('User-Agent'));
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
    
    const errorData = { 
      status: 'ERROR', 
      message: 'Backend database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      server: 'backend'
    };
    
    console.log('📊 Backend: Health check error response:', errorData);
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
    console.log(`🔌 Backend: Database middleware for ${req.method} ${req.originalUrl}`);
    const databaseConnection = await connectToDatabase();
    req.databaseProvider = activeDatabaseProvider || 'mongodb';
    req.db = databaseConnection;
    req.pg = req.databaseProvider === 'postgres' ? databaseConnection : null;
    
    // Make database globally available for passport
    if (req.databaseProvider === 'mongodb') {
      global.db = req.db;
    }
    
    const middlewareTime = Date.now() - middlewareStart;
    console.log(`✅ Backend: Database available for route in ${middlewareTime}ms`);
    
    next();
  } catch (error) {
    const middlewareTime = Date.now() - middlewareStart;
    
    console.error('❌ Backend: Database middleware failed:');
    console.error('   Route:', `${req.method} ${req.originalUrl}`);
    console.error('   IP:', req.ip);
    console.error('   Time taken:', `${middlewareTime}ms`);
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
    
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
  console.log(`📝 Backend Products API: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

// Routes with enhanced logging
console.log('🛒 Backend: Products router loading');
app.use('/api/products', require('./routes/products'));

console.log('📂 Backend: Categories router loading');
app.use('/api/categories', require('./routes/categories'));

console.log('🛍️ Backend: Orders router loading');
app.use('/api/orders', require('./routes/orders'));

console.log('📝 Backend: Blogs router loading');
app.use('/api/blogs', require('./routes/blogs'));

console.log('📞 Backend: Contacts router loading');
app.use('/api/contacts', require('./routes/contacts'));

try {
  console.log('💳 Backend: Payments router loading...');
  app.use('/api/payments', require('./routes/payments'));
  console.log('✅ Backend: Payments router loaded successfully');
} catch (error) {
  console.error('❌ Backend: Payments router failed to load:', error.message);
}

// Upload routes for file management
app.use('/api/upload', require('./routes/upload'));

// Enhanced Error handling middleware with detailed logging
app.use((err, req, res, next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  console.error('🚨 BACKEND SERVER ERROR OCCURRED:');
  console.error('   Error ID:', errorId);
  console.error('   Timestamp:', new Date().toISOString());
  console.error('   Error Type:', err.name || 'Unknown');
  console.error('   Error Message:', err.message);
  console.error('   HTTP Status:', err.status || 500);
  console.error('   Request Details:');
  console.error('     - Method:', req.method);
  console.error('     - URL:', req.originalUrl);
  console.error('     - IP:', req.ip);
  console.error('     - User-Agent:', req.get('User-Agent'));
  console.error('   Stack Trace:', err.stack);
  
  if (err.code) {
    console.error('   Error Code:', err.code);
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
  
  console.error('📤 Backend: Error response sent:', errorResponse);
  res.status(err.status || 500).json(errorResponse);
});

// Enhanced 404 handler with detailed logging
app.use((req, res) => {
  console.log('🔍 Backend: 404 NOT FOUND:');
  console.log('   URL:', req.originalUrl);
  console.log('   Method:', req.method);
  console.log('   IP:', req.ip);
  console.log('   User-Agent:', req.get('User-Agent'));
  console.log('   Timestamp:', new Date().toISOString());
  
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
  
  console.log('📤 Backend: 404 response sent:', notFoundResponse);
  res.status(404).json(notFoundResponse);
});

// Enhanced Graceful shutdown handlers with detailed logging
process.on('SIGTERM', async () => {
  console.log('🛑 Backend: SIGTERM received - initiating graceful shutdown');
  console.log('   Timestamp:', new Date().toISOString());
  console.log('   Process ID:', process.pid);
  console.log('   Environment:', process.env.NODE_ENV);
  
  try {
    console.log('🔌 Backend: Closing MongoDB connection...');
    const closeStart = Date.now();
    if (client) {
      await client.close();
    }
    await closePostgresPool();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ Backend: MongoDB connection closed successfully in ${closeTime}ms`);
    console.log('👋 Backend: Server shutdown complete');
  } catch (error) {
    console.error('❌ Backend: Error during MongoDB connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Backend: Process exiting with code 0');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 Backend: SIGINT received - initiating graceful shutdown');
  console.log('   Timestamp:', new Date().toISOString());
  console.log('   Process ID:', process.pid);
  console.log('   Environment:', process.env.NODE_ENV);
  
  try {
    console.log('🔌 Backend: Closing MongoDB connection...');
    const closeStart = Date.now();
    if (client) {
      await client.close();
    }
    await closePostgresPool();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ Backend: MongoDB connection closed successfully in ${closeTime}ms`);
    console.log('👋 Backend: Server shutdown complete');
  } catch (error) {
    console.error('❌ Backend: Error during MongoDB connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Backend: Process exiting with code 0');
  process.exit(0);
});

// Enhanced server initialization with detailed logging
console.log('🚀 BALAN COFFEE BACKEND SERVER STARTING...');
console.log('📊 Backend Server Information:');
console.log('   Timestamp:', new Date().toISOString());
console.log('   Node.js Version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Architecture:', process.arch);
console.log('   Process ID:', process.pid);
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Vercel Environment:', process.env.VERCEL ? 'Yes' : 'No');

if (process.env.VERCEL) {
  console.log('🏭 Backend: PRODUCTION MODE - Vercel Serverless Functions');
  console.log('⚡ Backend: Pre-connecting to database for optimal performance...');
  
  const initStart = Date.now();
  connectToDatabase().then(() => {
    const initTime = Date.now() - initStart;
    console.log(`✅ Backend: Database pre-connected successfully in ${initTime}ms`);
    console.log('🎯 Backend: Server ready for Vercel deployment');
    console.log('📍 Backend: Health endpoint will be available at: /health');
    console.log('🔗 Backend: API endpoints will be available at: /api/*');
  }).catch(error => {
    console.error('❌ Backend: Database pre-connection failed:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   This may cause API requests to fail!');
    console.error('   Full Error:', error);
  });
} else {
  console.log('🧪 Backend: DEVELOPMENT MODE - Local Server');
  
  const startServer = async () => {
    try {
      console.log('🔌 Backend: Initializing database connection for local development...');
      const dbStart = Date.now();
      await connectToDatabase();
      const dbTime = Date.now() - dbStart;
      console.log(`✅ Backend: Database connected in ${dbTime}ms`);
      
      console.log('🌐 Backend: Starting HTTP server...');
      const serverStart = Date.now();
      app.listen(PORT, () => {
        const serverTime = Date.now() - serverStart;
        console.log(`✅ Backend: HTTP server started in ${serverTime}ms`);
        console.log('🎉 BACKEND SERVER READY!');
        console.log('   📍 Health check: http://localhost:' + PORT + '/health');
        console.log('   🔗 API Base URL: http://localhost:' + PORT + '/api');
        console.log('   📊 Server Info: http://localhost:' + PORT + '/');
        console.log('   🏠 Port:', PORT);
        console.log('   🌍 Environment:', process.env.NODE_ENV || 'development');
      });
    } catch (error) {
      console.error('❌ Backend: FAILED TO START SERVER:');
      console.error('   Error Type:', error.name);
      console.error('   Error Message:', error.message);
      console.error('   Full Error:', error);
      console.error('🔚 Backend: Exiting process...');
      process.exit(1);
    }
  };

  startServer();
}

// Export the Express app for Vercel
module.exports = app;
