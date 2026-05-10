const mongoose = require('mongoose');

const savedTripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  savedAt: { type: Date, default: Date.now }
});

savedTripSchema.index({ userId: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.model('SavedTrip', savedTripSchema);
