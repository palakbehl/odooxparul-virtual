const mongoose = require('mongoose');

const likedTripSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  likedAt: { type: Date, default: Date.now }
});

likedTripSchema.index({ userId: 1, tripId: 1 }, { unique: true });

module.exports = mongoose.model('LikedTrip', likedTripSchema);
