const mongoose = require('mongoose');

// This could represent an index of public trips for the community
const publicTripSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likesCount: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
  copiesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

publicTripSchema.index({ likesCount: -1 });
publicTripSchema.index({ savesCount: -1 });
publicTripSchema.index({ viewsCount: -1 });

module.exports = mongoose.model('PublicTrip', publicTripSchema);
