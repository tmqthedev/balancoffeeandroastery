const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  nameVi: { type: String, required: true },
  slug: { type: String, required: true },
  description: String,
  descriptionVi: String,
  image: String,
  icon: String,
  parentId: String,
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  metaTitle: String,
  metaTitleVi: String,
  metaDescription: String,
  metaDescriptionVi: String,
  keywords: [String]
}, {
  timestamps: true,
  _id: false
});

categorySchema.index({ slug: 1 });
categorySchema.index({ parentId: 1 });
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
