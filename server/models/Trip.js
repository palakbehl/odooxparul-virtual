// ==========================================
// Trip Model - Traveloop
// ==========================================

const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Trip title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: ''
  },
  coverImage: {
    type: String,
    default: ''
  },
  destinations: [{
    name: { type: String, required: true },
    country: { type: String, default: '' },
    lat: { type: Number },
    lng: { type: Number }
  }],
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  budget: {
    total: { type: Number, default: 0 },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  travelerCount: {
    type: Number,
    default: 1
  },
  tripType: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['draft', 'upcoming', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  travelers: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['owner', 'collaborator', 'viewer'], default: 'collaborator' }
  }],
  itinerary: [{
    day: { type: Number, required: true },
    date: { type: Date },
    title: { type: String, default: '' },
    activities: [{
      time: { type: String },
      title: { type: String, required: true },
      description: { type: String, default: '' },
      location: { type: String, default: '' },
      cost: { type: Number, default: 0 },
      completed: { type: Boolean, default: false }
    }]
  }],
  checklist: [{
    item: { type: String, required: true },
    checked: { type: Boolean, default: false },
    category: { type: String, default: 'general' }
  }],
  notes: [{
    title: { type: String, default: '' },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  tags: [{ type: String }],
  isPublic: {
    type: Boolean,
    default: false
  },
  shareId: {
    type: String,
    unique: true,
    sparse: true
  },
  publicViews: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  saves: { type: Number, default: 0 }
}, {
  timestamps: true
});

// Virtual for trip duration in days
tripSchema.virtual('duration').get(function() {
  if (this.startDate && this.endDate) {
    const diff = this.endDate - this.startDate;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for number of cities
tripSchema.virtual('cityCount').get(function() {
  return this.destinations ? this.destinations.length : 0;
});

// Ensure virtuals are included in JSON
tripSchema.set('toJSON', { virtuals: true });
tripSchema.set('toObject', { virtuals: true });

// Index for faster queries
tripSchema.index({ user: 1, status: 1 });
tripSchema.index({ startDate: 1 });

module.exports = mongoose.model('Trip', tripSchema);
