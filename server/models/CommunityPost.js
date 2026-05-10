const mongoose = require('mongoose');
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const postSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  images: [{ type: String }],
  tags: [{ type: String }],
  linkedTrip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip' },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  savedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [commentSchema],
  isPublic: { type: Boolean, default: true }
}, { timestamps: true });
postSchema.index({ createdAt: -1 });
postSchema.index({ user: 1 });
module.exports = mongoose.model('CommunityPost', postSchema);
