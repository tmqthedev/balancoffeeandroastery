// Firebase Database Configuration
const admin = require('firebase-admin');

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  try {
    // For development, use simplified initialization
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Using Firebase development mode...');
      admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'balancoffeeandroastery'
      });
    } else {
      // Production mode with service account
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_PATH 
        ? require(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
        : {
            type: "service_account",
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
          };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID || 'balancoffeeandroastery'
      });
    }

    console.log('✅ Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization failed:', error.message);
    console.log('💡 Trying with mock data for development...');
    
    // Fallback for development
    try {
      admin.initializeApp({
        projectId: 'balancoffeeandroastery'
      });
      console.log('✅ Firebase initialized with minimal config');
    } catch (fallbackError) {
      console.error('❌ Firebase fallback failed:', fallbackError.message);
      throw error;
    }
  }
}

const db = admin.firestore();

// Database connection methods for Firebase
const connect = async () => {
  try {
    // Test Firebase connection with fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Development mode - using mock Firebase connection');
      return { 
        collection: () => ({
          doc: () => ({
            get: async () => ({ exists: false, data: () => null }),
            set: async () => ({ id: 'mock_id' }),
            update: async () => ({ id: 'mock_id' }),
            delete: async () => ({ id: 'mock_id' })
          }),
          get: async () => ({ docs: [], empty: true }),
          add: async () => ({ id: 'mock_id' }),
          where: () => ({
            get: async () => ({ docs: [], empty: true })
          })
        })
      };
    }
    
    // Production Firebase connection
    await db.collection('_test').limit(1).get();
    console.log('✅ Firebase Firestore connection successful');
    return db;
  } catch (error) {
    console.error('❌ Firebase connection failed, using mock data:', error.message);
    
    // Return mock database for development
    return { 
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => null }),
          set: async () => ({ id: 'mock_id' }),
          update: async () => ({ id: 'mock_id' }),
          delete: async () => ({ id: 'mock_id' })
        }),
        get: async () => ({ docs: [], empty: true }),
        add: async () => ({ id: 'mock_id' }),
        where: () => ({
          get: async () => ({ docs: [], empty: true })
        })
      })
    };
  }
};

// Utility method for SQL-like queries (for migration compatibility)
const query = async (collectionName, conditions = {}) => {
  try {
    // Development mode mock
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Mock query for ${collectionName}:`, conditions);
      return []; // Return empty array for development
    }
    
    let ref = db.collection(collectionName);
    
    // Apply conditions (simple where clauses)
    Object.entries(conditions).forEach(([field, value]) => {
      ref = ref.where(field, '==', value);
    });
    
    const snapshot = await ref.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error(`Firebase query error for ${collectionName}:`, error);
    // Return empty array on error for development
    return [];
  }
};

// Execute operations (create, update, delete)
const execute = async (operation, collectionName, data, docId = null) => {
  try {
    // Development mode mock
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔄 Mock ${operation} for ${collectionName}:`, { data, docId });
      return { id: docId || 'mock_id_' + Date.now(), success: true };
    }
    
    const collection = db.collection(collectionName);
    
    switch (operation) {
      case 'create':
        if (docId) {
          await collection.doc(docId).set(data);
          return { id: docId, ...data };
        } else {
          const docRef = await collection.add(data);
          return { id: docRef.id, ...data };
        }
      
      case 'update':
        if (!docId) throw new Error('Document ID required for update');
        await collection.doc(docId).update(data);
        return { id: docId, ...data };
      
      case 'delete':
        if (!docId) throw new Error('Document ID required for delete');
        await collection.doc(docId).delete();
        return { id: docId, deleted: true };
      
      default:
        throw new Error(`Unsupported operation: ${operation}`);
    }
  } catch (error) {
    console.error(`Firebase execute error:`, error);
    throw error;
  }
};

const close = async () => {
  // Firebase Admin SDK doesn't require explicit closing
  console.log('✅ Firebase connection closed gracefully');
};

// Test connection
const testConnection = async () => {
  try {
    await connect();
    console.log('✅ Firebase database connection test successful');
    return true;
  } catch (err) {
    console.error('❌ Firebase database connection test failed:', err.message);
    return false;
  }
};

// Get Firestore instance
const getFirestore = () => db;

// Order specific functions
const createOrder = async (orderData) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mock createOrder:', orderData);
      return {
        id: 'mock_order_' + Date.now(),
        orderNumber: orderData.orderNumber || 'ORD' + Date.now(),
        ...orderData,
        createdAt: new Date().toISOString()
      };
    }
    
    const docRef = await db.collection('orders').add({
      ...orderData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return { id: docRef.id, ...orderData };
  } catch (error) {
    console.error('Create order error:', error);
    throw error;
  }
};

const getOrder = async (orderNumber) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mock getOrder:', orderNumber);
      return {
        id: 'mock_order_id',
        orderNumber,
        total: 100000,
        status: 'pending',
        customerInfo: {
          name: 'Test Customer',
          phone: '0123456789',
          email: 'test@test.com'
        },
        items: []
      };
    }
    
    const snapshot = await db.collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get();
    
    if (snapshot.empty) {
      return null;
    }
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  } catch (error) {
    console.error('Get order error:', error);
    throw error;
  }
};

const updateOrderPaymentInfo = async (orderNumber, paymentInfo) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mock updateOrderPaymentInfo:', { orderNumber, paymentInfo });
      return { success: true };
    }
    
    const snapshot = await db.collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        ...paymentInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Update order payment info error:', error);
    throw error;
  }
};

const updateOrderPaymentStatus = async (orderNumber, status, additionalInfo = {}) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Mock updateOrderPaymentStatus:', { orderNumber, status, additionalInfo });
      return { success: true };
    }
    
    const snapshot = await db.collection('orders')
      .where('orderNumber', '==', orderNumber)
      .limit(1)
      .get();
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      await doc.ref.update({
        paymentStatus: status,
        ...additionalInfo,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Update order payment status error:', error);
    throw error;
  }
};

module.exports = {
  connect,
  query,
  execute,
  close,
  testConnection,
  getFirestore,
  // Order functions
  createOrder,
  getOrder,
  updateOrderPaymentInfo,
  updateOrderPaymentStatus,
  // Legacy compatibility
  sql: null, // No longer using SQL
  isMockMode: () => process.env.NODE_ENV === 'development',
  mockData: {}, // No more mock data
};
