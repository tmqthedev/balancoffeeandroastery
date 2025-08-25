const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: false },
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  displayName: { type: String, required: false },
  phone: { type: String, required: false },
  avatar: { type: String, required: false },
  dateOfBirth: { type: Date, required: false },
  gender: { type: String, enum: ['male', 'female', 'other'], required: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  
  // Social login
  providers: {
    facebook: {
      id: { type: String, required: false },
      accessToken: { type: String, required: false }
    },
    google: {
      id: { type: String, required: false },
      accessToken: { type: String, required: false }
    }
  },
  
  // Address information  
  addresses: {
    type: [{
      _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
      type: { type: String, enum: ['billing', 'shipping', 'both'], default: 'both' },
      firstName: { type: String, required: false },
      lastName: { type: String, required: false },
      company: { type: String, required: false },
      address1: { type: String, required: false },
      address2: { type: String, required: false },
      street: { type: String, required: false }, // New Vietnamese address format
      wardCommune: { type: String, required: false }, // Phường/Xã
      district: { type: String, required: false }, // Quận/Huyện
      city: { type: String, required: false }, // Legacy support
      province: { type: String, required: false },
      postalCode: { type: String, required: false },
      country: { type: String, default: 'VN' },
      phone: { type: String, required: false },
      isDefault: { type: Boolean, default: false }
    }],
    default: []
  },
  
  // Preferences
  preferences: {
    type: {
      language: { type: String, default: 'vi' },
      currency: { type: String, default: 'VND' },
      notifications: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        promotions: { type: Boolean, default: true }
      }
    },
    default: function() {
      return {
        language: 'vi',
        currency: 'VND',
        notifications: {
          email: true,
          sms: false,
          promotions: true
        }
      };
    }
  },
  
  // Statistics
  stats: {
    type: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      averageOrderValue: { type: Number, default: 0 },
      lastOrderDate: { type: Date, required: false },
      lastLoginDate: { type: Date, required: false }
    },
    default: function() {
      return {
        totalOrders: 0,
        totalSpent: 0,
        averageOrderValue: 0
      };
    }
  },
  
  // Metadata
  metadata: {
    type: {
      source: { type: String, required: false },
      utmSource: { type: String, required: false },
      utmMedium: { type: String, required: false },
      utmCampaign: { type: String, required: false },
      referrer: { type: String, required: false },
      ipAddress: { type: String, required: false },
      userAgent: { type: String, required: false }
    },
    default: {}
  },
  
  // Security
  security: {
    type: {
      lastPasswordChange: { type: Date, required: false },
      loginAttempts: { type: Number, default: 0 },
      lockedUntil: { type: Date, required: false },
      twoFactorEnabled: { type: Boolean, default: false }
    },
    default: function() {
      return {
        loginAttempts: 0,
        twoFactorEnabled: false
      };
    }
  },
  
  // Password reset
  resetPasswordToken: { type: String, required: false },
  resetPasswordExpires: { type: Date, required: false },
  
  lastActivityAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  _id: false,
  minimize: false,
  strict: false
});

// Indexes
// userSchema.index({ email: 1 }); // Already unique in schema definition
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
