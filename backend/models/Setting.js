const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  category: { type: String, required: true },
  key: { type: String, required: true },
  value: mongoose.Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'object', 'array'],
    default: 'string'
  },
  description: String,
  descriptionVi: String,
  isPublic: { type: Boolean, default: false },
  isEditable: { type: Boolean, default: true },
  validationRules: {
    required: { type: Boolean, default: false },
    min: Number,
    max: Number,
    pattern: String,
    enum: [String]
  }
}, {
  timestamps: true,
  _id: false
});

// Indexes
settingSchema.index({ category: 1, key: 1 }, { unique: true });
settingSchema.index({ isPublic: 1 });

// Statics
settingSchema.statics.get = function(key, defaultValue = null) {
  return this.findOne({ key }).then(setting => {
    return setting ? setting.value : defaultValue;
  });
};

settingSchema.statics.set = function(key, value, category = 'general') {
  return this.findOneAndUpdate(
    { key },
    { key, value, category },
    { upsert: true, new: true }
  );
};

settingSchema.statics.getByCategory = function(category) {
  return this.find({ category });
};

settingSchema.statics.getPublic = function() {
  return this.find({ isPublic: true });
};

module.exports = mongoose.model('Setting', settingSchema);

// Shipping Zone Schema
const shippingZoneSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  nameVi: { type: String, required: true },
  description: String,
  descriptionVi: String,
  
  // Geographic coverage
  countries: [String],
  provinces: [String],
  cities: [String],
  postalCodes: [String],
  
  // Shipping methods
  methods: [{
    id: String,
    name: String,
    nameVi: String,
    description: String,
    descriptionVi: String,
    type: {
      type: String,
      enum: ['flat_rate', 'free_shipping', 'weight_based', 'price_based'],
      default: 'flat_rate'
    },
    cost: Number,
    minOrder: Number,
    maxWeight: Number,
    estimatedDays: {
      min: Number,
      max: Number
    },
    isActive: { type: Boolean, default: true }
  }],
  
  // Settings
  isActive: { type: Boolean, default: true },
  priority: { type: Number, default: 0 },
  
  // Restrictions
  restrictions: {
    minOrderValue: Number,
    maxOrderValue: Number,
    maxWeight: Number,
    maxDimensions: {
      length: Number,
      width: Number,
      height: Number
    },
    excludedProductTypes: [String],
    excludedProducts: [String]
  }
}, {
  timestamps: true,
  _id: false
});

// Indexes
shippingZoneSchema.index({ isActive: 1, priority: 1 });
shippingZoneSchema.index({ countries: 1 });
shippingZoneSchema.index({ provinces: 1 });

module.exports.ShippingZone = mongoose.model('ShippingZone', shippingZoneSchema);
