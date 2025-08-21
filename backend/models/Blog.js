const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true,
    trim: true
  },
  slug: { 
    type: String, 
    required: true,
    match: /^[a-z0-9-]+$/
  },
  excerpt: {
    type: String,
    trim: true
  },
  content: { 
    type: String, 
    required: true
  },
  
  // Media
  featuredImage: String,
  gallery: [String],
  
  // Categorization
  category: {
    type: mongoose.Schema.Types.Mixed, // Allow both string and object
    default: 'Tin tức'
  },
  tags: [String],
  
  // Publishing
  status: { 
    type: String, 
    enum: ['draft', 'published', 'private'],
    default: 'published'
  },
  publishedAt: {
    type: Date,
    default: Date.now
  },
  
  // Author info
  author: {
    name: { type: String, default: 'Balan Coffee' },
    email: String,
    avatar: String
  },
  
  // Metrics
  viewCount: { type: Number, default: 0 },
  likeCount: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  
  // Reading time
  readingTime: { type: Number, default: 5 },
  wordCount: { type: Number, default: 0 },
  
  // SEO
  metaTitle: String,
  metaDescription: String,
  keywords: [String],
  
  // Social sharing
  social: {
    facebookShares: { type: Number, default: 0 },
    twitterShares: { type: Number, default: 0 }
  },
  
  // Flags
  featured: { type: Boolean, default: false },
  allowComments: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
blogSchema.index({ slug: 1 }, { unique: true });
blogSchema.index({ status: 1 });
blogSchema.index({ category: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ featured: 1 });

// Text index for search
blogSchema.index({
  title: 'text',
  content: 'text',
  excerpt: 'text',
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
  const wordCount = this.content.split(/\s+/).length;
  this.wordCount = wordCount;
  this.readingTime = Math.ceil(wordCount / wordsPerMinute);
  return this.readingTime;
};

// Static methods
blogSchema.statics.findPublished = function() {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() }
  }).sort({ publishedAt: -1 });
};

// Pre-save middleware
blogSchema.pre('save', function(next) {
  // Auto-calculate reading time
  if (this.isModified('content')) {
    this.calculateReadingTime();
  }
  
  // Set publishedAt when status changes to published
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

module.exports = mongoose.model('Blog', blogSchema);
