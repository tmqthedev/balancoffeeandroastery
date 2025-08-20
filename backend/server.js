const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./config/database');

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
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-access-token']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
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
      orders: '/api/orders',
      auth: '/api/auth',
      payments: '/api/payments'
    },
    docs: 'API server for Balan Coffee e-commerce platform',
    frontend: process.env.CORS_ORIGIN || 'http://localhost:5173'
  });
});

// Initialize database connection
db.connect().then(() => {
  console.log('✅ Connected to Firebase database');
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  console.log('🔄 Continuing with mock data for development...');
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
  console.log('Headers:', req.headers);
  console.log('User-Agent:', req.get('User-Agent'));
  next();
});

app.use('/api/products', require('./routes/products-firebase'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/contacts', require('./routes/contacts'));
app.use('/api/payments', require('./routes/payments'));

// MoMo payment routes
app.use('/api/payments/momo', require('./routes/momo-payment'));

// Load CRM routes
try {
  console.log('🔍 About to load CRM router...');
  app.use('/api/admin', require('./routes/admin'));
  app.use('/api/crm', require('./routes/crm'));
  console.log('✅ CRM router mounted successfully');
} catch (error) {
  console.error('❌ Error loading CRM router:', error.message);
}

// Import CRM service for direct integration
const CRMService = require('./services/crmService');
const { authenticateToken, requireAdmin } = require('./middleware/auth');

// Direct CRM routes for testing
app.get('/api/crm/test-direct', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('📡 Direct CRM route hit');
    res.json({
      success: true,
      message: 'CRM system is working!',
      user: req.user,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Direct CRM route error:', error);
    res.status(500).json({
      success: false,
      message: 'CRM system error',
      error: error.message
    });
  }
});

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

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  db.close();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  db.close();
  process.exit(0);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});
