// Database middleware for MongoDB
// This file provides database utilities for routes using native MongoDB driver

/**
 * Get database instance from request object
 * This is set by the database middleware in server.js
 */
function getDatabase(req) {
  if (req.databaseProvider === 'postgres') {
    const error = new Error('MongoDB fallback is disabled. This endpoint must use a PostgreSQL repository.');
    error.status = 501;
    throw error;
  }

  if (!req.db) {
    throw new Error('Database not available in request. Make sure database middleware is loaded.');
  }
  return req.db;
}

/**
 * Get a specific collection from the database
 */
function getCollection(req, collectionName) {
  const db = getDatabase(req);
  return db.collection(collectionName);
}

/**
 * Convert string ID to MongoDB ObjectId
 * Handles both ObjectId format (24 hex chars) and custom string IDs
 */
function toObjectId(id) {
  const { ObjectId } = require('mongodb');
  
  if (!id) {
    throw new Error('ID is required');
  }
  
  // If it's already an ObjectId, return as is
  if (id instanceof ObjectId) {
    return id;
  }
  
  // If it's a string with ObjectId format (24 hex characters), convert to ObjectId
  if (typeof id === 'string' && id.match(/^[0-9a-fA-F]{24}$/)) {
    return new ObjectId(id);
  }
  
  // For custom string IDs or other formats, return as string
  // This allows database queries to work with both ObjectId and string _id fields
  if (typeof id === 'string') {
    return id;
  }
  
  throw new Error('Invalid ID format');
}

/**
 * Create a new document with timestamps
 */
function createDocument(data) {
  const now = new Date();
  return {
    ...data,
    createdAt: now,
    updatedAt: now
  };
}

/**
 * Update document with updated timestamp
 */
function updateDocument(data) {
  return {
    ...data,
    updatedAt: new Date()
  };
}

/**
 * Paginate results
 */
function paginateQuery(page = 1, limit = 10) {
  const skip = (parseInt(page) - 1) * parseInt(limit);
  return {
    skip: Math.max(0, skip),
    limit: Math.min(parseInt(limit), 100) // Max 100 items per page
  };
}

/**
 * Build sort object from query parameter
 */
function buildSort(sortBy) {
  switch (sortBy) {
    case 'price_asc':
      return { price: 1 };
    case 'price_desc':
      return { price: -1 };
    case 'name':
    case 'name_asc':
      return { name: 1 };
    case 'name_desc':
      return { name: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

/**
 * Handle MongoDB errors consistently
 */
function handleDatabaseError(error, res, operation = 'Database operation') {
  console.error(`❌ ${operation} failed:`, {
    name: error.name,
    message: error.message,
    code: error.code,
    timestamp: new Date().toISOString()
  });

  if (error.name === 'MongoServerError' && error.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate entry found',
      error: 'A record with this information already exists'
    });
  }

  if (error.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      success: false,
      message: 'Database unavailable',
      error: 'Cannot connect to database. Please try again later.'
    });
  }

  return res.status(500).json({
    success: false,
    message: `${operation} failed`,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
}

/**
 * Validate required fields
 */
function validateRequired(data, requiredFields) {
  const missing = [];
  
  for (const field of requiredFields) {
    if (!data[field] || data[field] === '') {
      missing.push(field);
    }
  }
  
  if (missing.length > 0) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`);
  }
}

/**
 * Clean data for MongoDB insertion (remove undefined values)
 */
function cleanData(data) {
  const cleaned = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && value !== null) {
      cleaned[key] = value;
    }
  }
  
  return cleaned;
}

module.exports = {
  getDatabase,
  getCollection,
  toObjectId,
  createDocument,
  updateDocument,
  paginateQuery,
  buildSort,
  handleDatabaseError,
  validateRequired,
  cleanData
};
