const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 200
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^[a-z0-9-]+$/
  },
  description: {
    type: String,
    trim: true,
    maxLength: 2000
  },
  shortDescription: {
    type: String,
    trim: true,
    maxLength: 500
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  // Weight-based pricing structure - flexible object for different weights
  weightPricing: {
    type: Map,
    of: Number,
    default: new Map([
      ['100g', 0],
      ['250g', 0],
      ['500g', 0],
      ['1kg', 0]
    ])
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  costPrice: {
    type: Number,
    min: 0
  },
  sku: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  barcode: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
  },
  stockQuantity: {
    type: Number,
    min: 0,
    default: 0
  },
  lowStockThreshold: {
    type: Number,
    min: 0,
    default: 10
  },
  weight: {
    type: Number,
    min: 0
  },
  dimensions: {
    length: { type: Number, min: 0 },
    width: { type: Number, min: 0 },
    height: { type: Number, min: 0 },
    unit: { type: String, enum: ['cm', 'mm', 'inch'], default: 'cm' }
  },
  image_url: {
    type: String,
    trim: true
  },
  images: [{
    type: String,
    trim: true
  }],
  thumbnail: {
    type: String,
    trim: true
  },
  categoryId: {
    type: String,
    required: true
  },
  category: {
    name: { type: String, trim: true },
    slug: { type: String, trim: true }
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Coffee-specific attributes
  origin: {
    type: String,
    trim: true
  },
  region: {
    type: String,
    trim: true
  },
  farm: {
    type: String,
    trim: true
  },
  altitude: {
    type: Number,
    min: 0
  },
  varietals: [{
    type: String,
    trim: true
  }],
  roast_level: {
    type: String,
    enum: ['Light', 'Medium-Light', 'Medium', 'Medium-Dark', 'Dark', 'French', 'Italian'],
    trim: true
  },
  roast_date: {
    type: Date
  },
  flavor_profile: [{
    type: String,
    trim: true
  }],
  aroma: [{
    type: String,
    trim: true
  }],
  acidity: {
    type: String,
    enum: ['Low', 'Medium-Low', 'Medium', 'Medium-High', 'High'],
    trim: true
  },
  body: {
    type: String,
    enum: ['Light', 'Medium-Light', 'Medium', 'Medium-Full', 'Full'],
    trim: true
  },
  sweetness: {
    type: String,
    enum: ['Low', 'Medium-Low', 'Medium', 'Medium-High', 'High'],
    trim: true
  },
  brewing_methods: [{
    type: String,
    trim: true
  }],
  processing_method: {
    type: String,
    enum: ['Washed', 'Natural', 'Honey', 'Semi-Washed', 'Wet-Hulled'],
    trim: true
  },
  harvest_season: {
    type: String,
    trim: true
  },
  certification: [{
    type: String,
    enum: ['Organic', 'Fair Trade', 'Rainforest Alliance', 'Bird Friendly', 'UTZ'],
    trim: true
  }],
  // Product status and visibility
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'discontinued'],
    default: 'active'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isDigital: {
    type: Boolean,
    default: false
  },
  requiresShipping: {
    type: Boolean,
    default: true
  },
  // SEO and metadata
  metaTitle: {
    type: String,
    trim: true,
    maxLength: 160
  },
  metaDescription: {
    type: String,
    trim: true,
    maxLength: 320
  },
  metaKeywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  // Ratings and reviews
  rating: {
    average: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    count: {
      type: Number,
      min: 0,
      default: 0
    },
    distribution: {
      5: { type: Number, min: 0, default: 0 },
      4: { type: Number, min: 0, default: 0 },
      3: { type: Number, min: 0, default: 0 },
      2: { type: Number, min: 0, default: 0 },
      1: { type: Number, min: 0, default: 0 }
    }
  },
  // Sales analytics
  totalSales: {
    type: Number,
    min: 0,
    default: 0
  },
  totalRevenue: {
    type: Number,
    min: 0,
    default: 0
  },
  viewCount: {
    type: Number,
    min: 0,
    default: 0
  },
  // Timestamps
  publishedAt: {
    type: Date
  },
  discontinuedAt: {
    type: Date
  }
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Convert Map to Object for JSON serialization
      if (ret.weightPricing instanceof Map) {
        ret.weightPricing = Object.fromEntries(ret.weightPricing);
      }
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      // Convert Map to Object
      if (ret.weightPricing instanceof Map) {
        ret.weightPricing = Object.fromEntries(ret.weightPricing);
      }
      return ret;
    }
  }
});

// Indexes for performance
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ categoryId: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ totalSales: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ publishedAt: -1 });

// Text search index
productSchema.index({ 
  name: 'text', 
  description: 'text', 
  shortDescription: 'text',
  tags: 'text',
  origin: 'text',
  flavor_profile: 'text'
});

// Compound indexes
productSchema.index({ categoryId: 1, status: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, status: 1, isActive: 1 });
productSchema.index({ price: 1, status: 1, isActive: 1 });

// Virtual fields
productSchema.virtual('isInStock').get(function() {
  return this.stockQuantity > 0;
});

productSchema.virtual('isLowStock').get(function() {
  return this.stockQuantity > 0 && this.stockQuantity <= this.lowStockThreshold;
});

productSchema.virtual('discountPercentage').get(function() {
  if (this.comparePrice && this.comparePrice > this.price) {
    return Math.round(((this.comparePrice - this.price) / this.comparePrice) * 100);
  }
  return 0;
});

productSchema.virtual('averageRating').get(function() {
  return this.rating.average || 0;
});

// Pre-save middleware
productSchema.pre('save', function(next) {
  // Auto-generate slug if not provided
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  
  // Set published date on first activation
  if (this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Initialize weightPricing if empty
  if (!this.weightPricing || this.weightPricing.size === 0) {
    this.weightPricing = new Map([
      ['100g', Math.round(this.price * 0.4)],
      ['250g', this.price],
      ['500g', Math.round(this.price * 1.9)],
      ['1kg', Math.round(this.price * 3.6)]
    ]);
  }
  
  next();
});

// Static methods
productSchema.statics.findActive = function() {
  return this.find({ status: 'active', isActive: true });
};

productSchema.statics.findFeatured = function() {
  return this.find({ status: 'active', isActive: true, isFeatured: true });
};

productSchema.statics.findByCategory = function(categoryId) {
  return this.find({ categoryId, status: 'active', isActive: true });
};

productSchema.statics.searchProducts = function(query) {
  return this.find({
    $text: { $search: query },
    status: 'active',
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
productSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  
  // Update distribution
  this.rating.distribution[newRating] += 1;
  
  return this.save();
};

productSchema.methods.incrementView = function() {
  this.viewCount += 1;
  return this.save();
};

productSchema.methods.updateStock = function(quantity) {
  this.stockQuantity = Math.max(0, this.stockQuantity + quantity);
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
