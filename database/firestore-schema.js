// Firestore Collections Structure
// This file defines the Firestore database structure equivalent to the SQL schema

export const COLLECTIONS = {
  USERS: 'users',
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  ORDERS: 'orders',
  BLOGS: 'blogs',
  CONTACTS: 'contacts',
  SUBSCRIPTIONS: 'subscriptions',
  CART_ITEMS: 'cartItems',
  SETTINGS: 'settings'
};

// User Document Structure
export const USER_SCHEMA = {
  id: 'string', // Auto-generated document ID
  email: 'string',
  password: 'string', // Hashed password
  firstName: 'string',
  lastName: 'string',
  phone: 'string',
  address: 'string',
  city: 'string',
  postalCode: 'string',
  role: 'string', // 'customer' | 'admin'
  isActive: 'boolean',
  emailVerified: 'boolean',
  facebookId: 'string',
  profileImage: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Product Document Structure
export const PRODUCT_SCHEMA = {
  id: 'string',
  name: 'string',
  nameVi: 'string',
  slug: 'string',
  description: 'string',
  descriptionVi: 'string',
  shortDescription: 'string',
  shortDescriptionVi: 'string',
  price: 'number',
  comparePrice: 'number',
  sku: 'string',
  stockQuantity: 'number',
  weight: 'number',
  roastLevel: 'string',
  origin: 'string',
  processingMethod: 'string',
  images: 'array', // Array of image URLs
  categories: 'array', // Array of category IDs
  isActive: 'boolean',
  isFeatured: 'boolean',
  metaTitle: 'string',
  metaTitleVi: 'string',
  metaDescription: 'string',
  metaDescriptionVi: 'string',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Category Document Structure
export const CATEGORY_SCHEMA = {
  id: 'string',
  name: 'string',
  nameVi: 'string',
  slug: 'string',
  description: 'string',
  descriptionVi: 'string',
  isActive: 'boolean',
  createdAt: 'timestamp'
};

// Order Document Structure
export const ORDER_SCHEMA = {
  id: 'string',
  orderNumber: 'string',
  userId: 'string', // Reference to user document
  customerEmail: 'string',
  customerName: 'string',
  customerPhone: 'string',
  shippingAddress: 'string',
  shippingCity: 'string',
  shippingPostalCode: 'string',
  shippingProvince: 'string',
  billingAddress: 'string',
  billingCity: 'string',
  billingPostalCode: 'string',
  billingProvince: 'string',
  subtotal: 'number',
  shippingFee: 'number',
  tax: 'number',
  discount: 'number',
  total: 'number',
  status: 'string', // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  paymentMethod: 'string', // 'cod' | 'momo' | 'vnpay' | 'qr'
  paymentStatus: 'string', // 'pending' | 'completed' | 'failed' | 'refunded'
  paymentId: 'string',
  transactionId: 'string',
  qrCode: 'string',
  qrCodeUrl: 'string',
  paymentUrl: 'string',
  paidAt: 'timestamp',
  expiresAt: 'timestamp',
  notes: 'string',
  items: 'array', // Array of order items
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Order Item Structure (within order document)
export const ORDER_ITEM_SCHEMA = {
  productId: 'string',
  productName: 'string',
  productSku: 'string',
  quantity: 'number',
  price: 'number' // Price at time of order
};

// Blog Document Structure
export const BLOG_SCHEMA = {
  id: 'string',
  title: 'string',
  titleVi: 'string',
  slug: 'string',
  excerpt: 'string',
  excerptVi: 'string',
  content: 'string',
  contentVi: 'string',
  featuredImage: 'string',
  authorId: 'string', // Reference to user document
  status: 'string', // 'draft' | 'published' | 'archived'
  publishedAt: 'timestamp',
  metaTitle: 'string',
  metaTitleVi: 'string',
  metaDescription: 'string',
  metaDescriptionVi: 'string',
  tags: 'array', // Array of tag strings
  viewCount: 'number',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Contact Document Structure
export const CONTACT_SCHEMA = {
  id: 'string',
  name: 'string',
  email: 'string',
  phone: 'string',
  subject: 'string',
  message: 'string',
  status: 'string', // 'new' | 'replied' | 'closed'
  createdAt: 'timestamp',
  repliedAt: 'timestamp'
};

// Subscription Document Structure
export const SUBSCRIPTION_SCHEMA = {
  id: 'string',
  email: 'string',
  isActive: 'boolean',
  createdAt: 'timestamp'
};

// Cart Item Document Structure
export const CART_ITEM_SCHEMA = {
  id: 'string',
  userId: 'string', // Reference to user document
  productId: 'string', // Reference to product document
  quantity: 'number',
  createdAt: 'timestamp',
  updatedAt: 'timestamp'
};

// Settings Document Structure
export const SETTINGS_SCHEMA = {
  id: 'string',
  settingKey: 'string',
  settingValue: 'any', // Can be string, number, boolean, object
  settingType: 'string', // 'text' | 'number' | 'boolean' | 'json'
  description: 'string',
  updatedAt: 'timestamp'
};

// Firestore Security Rules (to be added in Firebase Console)
export const SECURITY_RULES = `
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Products are readable by all, writable by admin only
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Categories are readable by all, writable by admin only
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Orders can be read by the user who created them or admin
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Blogs are readable by all, writable by admin only
    match /blogs/{blogId} {
      allow read: if resource.data.status == 'published' || 
        (request.auth != null && 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Contacts can be created by anyone, read/updated by admin only
    match /contacts/{contactId} {
      allow create: if true;
      allow read, update: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Subscriptions can be created by anyone, managed by admin
    match /subscriptions/{subId} {
      allow create: if true;
      allow read, update, delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Cart items can be managed by the owner
    match /cartItems/{cartId} {
      allow read, write: if request.auth != null && 
        resource.data.userId == request.auth.uid;
    }
    
    // Settings readable by all, writable by admin only
    match /settings/{settingId} {
      allow read: if true;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
`;
