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
      item.productId === productId && 
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
  this.items = this.items.filter(item => 
    !(item.productId === productId && 
      JSON.stringify(item.variant) === JSON.stringify(variant))
  );
  
  this.updateTotals();
  this.lastActivity = new Date();
};

cartSchema.methods.updateItemQuantity = function(productId, quantity, variant = {}) {
  const item = this.items.find(item => 
    item.productId === productId && 
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
