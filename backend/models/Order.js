const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true },
  customerId: { type: String, ref: 'User', required: true },
  customerInfo: {
    email: String,
    firstName: String,
    lastName: String,
    phone: String
  },
  
  // Order items
  items: [{
    productId: { type: String, ref: 'Product', required: true },
    productName: String,
    productNameVi: String,
    sku: String,
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    subtotal: { type: Number, required: true },
    image: String,
    variant: {
      size: String,
      weight: String,
      roastLevel: String
    }
  }],
  
  // Pricing
  subtotal: { type: Number, required: true },
  shippingFee: { type: Number, default: 0 },
  taxAmount: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Addresses
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
  
  // Shipping
  shipping: {
    method: String,
    methodName: String,
    cost: Number,
    estimatedDelivery: Date,
    trackingNumber: String,
    carrier: String
  },
  
  // Payment
  payment: {
    method: { type: String, required: true },
    methodName: String,
    status: { 
      type: String, 
      enum: ['pending', 'paid', 'failed', 'refunded', 'partially_refunded'],
      default: 'pending'
    },
    transactionId: String,
    paymentId: String,
    paidAt: Date,
    currency: { type: String, default: 'VND' },
    exchangeRate: { type: Number, default: 1 },
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  
  // Order status and tracking
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
    default: 'pending'
  },
  
  fulfillmentStatus: {
    type: String,
    enum: ['unfulfilled', 'partial', 'fulfilled'],
    default: 'unfulfilled'
  },
  
  // Timeline
  timeline: [{
    status: String,
    note: String,
    timestamp: { type: Date, default: Date.now },
    updatedBy: String
  }],
  
  // Additional information
  notes: String,
  customerNotes: String,
  internalNotes: String,
  tags: [String],
  
  // Cancellation
  cancellation: {
    reason: String,
    cancelledAt: Date,
    cancelledBy: String,
    refundAmount: Number,
    refundedAt: Date
  },
  
  // Metadata
  source: String,
  channel: { type: String, default: 'website' },
  utmSource: String,
  utmMedium: String,
  utmCampaign: String,
  
  // Dates
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date
}, {
  timestamps: true
});

// Indexes
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ customerId: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'customerInfo.email': 1 });

// Methods
orderSchema.methods.addTimelineEntry = function(status, note, updatedBy) {
  this.timeline.push({
    status,
    note,
    updatedBy,
    timestamp: new Date()
  });
};

orderSchema.methods.updateStatus = function(status, note, updatedBy) {
  this.status = status;
  this.addTimelineEntry(status, note, updatedBy);
  
  // Update specific date fields
  const now = new Date();
  switch (status) {
    case 'confirmed':
      this.confirmedAt = now;
      break;
    case 'shipped':
      this.shippedAt = now;
      this.fulfillmentStatus = 'fulfilled';
      break;
    case 'delivered':
      this.deliveredAt = now;
      break;
  }
};

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);
  this.total = this.subtotal + this.shippingFee + this.taxAmount - this.discountAmount;
};

// Statics
orderSchema.statics.generateOrderNumber = function() {
  return `BC${Date.now()}`;
};

module.exports = mongoose.model('Order', orderSchema);
