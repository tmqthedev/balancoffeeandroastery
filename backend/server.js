const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Import MongoDB connection
const { connectDB } = require('./config/database');
const { 
  handleDatabaseError, 
  checkDatabaseConnection, 
  connectWithRetry,
  createHealthCheck 
} = require('./middleware/database');

// Global database connection flag
let isConnected = false;

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

// Initialize MongoDB connection
connectDB().then((res) => {
  if (res === false) {
    console.error('\u274c MongoDB connection failed: continuing without DB connection for dev');
  } else {
    console.log('\u2705 Connected to MongoDB database');
  }
}).catch(err => {
  console.error('\u274c MongoDB connection unexpected error:', err && err.message);
  // Continue startup for debugging; routes should handle missing DB gracefully.
});

// Passport configuration
require('./config/passport');

// Routes with request logging
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/cart', require('./routes/cart'));

// Add request logging for products
app.use('/api/products', (req, res, next) => {
  console.log(`📝 Products API: ${req.method} ${req.originalUrl}`);
  console.log('Query params:', req.query);
  next();
});

app.use('/api/products', require('./routes/products'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/payments', require('./routes/payments'));

// Upload routes for file management
app.use('/api/upload', require('./routes/upload'));

// Database error handling middleware
app.use(handleDatabaseError);

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

// Vercel serverless function handler
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Graceful shutdown for local development
  const { mongoose } = require('./config/database');

  process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    await mongoose.connection.close();
    isConnected = false;
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully');
    await mongoose.connection.close();
    isConnected = false;
    process.exit(0);
  });

  // Start server for local development or export for Vercel
  if (process.env.NODE_ENV !== 'production') {
    const startServer = async () => {
      try {
        await connectDB();
        isConnected = true;
        
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
  } else {
    // For Vercel serverless deployment
    connectDB().then(() => {
      isConnected = true;
      console.log('✅ Database connected for Vercel deployment');
    }).catch(error => {
      console.error('❌ Database connection failed:', error);
    });
  }
}

// Export the Express app for Vercel
module.exports = app;
