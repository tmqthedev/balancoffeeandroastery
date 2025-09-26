const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  customerId: { type: String, ref: 'User' },
  sessionId: String,
  
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: Number,
    variant: {
      size: String,
      weight: String,
      roastLevel: String
    },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Totals
  itemCount: { type: Number, default: 0 },
  subtotal: { type: Number, default: 0 },
  
  // Metadata
  lastActivity: { type: Date, default: Date.now },
  ipAddress: String,
  userAgent: String,
  
  // Checkout info
  checkout: {
    step: { type: String, enum: ['cart', 'information', 'shipping', 'payment'], default: 'cart' },
    shippingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
      phone: String
    },
    billingAddress: {
      firstName: String,
      lastName: String,
      company: String,
      address1: String,
      address2: String,
      city: String,
      province: String,
      postalCode: String,
      country: String,
      phone: String
    },
    shippingMethod: String,
    paymentMethod: String
  }
}, {
  timestamps: true
});

// Indexes
cartSchema.index({ customerId: 1 });
cartSchema.index({ sessionId: 1 });
cartSchema.index({ lastActivity: -1 });

// Methods
cartSchema.methods.addItem = function(productId, quantity, price, variant = {}) {
  console.log('🛒 Cart Model: addItem called with:', { productId, quantity, price, variant });
  
  try {
    // Validate inputs
    if (!productId) {
      throw new Error('Product ID is required');
    }
    if (typeof quantity !== 'number' || quantity <= 0) {
      throw new Error('Quantity must be a positive number');
    }
    if (typeof price !== 'number' || price < 0) {
      throw new Error('Price must be a non-negative number');
    }
    
    console.log('✅ Cart Model: Input validation passed');
    
    const existingItem = this.items.find(item => 
      item.productId.equals(productId) && 
      JSON.stringify(item.variant) === JSON.stringify(variant)
    );
    
    console.log('🔍 Cart Model: Existing item found:', existingItem ? 'YES' : 'NO');
    
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.addedAt = new Date();
      console.log('➕ Cart Model: Updated existing item quantity to:', existingItem.quantity);
    } else {
      const newItem = {
        productId,
        quantity,
        price,
        variant,
        addedAt: new Date()
      };
      console.log('🆕 Cart Model: Creating new item:', newItem);
      this.items.push(newItem);
      console.log('🆕 Cart Model: Added new item to cart, total items:', this.items.length);
    }
    
    console.log('🔄 Cart Model: Updating totals...');
    this.updateTotals();
    this.lastActivity = new Date();
    console.log('✅ Cart Model: addItem completed successfully, itemCount:', this.itemCount, 'subtotal:', this.subtotal);
  } catch (error) {
    console.error('❌ Cart Model: addItem error:', error);
    console.error('❌ Cart Model: Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

cartSchema.methods.removeItem = function(productId, variant = {}) {
  console.log('🗑️ Cart Model: removeItem called with:', { productId, variant });
  
  try {
    // Handle null/undefined productId
    if (!productId) {
      console.error('❌ Cart Model: productId is null or undefined');
      throw new Error('Product ID is required');
    }
    
    // Convert productId to ObjectId if it's a string
    let targetProductId;
    if (typeof productId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(productId)) {
        console.error('❌ Cart Model: Invalid ObjectId format:', productId);
        throw new Error(`Invalid product ID format: ${productId}`);
      }
      targetProductId = new mongoose.Types.ObjectId(productId);
    } else if (productId instanceof mongoose.Types.ObjectId) {
      targetProductId = productId;
    } else {
      console.error('❌ Cart Model: productId is neither string nor ObjectId:', typeof productId, productId);
      throw new Error('Product ID must be a string or ObjectId');
    }
    
    console.log('🔄 Cart Model: Converted productId:', targetProductId);
    console.log('📦 Cart Model: Current cart items:', this.items.map(item => ({
      productId: item.productId,
      productIdType: typeof item.productId,
      isValidObjectId: item.productId instanceof mongoose.Types.ObjectId || mongoose.Types.ObjectId.isValid(item.productId)
    })));
    
    const initialCount = this.items.length;
    
    // Filter out items that match, but also filter out any invalid items
    this.items = this.items.filter(item => {
      try {
        // Check if item has valid productId
        if (!item.productId || 
            (!mongoose.Types.ObjectId.isValid(item.productId) && 
             !(item.productId instanceof mongoose.Types.ObjectId))) {
          console.warn('⚠️ Cart Model: Found invalid productId in cart item, removing:', item);
          return false; // Remove invalid items
        }
        
        // Ensure variant is an object - handle both missing variant field and empty objects
        const itemVariant = item.variant || {};
        const targetVariant = variant || {};
        
        // Normalize variants for comparison (sort keys to ensure consistent comparison)
        const normalizeVariant = (v) => {
          if (!v || typeof v !== 'object') return {};
          const sorted = {};
          Object.keys(v).sort().forEach(key => {
            if (v[key] !== undefined && v[key] !== null) {
              sorted[key] = v[key];
            }
          });
          return sorted;
        };
        
        const normalizedItemVariant = normalizeVariant(itemVariant);
        const normalizedTargetVariant = normalizeVariant(targetVariant);
        
        // For simple cases where both variants are empty objects, treat as matching
        const bothEmpty = Object.keys(normalizedItemVariant).length === 0 && 
                         Object.keys(normalizedTargetVariant).length === 0;
        
        console.log('🔍 Cart Model: Comparing variants:', {
          itemVariant: normalizedItemVariant,
          targetVariant: normalizedTargetVariant,
          itemVariantString: JSON.stringify(normalizedItemVariant),
          targetVariantString: JSON.stringify(normalizedTargetVariant),
          bothEmpty
        });
        
        // Check if this item matches the one to remove
        const productMatches = item.productId.equals(targetProductId);
        const variantMatches = bothEmpty || JSON.stringify(normalizedItemVariant) === JSON.stringify(normalizedTargetVariant);
        const matches = productMatches && variantMatches;
        
        console.log('🔍 Cart Model: Match check:', {
          productMatches,
          variantMatches,
          matches
        });
        
        if (matches) {
          console.log('🗑️ Cart Model: Removing matching item:', item);
        }
        
        return !matches; // Keep items that don't match
      } catch (filterError) {
        console.error('❌ Cart Model: Error filtering item:', filterError, item);
        return false; // Remove problematic items
      }
    });
    
    const removedCount = initialCount - this.items.length;
    console.log('🗑️ Cart Model: Removed', removedCount, 'items');
    
    // Ensure we have valid items array
    if (!Array.isArray(this.items)) {
      console.error('❌ Cart Model: Items is not an array after filtering');
      this.items = [];
    }
    
    this.updateTotals();
    this.lastActivity = new Date();
    
    console.log('✅ Cart Model: removeItem completed, remaining items:', this.items.length);
  } catch (error) {
    console.error('❌ Cart Model: removeItem error:', error);
    throw error;
  }
};

cartSchema.methods.updateItemQuantity = function(productId, quantity, variant = {}) {
  // Convert productId to ObjectId if it's a string
  const targetProductId = typeof productId === 'string' ? 
    new mongoose.Types.ObjectId(productId) : productId;
  
  const item = this.items.find(item => 
    item.productId.equals(targetProductId) && 
    JSON.stringify(item.variant) === JSON.stringify(variant)
  );
  
  if (item) {
    if (quantity <= 0) {
      this.removeItem(productId, variant);
    } else {
      item.quantity = quantity;
      item.addedAt = new Date();
      this.updateTotals();
      this.lastActivity = new Date();
    }
  }
};

cartSchema.methods.updateTotals = function() {
  this.itemCount = this.items.reduce((total, item) => total + item.quantity, 0);
  this.subtotal = this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

cartSchema.methods.clear = function() {
  this.items = [];
  this.itemCount = 0;
  this.subtotal = 0;
  this.lastActivity = new Date();
};

// Statics
cartSchema.statics.findByUser = function(customerId) {
  return this.findOne({ customerId });
};

cartSchema.statics.findBySession = function(sessionId) {
  return this.findOne({ sessionId });
};

cartSchema.statics.cleanupExpired = function(daysOld = 7) {
  const expiredDate = new Date();
  expiredDate.setDate(expiredDate.getDate() - daysOld);
  
  return this.deleteMany({
    lastActivity: { $lt: expiredDate },
    customerId: { $exists: false }
  });
};

module.exports = mongoose.model('Cart', cartSchema);
