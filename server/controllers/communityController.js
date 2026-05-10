const CommunityPost = require('../models/CommunityPost');

exports.createPost = async (req, res) => {
  try { const post = await CommunityPost.create({ ...req.body, user: req.user._id }); res.status(201).json({ success: true, post }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const query = { isPublic: true };
    if (search) query.$or = [{ title: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }];
    const posts = await CommunityPost.find(query).sort('-createdAt').skip((page - 1) * limit).limit(+limit)
      .populate('user', 'firstName lastName profileImage').populate('comments.user', 'firstName lastName profileImage');
    const total = await CommunityPost.countDocuments(query);
    res.json({ success: true, posts, total, pages: Math.ceil(total / limit) });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.likePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    const idx = post.likes.indexOf(req.user._id);
    if (idx > -1) post.likes.splice(idx, 1); else post.likes.push(req.user._id);
    await post.save();
    res.json({ success: true, likes: post.likes.length, liked: idx === -1 });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.addComment = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    post.comments.push({ user: req.user._id, content: req.body.content });
    await post.save();
    const updated = await CommunityPost.findById(req.params.id).populate('comments.user', 'firstName lastName profileImage');
    res.json({ success: true, comments: updated.comments });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.savePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    const idx = post.savedBy.indexOf(req.user._id);
    if (idx > -1) post.savedBy.splice(idx, 1); else post.savedBy.push(req.user._id);
    await post.save();
    res.json({ success: true, saved: idx === -1 });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await CommunityPost.findById(req.params.id);
    if (post.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    await post.deleteOne();
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
