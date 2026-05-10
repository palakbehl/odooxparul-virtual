// ==========================================
// Destination Model - Traveloop
// ==========================================

const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Destination name is required'],
    trim: true
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  image: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 4.5
  },
  category: {
    type: String,
    enum: ['popular', 'trending', 'hidden-gem', 'budget', 'luxury'],
    default: 'popular'
  },
  tags: [{ type: String }],
  averageBudget: {
    type: Number,
    default: 0
  },
  bestTimeToVisit: {
    type: String,
    default: ''
  },
  highlights: [{ type: String }],
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  }
}, {
  timestamps: true
});

destinationSchema.index({ category: 1 });
destinationSchema.index({ name: 'text', country: 'text' });

module.exports = mongoose.model('Destination', destinationSchema);
