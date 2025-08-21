const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  title: { type: String, required: true },
  titleVi: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  excerpt: String,
  excerptVi: String,
  content: { type: String, required: true },
  contentVi: { type: String, required: true },
  
  // Media
  featuredImage: String,
  gallery: [String],
  
  // Categorization
  category: String,
  tags: [String],
  
  // Publishing
  status: { 
    type: String, 
    enum: ['draft', 'published', 'private', 'scheduled'],
    default: 'draft'
  },
  publishedAt: Date,
  scheduledAt: Date,
  
  // Author info
  author: {
    id: String,
    name: String,
    email: String,
    avatar: String
  },
  
  // SEO
  seo: {
    metaTitle: String,
    metaTitleVi: String,
    metaDescription: String,
    metaDescriptionVi: String,
    keywords: [String],
    canonicalUrl: String,
    focusKeyword: String,
    ogImage: String
  },
  
  // Social sharing
  social: {
    facebookShares: { type: Number, default: 0 },
    twitterShares: { type: Number, default: 0 },
    linkedinShares: { type: Number, default: 0 }
  },
  
  // Engagement
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  
  // Related content
  relatedPosts: [String],
  relatedProducts: [String],
  
  // Settings
  allowComments: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },
  sticky: { type: Boolean, default: false },
  
  // Reading time
  readingTime: { type: Number, default: 0 }, // in minutes
  wordCount: { type: Number, default: 0 },
  
  // Multilingual support
  language: { type: String, default: 'vi' },
  translations: [{
    language: String,
    title: String,
    content: String,
    slug: String
  }]
}, {
  timestamps: true,
  _id: false
});

// Indexes
blogSchema.index({ slug: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ category: 1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ featured: 1 });
blogSchema.index({ author: 1 });

// Text search index
blogSchema.index({
  title: 'text',
  titleVi: 'text',
  content: 'text',
  contentVi: 'text',
  excerpt: 'text',
  excerptVi: 'text',
  tags: 'text'
});

// Virtual for URL
blogSchema.virtual('url').get(function() {
  return `/blog/${this.slug}`;
});

// Methods
blogSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

blogSchema.methods.calculateReadingTime = function() {
  const wordsPerMinute = 200;
  const textContent = this.content + ' ' + this.contentVi;
  const wordCount = textContent.split(/\s+/).length;
  this.wordCount = wordCount;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readingTime;
};

blogSchema.methods.updateSocialShares = function(platform, count) {
  if (this.social[`${platform}Shares`] !== undefined) {
    this.social[`${platform}Shares`] = count;
  }
};

// Statics
blogSchema.statics.findPublished = function() {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

blogSchema.statics.findFeatured = function(limit = 5) {
  return this.find({
    status: 'published',
    featured: true,
    publishedAt: { $lte: new Date() }
  })
  .sort({ publishedAt: -1 })
  .limit(limit);
};

blogSchema.statics.findByCategory = function(category) {
  return this.find({
    status: 'published',
    category: category,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

blogSchema.statics.findByTag = function(tag) {
  return this.find({
    status: 'published',
    tags: tag,
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Auto-calculate reading time
  if (this.isModified('content') || this.isModified('contentVi')) {
    this.calculateReadingTime();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
