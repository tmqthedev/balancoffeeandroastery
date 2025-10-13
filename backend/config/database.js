// MongoDB Database Configuration for Balan Coffee & Roastery
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if already connected
    if (mongoose.connection.readyState === 1) {
      console.log('✅ MongoDB already connected');
      return mongoose.connection;
    }

    // Connection options optimized for Vercel
    const options = {
      bufferCommands: false, // Disable mongoose buffering
      bufferMaxEntries: 0, // Disable mongoose buffering
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
    };

    // Add authentication options if needed
    if (process.env.MONGODB_URI.includes('@')) {
      options.authSource = 'admin';
    }

    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee',
      options
    );
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔄 MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });

    return conn.connection;
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    
    // In production, throw the error to be handled by caller
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
    
    // In development, don't exit the process
    return false;
  }
};

// MongoDB Collections Schema Names
const COLLECTIONS = {
  // Sản phẩm và danh mục
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  
  // Người dùng và xác thực
  USERS: 'users',
  
  // Đơn hàng và thanh toán
  ORDERS: 'orders',
  
  // Giỏ hàng
  CARTS: 'carts',
  
  // Blog và nội dung
  BLOGS: 'blogs',
  
  // Liên hệ
  CONTACTS: 'contacts',
  
  // Cấu hình hệ thống
  SETTINGS: 'settings',
  SHIPPING_ZONES: 'shippingzones'
};

// Database Service Class
class DatabaseService {
  constructor() {
    this.collections = COLLECTIONS;
  }

  // Test connection
  async connect() {
    return await connectDB();
  }

  async close() {
    await mongoose.connection.close();
    console.log('🔄 MongoDB connection closed gracefully');
  }

  // Get Mongoose instance
  getMongoose() {
    return mongoose;
  }

  // Connection state
  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

// Database service instance
const databaseService = new DatabaseService();

// Legacy compatibility methods for order management
const createOrder = async (orderData) => {
  const Order = require('../models/Order');
  const orderNumber = `BC${Date.now()}`;
  const order = new Order({
    ...orderData,
    orderNumber,
    status: 'pending',
    paymentStatus: 'pending'
  });
  
  return await order.save();
};

const getOrder = async (orderNumber) => {
  const Order = require('../models/Order');
  return await Order.findOne({ orderNumber });
};

const updateOrderPaymentInfo = async (orderNumber, paymentInfo) => {
  const Order = require('../models/Order');
  const order = await Order.findOneAndUpdate(
    { orderNumber },
    { $set: paymentInfo },
    { new: true }
  );
  return { success: !!order };
};

const updateOrderPaymentStatus = async (orderNumber, status, additionalInfo = {}) => {
  const Order = require('../models/Order');
  const order = await Order.findOneAndUpdate(
    { orderNumber },
    { 
      $set: {
        paymentStatus: status,
        ...additionalInfo
      }
    },
    { new: true }
  );
  return { success: !!order };
};

const testConnection = async () => {
  try {
    return databaseService.isConnected();
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return false;
  }
};

module.exports = {
  // Database service instance
  databaseService,
  
  // Main connection function
  connectDB,
  
  // Legacy compatibility
  connect: connectDB,
  testConnection,
  createOrder,
  getOrder,
  updateOrderPaymentInfo,
  updateOrderPaymentStatus,
  
  // Collections
  COLLECTIONS,
  
  // Direct access
  mongoose
};
