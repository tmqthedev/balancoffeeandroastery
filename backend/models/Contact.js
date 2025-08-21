const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  subject: { type: String, required: true },
  message: { type: String, required: true },
  
  // Customer info
  customerId: { type: String, ref: 'User' },
  
  // Contact type
  type: {
    type: String,
    enum: ['inquiry', 'support', 'complaint', 'feedback', 'business', 'other'],
    default: 'inquiry'
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['new', 'in_progress', 'resolved', 'closed'],
    default: 'new'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Assignment
  assignedTo: {
    id: String,
    name: String,
    email: String
  },
  
  // Response tracking
  responses: [{
    respondedBy: {
      id: String,
      name: String,
      email: String
    },
    message: String,
    responseDate: { type: Date, default: Date.now },
    isInternal: { type: Boolean, default: false }
  }],
  
  // Resolution
  resolution: {
    resolvedBy: {
      id: String,
      name: String,
      email: String
    },
    resolvedAt: Date,
    resolutionNote: String,
    satisfactionRating: {
      type: Number,
      min: 1,
      max: 5
    },
    customerFeedback: String
  },
  
  // Metadata
  source: { type: String, default: 'website' },
  ipAddress: String,
  userAgent: String,
  referrer: String,
  
  // Tags and categorization
  tags: [String],
  department: String,
  
  // Follow-up
  followUpRequired: { type: Boolean, default: false },
  followUpDate: Date,
  followUpNote: String,
  
  // Internal notes
  internalNotes: [{
    note: String,
    addedBy: {
      id: String,
      name: String
    },
    addedAt: { type: Date, default: Date.now }
  }],
  
  // Email tracking
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  autoReplyId: String,
  
  // GDPR compliance
  consentToContact: { type: Boolean, default: true },
  dataRetentionDate: Date
}, {
  timestamps: true
});

// Indexes
contactSchema.index({ email: 1 });
contactSchema.index({ status: 1 });
contactSchema.index({ type: 1 });
contactSchema.index({ priority: 1 });
contactSchema.index({ createdAt: -1 });
contactSchema.index({ customerId: 1 });
contactSchema.index({ 'assignedTo.id': 1 });

// Text search
contactSchema.index({
  name: 'text',
  email: 'text',
  subject: 'text',
  message: 'text'
});

// Methods
contactSchema.methods.addResponse = function(respondedBy, message, isInternal = false) {
  this.responses.push({
    respondedBy,
    message,
    isInternal,
    responseDate: new Date()
  });
  
  if (!isInternal && this.status === 'new') {
    this.status = 'in_progress';
  }
};

contactSchema.methods.addInternalNote = function(note, addedBy) {
  this.internalNotes.push({
    note,
    addedBy,
    addedAt: new Date()
  });
};

contactSchema.methods.resolve = function(resolvedBy, resolutionNote) {
  this.status = 'resolved';
  this.resolution = {
    resolvedBy,
    resolvedAt: new Date(),
    resolutionNote
  };
};

contactSchema.methods.close = function() {
  this.status = 'closed';
};

contactSchema.methods.assignTo = function(assignedTo) {
  this.assignedTo = assignedTo;
  if (this.status === 'new') {
    this.status = 'in_progress';
  }
};

// Statics
contactSchema.statics.findByStatus = function(status) {
  return this.find({ status }).sort({ createdAt: -1 });
};

contactSchema.statics.findByPriority = function(priority) {
  return this.find({ priority }).sort({ createdAt: -1 });
};

contactSchema.statics.findUnassigned = function() {
  return this.find({
    'assignedTo.id': { $exists: false },
    status: { $in: ['new', 'in_progress'] }
  }).sort({ priority: -1, createdAt: 1 });
};

contactSchema.statics.findOverdue = function() {
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  return this.find({
    status: { $in: ['new', 'in_progress'] },
    createdAt: { $lt: twoDaysAgo }
  }).sort({ createdAt: 1 });
};

// Pre-save middleware
contactSchema.pre('save', function(next) {
  // Set data retention date (2 years from creation)
  if (this.isNew && !this.dataRetentionDate) {
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + 2);
    this.dataRetentionDate = retentionDate;
  }
  
  next();
});

module.exports = mongoose.model('Contact', contactSchema);
