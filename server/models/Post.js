const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  images: [{ type: String }],
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  hashtags: [{ type: String }],
  destinations: [{
    name: String,
    country: String
  }],
  visibility: { type: String, enum: ['public', 'friends', 'private'], default: 'public' },
  likesCount: { type: Number, default: 0 },
  commentsCount: { type: Number, default: 0 },
  savesCount: { type: Number, default: 0 },
  viewsCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

postSchema.index({ createdAt: -1 });
postSchema.index({ userId: 1 });
postSchema.index({ visibility: 1 });

module.exports = mongoose.model('Post', postSchema);
