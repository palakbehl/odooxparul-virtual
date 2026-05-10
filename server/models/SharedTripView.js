const mongoose = require('mongoose');

const sharedTripViewSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, for tracking authenticated views
  ipAddress: { type: String }, // Optional, for anonymous tracking
  viewedAt: { type: Date, default: Date.now }
});

sharedTripViewSchema.index({ tripId: 1 });

module.exports = mongoose.model('SharedTripView', sharedTripViewSchema);
