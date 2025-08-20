// Cloud Firestore Database Configuration for Balan Coffee & Roastery
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

let app;
let db;
let bucket;

try {
  if (process.env.NODE_ENV === 'production') {
    // Production: sử dụng service account
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || "https://accounts.google.com/o/oauth2/auth",
      token_uri: process.env.FIREBASE_TOKEN_URI || "https://oauth2.googleapis.com/token",
    };

    app = initializeApp({
      credential: cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`
    });
    
    console.log('✅ Firebase Production mode initialized');
  } else {
    // Development: sử dụng application default credentials
    app = initializeApp({
      projectId: 'balancoffeeandroastery',
      storageBucket: 'balancoffeeandroastery.appspot.com'
    });
    
    console.log('🔄 Firebase Development mode initialized');
  }

  db = getFirestore(app);
  bucket = getStorage(app).bucket();
  
  // Test connection
  db.settings({
    ignoreUndefinedProperties: true
  });
  
  console.log('✅ Firebase Firestore & Storage initialized successfully');
  
} catch (error) {
  console.error('❌ Firebase initialization failed:', error.message);
  console.log('� Using Firestore mock for development');
  
  // Mock Firestore cho development
  db = {
    collection: (name) => ({
      doc: (id) => ({
        get: () => Promise.resolve({ 
          exists: false, 
          data: () => null,
          id 
        }),
        set: (data) => Promise.resolve({ id }),
        update: (data) => Promise.resolve(),
        delete: () => Promise.resolve()
      }),
      get: () => Promise.resolve({ 
        docs: [],
        empty: true,
        size: 0
      }),
      add: (data) => Promise.resolve({ 
        id: `mock-${Date.now()}`,
        data
      }),
      where: (field, op, value) => ({
        get: () => Promise.resolve({ 
          docs: [],
          empty: true,
          size: 0
        }),
        orderBy: (field, direction) => ({
          get: () => Promise.resolve({ 
            docs: [],
            empty: true,
            size: 0
          }),
          limit: (num) => ({
            get: () => Promise.resolve({ 
              docs: [],
              empty: true,
              size: 0
            })
          })
        }),
        limit: (num) => ({
          get: () => Promise.resolve({ 
            docs: [],
            empty: true,
            size: 0
          })
        })
      }),
      orderBy: (field, direction) => ({
        get: () => Promise.resolve({ 
          docs: [],
          empty: true,
          size: 0
        }),
        limit: (num) => ({
          get: () => Promise.resolve({ 
            docs: [],
            empty: true,
            size: 0
          })
        })
      }),
      limit: (num) => ({
        get: () => Promise.resolve({ 
          docs: [],
          empty: true,
          size: 0
        })
      })
    })
  };
  
  bucket = {
    file: (name) => ({
      save: () => Promise.resolve(),
      delete: () => Promise.resolve(),
      getSignedUrl: () => Promise.resolve(['mock-url'])
    })
  };
}

// Firestore Collections Schema
const COLLECTIONS = {
  // Sản phẩm và danh mục
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  PRODUCT_VARIANTS: 'product_variants',
  
  // Người dùng và xác thực
  USERS: 'users',
  USER_SESSIONS: 'user_sessions',
  USER_PREFERENCES: 'user_preferences',
  
  // Đơn hàng và thanh toán
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
  PAYMENTS: 'payments',
  PAYMENT_METHODS: 'payment_methods',
  INVOICES: 'invoices',
  
  // Giỏ hàng và wishlist
  CARTS: 'carts',
  CART_ITEMS: 'cart_items',
  WISHLISTS: 'wishlists',
  
  // Blog và nội dung
  BLOGS: 'blogs',
  BLOG_CATEGORIES: 'blog_categories',
  BLOG_TAGS: 'blog_tags',
  COMMENTS: 'comments',
  
  // Liên hệ và CRM
  CONTACTS: 'contacts',
  CUSTOMERS: 'customers',
  CUSTOMER_NOTES: 'customer_notes',
  SUPPORT_TICKETS: 'support_tickets',
  
  // Cửa hàng và kho
  STORES: 'stores',
  INVENTORY: 'inventory',
  STOCK_MOVEMENTS: 'stock_movements',
  
  // Marketing và khuyến mãi
  COUPONS: 'coupons',
  PROMOTIONS: 'promotions',
  EMAIL_CAMPAIGNS: 'email_campaigns',
  NEWSLETTERS: 'newsletters',
  
  // Analytics và báo cáo
  ANALYTICS: 'analytics',
  REPORTS: 'reports',
  USER_ACTIVITY: 'user_activity',
  SALES_DATA: 'sales_data',
  
  // Cấu hình hệ thống
  SETTINGS: 'settings',
  CONFIGURATIONS: 'configurations',
  LOGS: 'logs'
};

// Firestore Service Class
class FirestoreService {
  constructor() {
    this.db = db;
    this.bucket = bucket;
    this.collections = COLLECTIONS;
  }

  // Test connection
  async connect() {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('🔄 Development mode - using Firestore mock/real connection');
        return true;
      }
      
      // Test với một simple read
      await this.db.collection('_health').doc('test').get();
      console.log('✅ Firestore connection successful');
      return true;
    } catch (error) {
      console.error('❌ Firestore connection failed:', error.message);
      return false;
    }
  }

  async close() {
    console.log('🔄 Firestore connection closed gracefully');
  }

  // Generic CRUD operations
  async create(collection, data, customId = null) {
    try {
      const docData = {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (customId) {
        await this.db.collection(collection).doc(customId).set(docData);
        return { id: customId, ...docData };
      } else {
        const docRef = await this.db.collection(collection).add(docData);
        return { id: docRef.id, ...docData };
      }
    } catch (error) {
      console.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  async findById(collection, id) {
    try {
      const doc = await this.db.collection(collection).doc(id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error(`Error finding document in ${collection}:`, error);
      throw error;
    }
  }

  async findAll(collection, options = {}) {
    try {
      let query = this.db.collection(collection);
      
      // Apply filters
      if (options.where) {
        options.where.forEach(([field, operator, value]) => {
          query = query.where(field, operator, value);
        });
      }
      
      // Apply ordering
      if (options.orderBy) {
        const { field, direction = 'asc' } = options.orderBy;
        query = query.orderBy(field, direction);
      }
      
      // Apply limit
      if (options.limit) {
        query = query.limit(options.limit);
      }
      
      // Apply offset (startAfter for Firestore)
      if (options.startAfter) {
        query = query.startAfter(options.startAfter);
      }
      
      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`Error finding documents in ${collection}:`, error);
      throw error;
    }
  }

  async update(collection, id, data) {
    try {
      const updateData = {
        ...data,
        updatedAt: new Date()
      };
      
      await this.db.collection(collection).doc(id).update(updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection, id) {
    try {
      await this.db.collection(collection).doc(id).delete();
      return true;
    } catch (error) {
      console.error(`Error deleting document in ${collection}:`, error);
      throw error;
    }
  }

  // Specialized methods for products
  async getProducts(filters = {}) {
    const options = {
      where: [],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit: filters.limit || 12
    };

    // Status filter (default to active)
    options.where.push(['status', '==', filters.status || 'active']);

    // Category filter
    if (filters.category) {
      options.where.push(['category', '==', filters.category]);
    }

    // Type filter
    if (filters.type) {
      options.where.push(['type', '==', filters.type]);
    }

    // Featured filter
    if (filters.featured) {
      options.where.push(['featured', '==', true]);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price_asc':
          options.orderBy = { field: 'price', direction: 'asc' };
          break;
        case 'price_desc':
          options.orderBy = { field: 'price', direction: 'desc' };
          break;
        case 'name':
          options.orderBy = { field: 'nameVi', direction: 'asc' };
          break;
        case 'newest':
        default:
          options.orderBy = { field: 'createdAt', direction: 'desc' };
          break;
      }
    }

    return await this.findAll(this.collections.PRODUCTS, options);
  }

  async getFeaturedProducts(limit = 4) {
    return await this.findAll(this.collections.PRODUCTS, {
      where: [
        ['featured', '==', true],
        ['status', '==', 'active']
      ],
      orderBy: { field: 'createdAt', direction: 'desc' },
      limit
    });
  }

  // Specialized methods for orders
  async createOrder(orderData) {
    const orderNumber = `BC${Date.now()}`;
    const order = {
      ...orderData,
      orderNumber,
      status: 'pending',
      paymentStatus: 'pending'
    };
    
    return await this.create(this.collections.ORDERS, order);
  }

  async getUserOrders(userId) {
    return await this.findAll(this.collections.ORDERS, {
      where: [['customerId', '==', userId]],
      orderBy: { field: 'createdAt', direction: 'desc' }
    });
  }

  // Image storage methods
  async uploadImage(file, folder = 'general') {
    try {
      const fileName = `${folder}/${Date.now()}-${file.originalname}`;
      const fileUpload = this.bucket.file(fileName);
      
      await fileUpload.save(file.buffer, {
        metadata: {
          contentType: file.mimetype
        }
      });

      // Get public URL
      const [url] = await fileUpload.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      return {
        fileName,
        url,
        path: fileName
      };
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async deleteImage(filePath) {
    try {
      await this.bucket.file(filePath).delete();
      return true;
    } catch (error) {
      console.error('Error deleting image:', error);
      return false;
    }
  }

  // Specialized create methods for seeding
  async createProduct(productData) {
    return await this.create(COLLECTIONS.PRODUCTS, productData, productData.id);
  }

  async createCategory(categoryData) {
    return await this.create(COLLECTIONS.CATEGORIES, categoryData, categoryData.id);
  }

  async createBlog(blogData) {
    return await this.create(COLLECTIONS.BLOGS, blogData, blogData.id);
  }

  async createUser(userData) {
    return await this.create(COLLECTIONS.USERS, userData, userData.id);
  }

  async getProduct(id) {
    return await this.findById(COLLECTIONS.PRODUCTS, id);
  }

  async getUser(id) {
    return await this.findById(COLLECTIONS.USERS, id);
  }

  async updateProduct(id, updateData) {
    return await this.update(COLLECTIONS.PRODUCTS, id, updateData);
  }

  async deleteProduct(id) {
    return await this.delete(COLLECTIONS.PRODUCTS, id);
  }

  async searchProducts(searchTerm, options = {}) {
    // Simple search implementation
    const products = await this.findAll(COLLECTIONS.PRODUCTS, {
      where: [['status', '==', 'active']],
      limit: options.limit || 10
    });
    
    // Filter by search term (client-side for now)
    const filtered = products.filter(product => 
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.nameVi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    return { products: filtered };
  }
}

// Legacy compatibility methods
const firestoreService = new FirestoreService();

const connect = () => firestoreService.connect();
const close = () => firestoreService.close();
const query = (collection, conditions = {}) => {
  const where = Object.entries(conditions).map(([field, value]) => [field, '==', value]);
  return firestoreService.findAll(collection, { where });
};
const execute = async (operation, collection, data, docId = null) => {
  switch (operation) {
    case 'create':
      return await firestoreService.create(collection, data, docId);
    case 'update':
      return await firestoreService.update(collection, docId, data);
    case 'delete':
      return await firestoreService.delete(collection, docId);
    default:
      throw new Error(`Unsupported operation: ${operation}`);
  }
};

// Order specific functions for compatibility
const createOrder = (orderData) => firestoreService.createOrder(orderData);
const getOrder = async (orderNumber) => {
  const orders = await firestoreService.findAll(COLLECTIONS.ORDERS, {
    where: [['orderNumber', '==', orderNumber]],
    limit: 1
  });
  return orders[0] || null;
};
const updateOrderPaymentInfo = async (orderNumber, paymentInfo) => {
  const order = await getOrder(orderNumber);
  if (order) {
    await firestoreService.update(COLLECTIONS.ORDERS, order.id, paymentInfo);
  }
  return { success: true };
};
const updateOrderPaymentStatus = async (orderNumber, status, additionalInfo = {}) => {
  const order = await getOrder(orderNumber);
  if (order) {
    await firestoreService.update(COLLECTIONS.ORDERS, order.id, {
      paymentStatus: status,
      ...additionalInfo
    });
  }
  return { success: true };
};

const testConnection = () => firestoreService.connect();
const getFirestoreDb = () => db;
const isMockMode = () => process.env.NODE_ENV === 'development' && !db.collection;

module.exports = {
  // Firestore service instance
  firestoreService,
  
  // Legacy compatibility
  connect,
  query,
  execute,
  close,
  testConnection,
  getFirestoreDb,
  createOrder,
  getOrder,
  updateOrderPaymentInfo,
  updateOrderPaymentStatus,
  isMockMode,
  
  // Collections
  COLLECTIONS,
  
  // Direct access
  db,
  bucket,
  app
};
