// MongoDB Schema definitions for Balan Coffee & Roastery
// Mongoose schema-based structure replacing Firestore

const mongoose = require('mongoose');

// Export collection names for consistency
const COLLECTIONS = {
  PRODUCTS: 'products',
  CATEGORIES: 'categories',
  USERS: 'users',
  ORDERS: 'orders',
  CARTS: 'carts',
  BLOGS: 'blogs',
  CONTACTS: 'contacts',
  SETTINGS: 'settings',
  SHIPPING_ZONES: 'shippingzones'
};

// Product Schema Structure (for reference)
const PRODUCT_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  name: 'String (required)',
  nameVi: 'String (required)',
  slug: 'String (required, unique)',
  description: 'String',
  descriptionVi: 'String', 
  shortDescription: 'String',
  shortDescriptionVi: 'String',
  price: 'Number (required)',
  originalPrice: 'Number',
  costPrice: 'Number',
  sku: 'String',
  barcode: 'String',
  category: 'String (ref to Category)',
  type: 'Enum [coffee_beans, beverages, accessories, gift_sets]',
  status: 'Enum [active, inactive, out_of_stock, discontinued]',
  featured: 'Boolean',
  images: 'Array of Strings',
  thumbnail: 'String',
  weight: 'String',
  dimensions: 'Object {length, width, height, unit}',
  inventory: 'Object {quantity, lowStockAlert, trackQuantity}',
  shipping: 'Object {weight, requiresShipping, shippingClass}',
  seo: 'Object {metaTitle, metaTitleVi, metaDescription, metaDescriptionVi, keywords, canonicalUrl}',
  attributes: 'Object {roastLevel, origin, processingMethod, flavorNotes, brewingMethods, caffeine, acidity, body, aroma}',
  tags: 'Array of Strings',
  relatedProducts: 'Array of Strings',
  crossSells: 'Array of Strings',
  upSells: 'Array of Strings',
  viewCount: 'Number (default: 0)',
  salesCount: 'Number (default: 0)',
  taxable: 'Boolean (default: true)',
  taxClass: 'String',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Category Schema Structure
const CATEGORY_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  name: 'String (required)',
  nameVi: 'String (required)',
  slug: 'String (required, unique)',
  description: 'String',
  descriptionVi: 'String',
  image: 'String',
  icon: 'String',
  parentId: 'String',
  order: 'Number (default: 0)',
  isActive: 'Boolean (default: true)',
  metaTitle: 'String',
  metaTitleVi: 'String',
  metaDescription: 'String',
  metaDescriptionVi: 'String',
  keywords: 'Array of Strings',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// User Schema Structure
const USER_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  email: 'String (required, unique)',
  password: 'String',
  firstName: 'String',
  lastName: 'String',
  displayName: 'String',
  phone: 'String',
  avatar: 'String',
  dateOfBirth: 'Date',
  gender: 'Enum [male, female, other]',
  role: 'Enum [customer] (default: customer)',
  status: 'Enum [active, inactive, suspended] (default: active)',
  emailVerified: 'Boolean (default: false)',
  phoneVerified: 'Boolean (default: false)',
  providers: 'Object {facebook: {id, accessToken}, google: {id, accessToken}}',
  addresses: 'Array of Objects {type, firstName, lastName, company, address1, address2, city, province, postalCode, country, phone, isDefault}',
  preferences: 'Object {language, currency, notifications}',
  stats: 'Object {totalOrders, totalSpent, averageOrderValue, lastOrderDate, lastLoginDate}',
  metadata: 'Object {source, utmSource, utmMedium, utmCampaign, referrer, ipAddress, userAgent}',
  security: 'Object {lastPasswordChange, loginAttempts, lockedUntil, twoFactorEnabled}',
  lastActivityAt: 'Date',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Order Schema Structure  
const ORDER_SCHEMA_FIELDS = {
  orderNumber: 'String (required, unique)',
  customerId: 'String (ref to User, required)',
  customerInfo: 'Object {email, firstName, lastName, phone}',
  items: 'Array of Objects {productId, productName, productNameVi, sku, price, quantity, subtotal, image, variant}',
  subtotal: 'Number (required)',
  shippingFee: 'Number (default: 0)',
  taxAmount: 'Number (default: 0)',
  discountAmount: 'Number (default: 0)',
  total: 'Number (required)',
  billingAddress: 'Object {firstName, lastName, company, address1, address2, city, province, postalCode, country, phone}',
  shippingAddress: 'Object {firstName, lastName, company, address1, address2, city, province, postalCode, country, phone}',
  shipping: 'Object {method, methodName, cost, estimatedDelivery, trackingNumber, carrier}',
  payment: 'Object {method, methodName, status, transactionId, paymentId, paidAt, currency, exchangeRate, gatewayResponse}',
  status: 'Enum [pending, confirmed, processing, shipped, delivered, cancelled, refunded]',
  fulfillmentStatus: 'Enum [unfulfilled, partial, fulfilled]',
  timeline: 'Array of Objects {status, note, timestamp, updatedBy}',
  notes: 'String',
  customerNotes: 'String',
  internalNotes: 'String',
  tags: 'Array of Strings',
  cancellation: 'Object {reason, cancelledAt, cancelledBy, refundAmount, refundedAt}',
  source: 'String',
  channel: 'String (default: website)',
  utmSource: 'String',
  utmMedium: 'String',
  utmCampaign: 'String',
  confirmedAt: 'Date',
  shippedAt: 'Date',
  deliveredAt: 'Date',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Cart Schema Structure
const CART_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  customerId: 'String (ref to User)',
  sessionId: 'String',
  items: 'Array of Objects {productId, quantity, price, variant, addedAt}',
  itemCount: 'Number (default: 0)',
  subtotal: 'Number (default: 0)',
  lastActivity: 'Date',
  ipAddress: 'String',
  userAgent: 'String',
  checkout: 'Object {step, shippingAddress, billingAddress, shippingMethod, paymentMethod}',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Blog Schema Structure
const BLOG_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  title: 'String (required)',
  titleVi: 'String (required)',
  slug: 'String (required, unique)',
  excerpt: 'String',
  excerptVi: 'String',
  content: 'String (required)',
  contentVi: 'String (required)',
  featuredImage: 'String',
  gallery: 'Array of Strings',
  category: 'String',
  tags: 'Array of Strings',
  status: 'Enum [draft, published, private, scheduled]',
  publishedAt: 'Date',
  scheduledAt: 'Date',
  author: 'Object {id, name, email, avatar}',
  seo: 'Object {metaTitle, metaTitleVi, metaDescription, metaDescriptionVi, keywords, canonicalUrl, focusKeyword, ogImage}',
  social: 'Object {facebookShares, twitterShares, linkedinShares}',
  viewCount: 'Number (default: 0)',
  likeCount: 'Number (default: 0)',
  commentCount: 'Number (default: 0)',
  relatedPosts: 'Array of Strings',
  relatedProducts: 'Array of Strings',
  allowComments: 'Boolean (default: true)',
  featured: 'Boolean (default: false)',
  sticky: 'Boolean (default: false)',
  readingTime: 'Number (default: 0)',
  wordCount: 'Number (default: 0)',
  language: 'String (default: vi)',
  translations: 'Array of Objects {language, title, content, slug}',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Contact Schema Structure
const CONTACT_SCHEMA_FIELDS = {
  name: 'String (required)',
  email: 'String (required)',
  phone: 'String',
  subject: 'String (required)',
  message: 'String (required)',
  customerId: 'String (ref to User)',
  type: 'Enum [inquiry, support, complaint, feedback, business, other]',
  status: 'Enum [new, in_progress, resolved, closed]',
  priority: 'Enum [low, medium, high, urgent]',
  assignedTo: 'Object {id, name, email}',
  responses: 'Array of Objects {respondedBy, message, responseDate, isInternal}',
  resolution: 'Object {resolvedBy, resolvedAt, resolutionNote, satisfactionRating, customerFeedback}',
  source: 'String (default: website)',
  ipAddress: 'String',
  userAgent: 'String',
  referrer: 'String',
  tags: 'Array of Strings',
  department: 'String',
  followUpRequired: 'Boolean (default: false)',
  followUpDate: 'Date',
  followUpNote: 'String',
  internalNotes: 'Array of Objects {note, addedBy, addedAt}',
  emailSent: 'Boolean (default: false)',
  emailSentAt: 'Date',
  autoReplyId: 'String',
  consentToContact: 'Boolean (default: true)',
  dataRetentionDate: 'Date',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Setting Schema Structure
const SETTING_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  category: 'String (required)',
  key: 'String (required)',
  value: 'Mixed',
  type: 'Enum [string, number, boolean, object, array]',
  description: 'String',
  descriptionVi: 'String',
  isPublic: 'Boolean (default: false)',
  isEditable: 'Boolean (default: true)',
  validationRules: 'Object {required, min, max, pattern, enum}',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Shipping Zone Schema Structure
const SHIPPING_ZONE_SCHEMA_FIELDS = {
  _id: 'String (custom ID)',
  name: 'String (required)',
  nameVi: 'String (required)',
  description: 'String',
  descriptionVi: 'String',
  countries: 'Array of Strings',
  provinces: 'Array of Strings',
  cities: 'Array of Strings',
  postalCodes: 'Array of Strings',
  methods: 'Array of Objects {id, name, nameVi, description, descriptionVi, type, cost, minOrder, maxWeight, estimatedDays, isActive}',
  isActive: 'Boolean (default: true)',
  priority: 'Number (default: 0)',
  restrictions: 'Object {minOrderValue, maxOrderValue, maxWeight, maxDimensions, excludedProductTypes, excludedProducts}',
  createdAt: 'Date',
  updatedAt: 'Date'
};

// Database Indexes for Performance
const MONGODB_INDEXES = {
  products: [
    { slug: 1 },
    { category: 1 },
    { type: 1 },
    { status: 1 },
    { featured: 1 },
    { price: 1 },
    { 'seo.keywords': 1 },
    { tags: 1 },
    { createdAt: -1 },
    { name: 'text', nameVi: 'text', description: 'text', descriptionVi: 'text', 'seo.keywords': 'text', tags: 'text' }
  ],
  categories: [
    { slug: 1 },
    { parentId: 1 },
    { order: 1 }
  ],
  users: [
    { email: 1 },
    { phone: 1 },
    { role: 1 },
    { status: 1 },
    { 'providers.facebook.id': 1 },
    { 'providers.google.id': 1 },
    { lastActivityAt: -1 }
  ],
  orders: [
    { orderNumber: 1 },
    { customerId: 1 },
    { status: 1 },
    { 'payment.status': 1 },
    { createdAt: -1 },
    { 'customerInfo.email': 1 }
  ],
  carts: [
    { customerId: 1 },
    { sessionId: 1 },
    { lastActivity: -1 }
  ],
  blogs: [
    { slug: 1 },
    { status: 1 },
    { publishedAt: -1 },
    { category: 1 },
    { tags: 1 },
    { featured: 1 },
    { author: 1 },
    { title: 'text', titleVi: 'text', content: 'text', contentVi: 'text', excerpt: 'text', excerptVi: 'text', tags: 'text' }
  ],
  contacts: [
    { email: 1 },
    { status: 1 },
    { type: 1 },
    { priority: 1 },
    { createdAt: -1 },
    { customerId: 1 },
    { 'assignedTo.id': 1 },
    { name: 'text', email: 'text', subject: 'text', message: 'text' }
  ],
  settings: [
    { category: 1, key: 1 },
    { isPublic: 1 }
  ],
  shippingzones: [
    { isActive: 1, priority: 1 },
    { countries: 1 },
    { provinces: 1 }
  ]
};

// Connection String Template
const MONGODB_CONNECTION_EXAMPLES = {
  local: 'mongodb://localhost:27017/balancoffee',
  atlas: 'mongodb+srv://username:password@cluster.mongodb.net/balancoffee?retryWrites=true&w=majority',
  docker: 'mongodb://mongo:27017/balancoffee'
};

// Environment Variables Template
const ENV_VARIABLES = {
  MONGODB_URI: 'mongodb://localhost:27017/balancoffee',
  NODE_ENV: 'development',
  PORT: '3000',
  JWT_SECRET: 'your-jwt-secret-here',
  JWT_EXPIRES_IN: '7d',
  CORS_ORIGIN: 'http://localhost:5173'
};

module.exports = {
  COLLECTIONS,
  PRODUCT_SCHEMA_FIELDS,
  CATEGORY_SCHEMA_FIELDS,
  USER_SCHEMA_FIELDS,
  ORDER_SCHEMA_FIELDS,
  CART_SCHEMA_FIELDS,
  BLOG_SCHEMA_FIELDS,
  CONTACT_SCHEMA_FIELDS,
  SETTING_SCHEMA_FIELDS,
  SHIPPING_ZONE_SCHEMA_FIELDS,
  MONGODB_INDEXES,
  MONGODB_CONNECTION_EXAMPLES,
  ENV_VARIABLES
};
