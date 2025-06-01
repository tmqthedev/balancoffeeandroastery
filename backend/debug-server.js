const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

console.log('Setting up middleware...');

// Basic CORS configuration
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

console.log('✅ Middleware setup complete');

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    message: 'Backend server is running'
  });
});

console.log('Loading auth routes...');
try {
  const authRoutes = require('./routes/auth');
  console.log('✅ Auth routes module loaded');
  
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes registered');
} catch (err) {
  console.error('❌ Error with auth routes:', err.message);
  console.error('Stack trace:', err.stack);
  process.exit(1);
}

console.log('Starting server...');
try {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Backend server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
    
    // Close server after successful start
    setTimeout(() => {
      console.log('Test successful - closing server');
      server.close();
    }, 1000);
  });
} catch (err) {
  console.error('❌ Error starting server:', err.message);
  console.error('Stack trace:', err.stack);
}
