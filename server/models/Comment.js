const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }, // For nested comments
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ postId: 1, createdAt: 1 });
commentSchema.index({ parentId: 1 });

module.exports = mongoose.model('Comment', commentSchema);
