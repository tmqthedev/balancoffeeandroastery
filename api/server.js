const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB Connection with Native Driver for Production
const uri = process.env.MONGODB_URI || "mongodb+srv://balancoffeeandroastery:balancoffeeandroastery@balancoffee.ah4nfkp.mongodb.net/?retryWrites=true&w=majority&appName=balancoffee";

console.log('🔗 MongoDB Configuration:');
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Using ENV URI:', !!process.env.MONGODB_URI);
console.log('   URI Domain:', uri.split('@')[1]?.split('/')[0] || 'not found');

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

const client = new MongoClient(uri, clientOptions);

// Global database connection flag
let isConnected = false;
let db = null;

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

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CORS_ORIGIN
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token', 'cache-control', 'pragma', 'expires']
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
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection Function with Enhanced Logging
async function connectToDatabase() {
  if (isConnected && db) {
    console.log('✅ Using existing MongoDB connection');
    return db;
  }

  try {
    console.log('🔄 Attempting to connect to MongoDB...');
    console.log('📍 Connection URI prefix:', uri.substring(0, 50) + '...');
    
    const connectStart = Date.now();
    await client.connect();
    const connectTime = Date.now() - connectStart;
    console.log(`⚡ MongoDB client connected in ${connectTime}ms`);
    
    // Send a ping to confirm a successful connection
    console.log('🏓 Sending ping to MongoDB admin database...');
    const pingStart = Date.now();
    await client.db("admin").command({ ping: 1 });
    const pingTime = Date.now() - pingStart;
    console.log(`✅ MongoDB ping successful in ${pingTime}ms`);
    
    db = client.db("balancoffee");
    isConnected = true;
    
    console.log('🎯 Connected to database: balancoffee');
    console.log('📊 Connection status:', { 
      isConnected: true, 
      timestamp: new Date().toISOString(),
      serverApi: 'v1'
    });
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection failed:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Error Code:', error.code);
    console.error('   Full Error:', error);
    
    if (error.code === 8000) {
      console.error('🔐 Authentication failed - check username/password');
    } else if (error.code === 6) {
      console.error('🌐 Network error - check connection and firewall');
    } else if (error.message.includes('ENOTFOUND')) {
      console.error('🔍 DNS resolution failed - check connection string');
    }
    
    isConnected = false;
    throw error;
  }
}

// Health check endpoint with detailed logging
app.get('/health', async (req, res) => {
  console.log('🏥 Health check requested from:', req.ip);
  
  try {
    const healthStart = Date.now();
    await connectToDatabase();
    const healthTime = Date.now() - healthStart;
    
    console.log(`✅ Health check successful in ${healthTime}ms`);
    
    const healthData = { 
      status: 'OK', 
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected',
      responseTime: `${healthTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0'
    };
    
    console.log('📊 Health check response:', healthData);
    res.json(healthData);
    
  } catch (error) {
    console.error('❌ Health check failed:');
    console.error('   IP Address:', req.ip);
    console.error('   User Agent:', req.get('User-Agent'));
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
    
    const errorData = { 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
    
    console.log('📊 Health check error response:', errorData);
    res.status(503).json(errorData);
  }
});

// Logging middleware
app.use(morgan('combined'));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Static files - serve from backend uploads directory
// Maps /uploads/products/file.jpg to backend/uploads/products/file.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Maps /backend/uploads/products/file.jpg to backend/uploads/products/file.jpg  
app.use('/backend/uploads', express.static(path.join(__dirname, 'uploads')));

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

// MongoDB native driver connection will be handled in connectToDatabase() function

// Passport configuration
require('../backend/config/passport');

// Database middleware - makes db available to routes with detailed logging
app.use(async (req, res, next) => {
  const middlewareStart = Date.now();
  
  try {
    console.log(`🔌 Database middleware for ${req.method} ${req.originalUrl}`);
    req.db = await connectToDatabase();
    
    const middlewareTime = Date.now() - middlewareStart;
    console.log(`✅ Database available for route in ${middlewareTime}ms`);
    
    next();
  } catch (error) {
    const middlewareTime = Date.now() - middlewareStart;
    
    console.error('❌ Database middleware failed:');
    console.error('   Route:', `${req.method} ${req.originalUrl}`);
    console.error('   IP:', req.ip);
    console.error('   Time taken:', `${middlewareTime}ms`);
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
    
    res.status(503).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message,
      route: req.originalUrl,
      timestamp: new Date().toISOString()
    });
  }
});

// Routes with request logging
app.use('/api/auth', require('../backend/routes/auth'));
app.use('/api/users', require('../backend/routes/users'));
app.use('/api/cart', require('../backend/routes/cart'));

// Add request logging for products
app.use('/api/products', (req, res, next) => {
  console.log(`📝 Products API: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

app.use('/api/products', require('../backend/routes/products'));
app.use('/api/categories', require('../backend/routes/categories'));
app.use('/api/orders', require('../backend/routes/orders'));
app.use('/api/blogs', require('../backend/routes/blogs'));
app.use('/api/contacts', require('../backend/routes/contacts'));
app.use('/api/payments', require('../backend/routes/payments'));

// Upload routes for file management
app.use('/api/upload', require('../backend/routes/upload'));

// Database error handling will be done within route handlers

// Enhanced Error handling middleware with detailed logging
app.use((err, req, res, _next) => {
  const errorId = Date.now().toString(36) + Math.random().toString(36).substr(2);
  
  console.error('🚨 SERVER ERROR OCCURRED:');
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
  console.error('     - Headers:', JSON.stringify(req.headers, null, 2));
  console.error('   Stack Trace:', err.stack);
  
  if (err.code) {
    console.error('   Error Code:', err.code);
  }
  
  // Log request body for POST/PUT requests (be careful with sensitive data)
  if ((req.method === 'POST' || req.method === 'PUT') && req.body) {
    console.error('   Request Body:', JSON.stringify(req.body, null, 2));
  }
  
  const errorResponse = {
    success: false,
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error',
    errorId: errorId,
    timestamp: new Date().toISOString()
  };
  
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
    errorResponse.details = {
      url: req.originalUrl,
      method: req.method,
      status: err.status || 500
    };
  }
  
  console.error('📤 Error response sent:', errorResponse);
  res.status(err.status || 500).json(errorResponse);
});

// Enhanced 404 handler with detailed logging
app.use((req, res) => {
  console.log('🔍 404 NOT FOUND:');
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
  
  console.log('📤 404 response sent:', notFoundResponse);
  res.status(404).json(notFoundResponse);
});

// Enhanced Graceful shutdown handlers with detailed logging
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received - initiating graceful shutdown');
  console.log('   Timestamp:', new Date().toISOString());
  console.log('   Process ID:', process.pid);
  console.log('   Environment:', process.env.NODE_ENV);
  
  try {
    console.log('🔌 Closing MongoDB connection...');
    const closeStart = Date.now();
    await client.close();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ MongoDB connection closed successfully in ${closeTime}ms`);
    console.log('👋 Server shutdown complete');
  } catch (error) {
    console.error('❌ Error during MongoDB connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Process exiting with code 0');
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received - initiating graceful shutdown');
  console.log('   Timestamp:', new Date().toISOString());
  console.log('   Process ID:', process.pid);
  console.log('   Environment:', process.env.NODE_ENV);
  
  try {
    console.log('🔌 Closing MongoDB connection...');
    const closeStart = Date.now();
    await client.close();
    const closeTime = Date.now() - closeStart;
    
    isConnected = false;
    console.log(`✅ MongoDB connection closed successfully in ${closeTime}ms`);
    console.log('👋 Server shutdown complete');
  } catch (error) {
    console.error('❌ Error during MongoDB connection close:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   Full Error:', error);
  }
  
  console.log('🔚 Process exiting with code 0');
  process.exit(0);
});

// Enhanced server initialization with detailed logging
console.log('🚀 BALAN COFFEE API SERVER STARTING...');
console.log('📊 Server Information:');
console.log('   Timestamp:', new Date().toISOString());
console.log('   Node.js Version:', process.version);
console.log('   Platform:', process.platform);
console.log('   Architecture:', process.arch);
console.log('   Process ID:', process.pid);
console.log('   Environment:', process.env.NODE_ENV || 'development');
console.log('   Vercel Environment:', process.env.VERCEL ? 'Yes' : 'No');

if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  console.log('🏭 PRODUCTION MODE - Vercel Serverless Functions');
  console.log('⚡ Pre-connecting to database for optimal performance...');
  
  const initStart = Date.now();
  connectToDatabase().then(() => {
    const initTime = Date.now() - initStart;
    console.log(`✅ Database pre-connected successfully in ${initTime}ms`);
    console.log('🎯 Server ready for Vercel deployment');
    console.log('📍 Health endpoint will be available at: /health');
    console.log('🔗 API endpoints will be available at: /api/*');
  }).catch(error => {
    console.error('❌ Database pre-connection failed:');
    console.error('   Error Type:', error.name);
    console.error('   Error Message:', error.message);
    console.error('   This may cause API requests to fail!');
    console.error('   Full Error:', error);
  });
} else {
  console.log('🧪 DEVELOPMENT MODE - Local Server');
  
  const startServer = async () => {
    try {
      console.log('🔌 Initializing database connection for local development...');
      const dbStart = Date.now();
      await connectToDatabase();
      const dbTime = Date.now() - dbStart;
      console.log(`✅ Database connected in ${dbTime}ms`);
      
      console.log('🌐 Starting HTTP server...');
      const serverStart = Date.now();
      app.listen(PORT, () => {
        const serverTime = Date.now() - serverStart;
        console.log(`✅ HTTP server started in ${serverTime}ms`);
        console.log('🎉 SERVER READY!');
        console.log('   📍 Health check: http://localhost:' + PORT + '/health');
        console.log('   🔗 API Base URL: http://localhost:' + PORT + '/api');
        console.log('   📊 Server Info: http://localhost:' + PORT + '/');
        console.log('   🏠 Port:', PORT);
        console.log('   🌍 Environment:', process.env.NODE_ENV || 'development');
      });
    } catch (error) {
      console.error('❌ FAILED TO START SERVER:');
      console.error('   Error Type:', error.name);
      console.error('   Error Message:', error.message);
      console.error('   Full Error:', error);
      console.error('🔚 Exiting process...');
      process.exit(1);
    }
  };

  startServer();
}

// Export the Express app for Vercel
module.exports = app;
