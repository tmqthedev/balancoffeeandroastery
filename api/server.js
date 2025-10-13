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
const uri = process.env.MONGODB_URI || "mongodb+srv://balancoffeeandroastery:balancoffeeandroastery.@balancoffee.ah4nfkp.mongodb.net/?retryWrites=true&w=majority&appName=balancoffee";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

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

// MongoDB Connection Function
async function connectToDatabase() {
  if (isConnected && db) {
    console.log('✅ Using existing MongoDB connection');
    return db;
  }

  try {
    console.log('🔄 Connecting to MongoDB...');
    await client.connect();
    
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Pinged MongoDB deployment. Successfully connected!");
    
    db = client.db("balancoffee"); // Use your database name
    isConnected = true;
    
    return db;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    isConnected = false;
    throw error;
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const database = await connectToDatabase();
    res.json({ 
      status: 'OK', 
      message: 'Server and database are healthy',
      timestamp: new Date().toISOString(),
      database: isConnected ? 'Connected' : 'Disconnected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(503).json({ 
      status: 'ERROR', 
      message: 'Database connection failed',
      error: error.message,
      timestamp: new Date().toISOString()
    });
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

// Health check endpoint with database status
app.get('/health', createHealthCheck());

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

// Database middleware - makes db available to routes
app.use(async (req, res, next) => {
  try {
    req.db = await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database middleware error:', error);
    res.status(503).json({ 
      success: false, 
      message: 'Database connection failed',
      error: error.message 
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

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Server Error:', err.message);
  console.error('Stack:', err.stack);
  console.error('Request URL:', req.originalUrl);
  console.error('Request Method:', req.method);
  
  if (process.env.NODE_ENV === 'development') {
    res.status(err.status || 500).json({
      error: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method
    });
  } else {
    res.status(err.status || 500).json({
      error: 'Something went wrong!'
    });
  }
});

// 404 handler
app.use((req, res) => {
  console.log('❌ 404 Not Found:', req.originalUrl);
  res.status(404).json({
    error: 'Route not found',
    url: req.originalUrl
  });
});

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully');
  try {
    await client.close();
    isConnected = false;
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully');
  try {
    await client.close();
    isConnected = false;
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
  process.exit(0);
});

// Initialize database connection for production/Vercel
if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
  // Pre-connect to database for Vercel serverless
  connectToDatabase().then(() => {
    console.log('✅ Database pre-connected for Vercel deployment');
  }).catch(error => {
    console.error('❌ Database pre-connection failed:', error);
  });
} else {
  // Start server for local development
  const startServer = async () => {
    try {
      await connectToDatabase();
      
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
        console.log(`📍 Health check: http://localhost:${PORT}/health`);
        console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
      });
    } catch (error) {
      console.error('❌ Failed to start server:', error);
      process.exit(1);
    }
  };

  startServer();
}

// Export the Express app for Vercel
module.exports = app;
