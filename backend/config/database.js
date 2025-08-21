// MongoDB Database Configuration for Balan Coffee & Roastery
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/balancoffee', {
      // These options are no longer needed in Mongoose 6+
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('🔄 MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔄 MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
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
