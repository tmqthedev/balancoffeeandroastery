const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  nameVi: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  descriptionVi: String,
  shortDescription: String,
  shortDescriptionVi: String,
  price: { type: Number, required: true },
  originalPrice: Number,
  costPrice: Number,
  sku: String,
  barcode: String,
  category: { type: String, ref: 'Category', required: true },
  type: { 
    type: String, 
    enum: ['coffee_beans', 'beverages', 'accessories', 'gift_sets'],
    required: true 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'active'
  },
  featured: { type: Boolean, default: false },
  images: [String],
  thumbnail: String,
  weight: String,
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    unit: { type: String, default: 'cm' }
  },
  inventory: {
    quantity: { type: Number, default: 0 },
    lowStockAlert: { type: Number, default: 10 },
    trackQuantity: { type: Boolean, default: true }
  },
  shipping: {
    weight: Number,
    requiresShipping: { type: Boolean, default: true },
    shippingClass: String
  },
  seo: {
    metaTitle: String,
    metaTitleVi: String,
    metaDescription: String,
    metaDescriptionVi: String,
    keywords: [String],
    canonicalUrl: String
  },
  attributes: {
    roastLevel: String,
    origin: String,
    processingMethod: String,
    flavorNotes: [String],
    brewingMethods: [String],
    caffeine: String,
    acidity: String,
    body: String,
    aroma: String
  },
  tags: [String],
  relatedProducts: [String],
  crossSells: [String],
  upSells: [String],
  viewCount: { type: Number, default: 0 },
  salesCount: { type: Number, default: 0 },
  taxable: { type: Boolean, default: true },
  taxClass: String
}, {
  timestamps: true,
  _id: false
});

// Indexes
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ type: 1 });
productSchema.index({ status: 1 });
productSchema.index({ featured: 1 });
productSchema.index({ price: 1 });
productSchema.index({ 'seo.keywords': 1 });
productSchema.index({ tags: 1 });
productSchema.index({ createdAt: -1 });

// Text search index
productSchema.index({
  name: 'text',
  nameVi: 'text',
  description: 'text',
  descriptionVi: 'text',
  'seo.keywords': 'text',
  tags: 'text'
});

module.exports = mongoose.model('Product', productSchema);
