const mongoose = require('mongoose');

const hashtagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  postCount: { type: Number, default: 0 },
  tripCount: { type: Number, default: 0 }
});

hashtagSchema.index({ postCount: -1 });

module.exports = mongoose.model('Hashtag', hashtagSchema);
