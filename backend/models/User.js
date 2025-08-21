const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: String,
  firstName: String,
  lastName: String,
  displayName: String,
  phone: String,
  avatar: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  role: { type: String, enum: ['customer'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  
  // Social login
  providers: {
    facebook: {
      id: String,
      accessToken: String
    },
    google: {
      id: String,
      accessToken: String
    }
  },
  
  // Address information
  addresses: [{
    _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
    type: { type: String, enum: ['billing', 'shipping', 'both'], default: 'both' },
    firstName: String,
    lastName: String,
    company: String,
    address1: String,
    address2: String,
    city: String,
    province: String,
    postalCode: String,
    country: { type: String, default: 'VN' },
    phone: String,
    isDefault: { type: Boolean, default: false }
  }],
  
  // Preferences
  preferences: {
    language: { type: String, default: 'vi' },
    currency: { type: String, default: 'VND' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      promotions: { type: Boolean, default: true }
    }
  },
  
  // Statistics
  stats: {
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    averageOrderValue: { type: Number, default: 0 },
    lastOrderDate: Date,
    lastLoginDate: Date
  },
  
  // Metadata
  metadata: {
    source: String,
    utmSource: String,
    utmMedium: String,
    utmCampaign: String,
    referrer: String,
    ipAddress: String,
    userAgent: String
  },
  
  // Security
  security: {
    lastPasswordChange: Date,
    loginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    twoFactorEnabled: { type: Boolean, default: false }
  },
  
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  _id: false
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });
userSchema.index({ 'providers.facebook.id': 1 });
userSchema.index({ 'providers.google.id': 1 });
userSchema.index({ lastActivityAt: -1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.displayName || `${this.firstName || ''} ${this.lastName || ''}`.trim();
});

// Methods
userSchema.methods.getDefaultAddress = function() {
  return this.addresses.find(addr => addr.isDefault) || this.addresses[0];
};

userSchema.methods.updateStats = function(orderValue) {
  this.stats.totalOrders += 1;
  this.stats.totalSpent += orderValue;
  this.stats.averageOrderValue = this.stats.totalSpent / this.stats.totalOrders;
  this.stats.lastOrderDate = new Date();
};

module.exports = mongoose.model('User', userSchema);
