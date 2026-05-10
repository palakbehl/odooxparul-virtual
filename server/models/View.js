const mongoose = require('mongoose');

const viewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional, null if anonymous
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('View', viewSchema);
