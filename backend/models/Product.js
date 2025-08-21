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
  // PRICING CONFIGURATION
  pricingType: {
    type: String,
    enum: ['fixed', 'weight-based'],
    default: 'fixed',
    required: true
  },
  
  // Fixed pricing (for products without weight options)
  price: {
    type: Number,
    min: 0,
    required: function() { return this.pricingType === 'fixed'; }
  },
  
  // WEIGHT-BASED PRICING
  weightPricing: [{
    weight: {
      type: Number,
      required: true,
      min: 0
    },
    weightDisplay: {
      type: String,
      required: true,
      trim: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stockQuantity: {
      type: Number,
      min: 0,
      default: 0
    },
    isAvailable: {
      type: Boolean,
      default: true
    },
    isDefault: {
      type: Boolean,
      default: false
    },
    discount: {
      percentage: {
        type: Number,
        min: 0,
        max: 100
      },
      startDate: Date,
      endDate: Date,
      isActive: {
        type: Boolean,
        default: false
      }
    }
  }],
  // Product promotion
  promotion: {
    title: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    discountPercentage: {
      type: Number,
      min: 0,
      max: 100
    },
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: false
    }
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
    default: 0,
    required: function() { return this.pricingType === 'fixed'; }
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
    url: {
      type: String,
      trim: true,
      required: true
    },
    alt: {
      type: String,
      trim: true,
      default: ''
    },
    title: {
      type: String,
      trim: true
    },
    isMain: {
      type: Boolean,
      default: false
    },
    order: {
      type: Number,
      default: 0
    },
    size: {
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 }
    },
    type: {
      type: String,
      enum: ['main', 'gallery', 'thumbnail', 'zoom'],
      default: 'gallery'
    }
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
  seo: {
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
    canonicalUrl: {
      type: String,
      trim: true
    }
  },
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
  // Stats for analytics
  stats: {
    viewCount: {
      type: Number,
      min: 0,
      default: 0
    },
    salesCount: {
      type: Number,
      min: 0,
      default: 0
    },
    wishlistCount: {
      type: Number,
      min: 0,
      default: 0
    },
    lastSoldAt: Date
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
      return ret;
    }
  },
  toObject: { 
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes for performance
productSchema.index({ categoryId: 1 });
productSchema.index({ pricingType: 1 });
productSchema.index({ status: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'weightPricing.price': 1 });
productSchema.index({ 'weightPricing.weight': 1 });
productSchema.index({ 'weightPricing.isAvailable': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ 'stats.viewCount': -1 });
productSchema.index({ 'stats.salesCount': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ publishedAt: -1 });

// Promotion and discount indexes
productSchema.index({ 'promotion.isActive': 1 });
productSchema.index({ 'promotion.startDate': 1, 'promotion.endDate': 1 });
productSchema.index({ 'weightPricing.discount.isActive': 1 });
productSchema.index({ 'weightPricing.discount.startDate': 1, 'weightPricing.discount.endDate': 1 });

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
productSchema.index({ pricingType: 1, status: 1, isActive: 1 });

// Virtual fields
productSchema.virtual('isInStock').get(function() {
  if (this.pricingType === 'fixed') {
    return this.stockQuantity > 0;
  }
  // For weight-based, check if any weight option has stock
  return this.weightPricing.some(option => option.isAvailable && option.stockQuantity > 0);
});

productSchema.virtual('isLowStock').get(function() {
  if (this.pricingType === 'fixed') {
    return this.stockQuantity > 0 && this.stockQuantity <= this.lowStockThreshold;
  }
  // For weight-based, check if any available option is low stock
  return this.weightPricing.some(option => 
    option.isAvailable && 
    option.stockQuantity > 0 && 
    option.stockQuantity <= this.lowStockThreshold
  );
});

productSchema.virtual('priceRange').get(function() {
  if (this.pricingType === 'fixed') {
    return {
      min: this.price,
      max: this.price
    };
  }
  
  const availableOptions = this.weightPricing.filter(option => option.isAvailable);
  if (availableOptions.length === 0) {
    return { min: 0, max: 0 };
  }
  
  const prices = availableOptions.map(option => option.price);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
});

productSchema.virtual('defaultWeightOption').get(function() {
  if (this.pricingType !== 'weight-based') {
    return null;
  }
  
  const defaultOption = this.weightPricing.find(option => option.isDefault && option.isAvailable);
  return defaultOption || this.weightPricing.find(option => option.isAvailable);
});

productSchema.virtual('discountPercentage').get(function() {
  // Check for product-level promotion first
  if (this.promotion && this.promotion.isActive && 
      new Date() >= this.promotion.startDate && 
      new Date() <= this.promotion.endDate) {
    return this.promotion.discountPercentage || 0;
  }
  
  // Check weight-based discounts
  if (this.pricingType === 'weight-based') {
    const defaultOption = this.defaultWeightOption;
    if (defaultOption && defaultOption.discount && defaultOption.discount.isActive &&
        new Date() >= defaultOption.discount.startDate &&
        new Date() <= defaultOption.discount.endDate) {
      return defaultOption.discount.percentage || 0;
    }
  }
  
  return 0;
});

productSchema.virtual('hasActivePromotion').get(function() {
  return this.discountPercentage > 0;
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
  
  // Validate weight pricing
  if (this.pricingType === 'weight-based') {
    if (!this.weightPricing || this.weightPricing.length === 0) {
      return next(new Error('Weight-based products must have at least one weight option'));
    }
    
    // Ensure only one default option
    const defaultOptions = this.weightPricing.filter(option => option.isDefault);
    if (defaultOptions.length === 0) {
      // Set first available as default
      const firstAvailable = this.weightPricing.find(option => option.isAvailable);
      if (firstAvailable) {
        firstAvailable.isDefault = true;
      }
    } else if (defaultOptions.length > 1) {
      // Keep only first default, remove others
      let foundDefault = false;
      this.weightPricing.forEach(option => {
        if (option.isDefault && foundDefault) {
          option.isDefault = false;
        } else if (option.isDefault) {
          foundDefault = true;
        }
      });
    }
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
  this.stats.viewCount += 1;
  return this.save();
};

// New methods for discount system
productSchema.methods.getDiscountedPrice = function(weight = null) {
  const originalPrice = this.getPrice(weight);
  if (!originalPrice) return null;
  
  const discountPercentage = this.getDiscountPercentage(weight);
  if (discountPercentage > 0) {
    return originalPrice * (1 - discountPercentage / 100);
  }
  
  return originalPrice;
};

productSchema.methods.getDiscountPercentage = function(weight = null) {
  // Check product-level promotion first
  if (this.promotion && this.promotion.isActive && 
      new Date() >= this.promotion.startDate && 
      new Date() <= this.promotion.endDate) {
    return this.promotion.discountPercentage || 0;
  }
  
  // Check weight-specific discount
  if (this.pricingType === 'weight-based' && weight) {
    const option = this.weightPricing.find(opt => opt.weight === weight && opt.isAvailable);
    if (option && option.discount && option.discount.isActive &&
        new Date() >= option.discount.startDate &&
        new Date() <= option.discount.endDate) {
      return option.discount.percentage || 0;
    }
  }
  
  return 0;
};

productSchema.methods.setPromotion = function(promotionData) {
  this.promotion = {
    title: promotionData.title,
    description: promotionData.description,
    discountPercentage: promotionData.discountPercentage,
    startDate: promotionData.startDate,
    endDate: promotionData.endDate,
    isActive: promotionData.isActive || true
  };
  return this.save();
};

productSchema.methods.removePromotion = function() {
  this.promotion = {
    isActive: false
  };
  return this.save();
};

productSchema.methods.setWeightDiscount = function(weight, discountData) {
  if (this.pricingType !== 'weight-based') {
    throw new Error('Cannot set weight discount on non-weight-based product');
  }
  
  const option = this.weightPricing.find(opt => opt.weight === weight);
  if (!option) {
    throw new Error('Weight option not found');
  }
  
  option.discount = {
    percentage: discountData.percentage,
    startDate: discountData.startDate,
    endDate: discountData.endDate,
    isActive: discountData.isActive || true
  };
  
  return this.save();
};

productSchema.methods.updateStock = function(quantity, weight = null) {
  if (this.pricingType === 'fixed') {
    this.stockQuantity = Math.max(0, this.stockQuantity + quantity);
  } else if (this.pricingType === 'weight-based' && weight) {
    const option = this.weightPricing.find(opt => opt.weight === weight);
    if (option) {
      option.stockQuantity = Math.max(0, option.stockQuantity + quantity);
    }
  }
  return this.save();
};

productSchema.methods.getPrice = function(weight = null) {
  if (this.pricingType === 'fixed') {
    return this.price;
  }
  
  if (this.pricingType === 'weight-based') {
    if (weight) {
      const option = this.weightPricing.find(opt => opt.weight === weight && opt.isAvailable);
      return option ? option.price : null;
    }
    // Return default option price
    const defaultOption = this.defaultWeightOption;
    return defaultOption ? defaultOption.price : null;
  }
  
  return null;
};

productSchema.methods.getStock = function(weight = null) {
  if (this.pricingType === 'fixed') {
    return this.stockQuantity;
  }
  
  if (this.pricingType === 'weight-based' && weight) {
    const option = this.weightPricing.find(opt => opt.weight === weight && opt.isAvailable);
    return option ? option.stockQuantity : 0;
  }
  
  return 0;
};

productSchema.methods.addWeightOption = function(weightOption) {
  if (this.pricingType !== 'weight-based') {
    throw new Error('Cannot add weight option to non-weight-based product');
  }
  
  // Check if weight already exists
  const existingOption = this.weightPricing.find(opt => opt.weight === weightOption.weight);
  if (existingOption) {
    throw new Error('Weight option already exists');
  }
  
  this.weightPricing.push(weightOption);
  return this.save();
};

productSchema.methods.removeWeightOption = function(weight) {
  if (this.pricingType !== 'weight-based') {
    throw new Error('Cannot remove weight option from non-weight-based product');
  }
  
  this.weightPricing = this.weightPricing.filter(opt => opt.weight !== weight);
  
  // Ensure at least one option remains
  if (this.weightPricing.length === 0) {
    throw new Error('Cannot remove last weight option');
  }
  
  // Reset default if removed option was default
  const hasDefault = this.weightPricing.some(opt => opt.isDefault);
  if (!hasDefault && this.weightPricing.length > 0) {
    this.weightPricing[0].isDefault = true;
  }
  
  return this.save();
};

module.exports = mongoose.model('Product', productSchema);
