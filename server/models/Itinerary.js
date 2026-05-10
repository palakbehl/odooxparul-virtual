// ==========================================
// Itinerary Model - Traveloop
// ==========================================

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  activityName: { type: String, required: true },
  category: { type: String, default: 'general' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  estimatedPrice: { type: Number, default: 0 },
  duration: { type: String, default: '' },
  time: { type: String, default: '' },
  notes: { type: String, default: '' },
  completed: { type: Boolean, default: false }
});

const itinerarySchema = new mongoose.Schema({
  tripId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip',
    required: true
  },
  cityName: {
    type: String,
    required: [true, 'City name is required']
  },
  country: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  description: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  activities: [activitySchema],
  estimatedCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  order: { type: Number, default: 0 }
}, {
  timestamps: true
});

itinerarySchema.index({ tripId: 1, order: 1 });

module.exports = mongoose.model('Itinerary', itinerarySchema);
