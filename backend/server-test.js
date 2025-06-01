const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Basic CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: 'Backend server is running'
  });
});

// Basic test routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working!' });
});

// Routes - add them one by one for testing
try {
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Auth routes loaded');
} catch (err) {
  console.error('❌ Error loading auth routes:', err.message);
}

try {
  app.use('/api/products', require('./routes/products'));
  console.log('✅ Products routes loaded');
} catch (err) {
  console.error('❌ Error loading products routes:', err.message);
  console.error('Stack trace:', err.stack);
}

try {
  app.use('/api/categories', require('./routes/categories'));
  console.log('✅ Categories routes loaded');
} catch (err) {
  console.error('❌ Error loading categories routes:', err.message);
  console.error('Stack trace:', err.stack);
}

// Admin routes
try {
  app.use('/api/admin', require('./routes/admin'));
  console.log('✅ Admin routes loaded');
} catch (err) {
  console.error('❌ Error loading admin routes:', err.message);
  console.error('Stack trace:', err.stack);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
