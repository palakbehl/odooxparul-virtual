const mongoose = require('mongoose');

const saveSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  createdAt: { type: Date, default: Date.now }
});

saveSchema.index({ userId: 1, postId: 1 });
saveSchema.index({ userId: 1, tripId: 1 });

module.exports = mongoose.model('Save', saveSchema);
