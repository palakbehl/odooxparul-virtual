const Post = require('../models/Post');
const User = require('../models/User');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const Like = require('../models/Like');
const Save = require('../models/Save');
const Follower = require('../models/Follower');
const Comment = require('../models/Comment');
const Hashtag = require('../models/Hashtag');

// Helper to extract hashtags from text
const extractHashtags = (text) => {
  const tags = text.match(/#[\w]+/g) || [];
  return tags.map(tag => tag.toLowerCase().substring(1));
};

exports.createPost = async (req, res) => {
  try {
    const { title, description, images, tripId, visibility } = req.body;
    
    const tags = extractHashtags(description + ' ' + title);
    
    let destinations = [];
    if (tripId) {
      const trip = await Trip.findById(tripId);
      if (trip) {
        destinations = trip.destinations.map(d => ({ name: d.name, country: d.country }));
        if (visibility === 'public') {
          trip.isPublic = true;
          await trip.save();
        }
      }
    }

    const post = await Post.create({
      userId: req.user._id,
      title,
      description,
      images: images || [],
      tripId,
      hashtags: tags,
      destinations,
      visibility: visibility || 'public'
    });

    // Update hashtags count
    for (const tag of tags) {
      await Hashtag.findOneAndUpdate(
        { name: tag },
        { $inc: { postCount: 1 } },
        { upsert: true }
      );
    }

    // Populate user for return
    const populatedPost = await Post.findById(post._id).populate('userId', 'firstName lastName profileImage');
    res.status(201).json({ success: true, post: populatedPost });
  } catch (e) {
    console.error('Create post error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, hashtag, city } = req.query;
    const query = { visibility: 'public' };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { hashtags: { $in: [search.replace('#', '').toLowerCase()] } }
      ];
    }
    
    if (hashtag) {
      query.hashtags = hashtag.replace('#', '').toLowerCase();
    }

    if (city) {
      query['destinations.name'] = { $regex: city, $options: 'i' };
    }

    const posts = await Post.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(+limit)
      .populate('userId', 'firstName lastName profileImage')
      .populate('tripId', 'title startDate endDate duration budget');

    const total = await Post.countDocuments(query);
    res.json({ success: true, posts, total, pages: Math.ceil(total / limit) });
  } catch (e) {
    console.error('Get feed error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('userId', 'firstName lastName profileImage')
      .populate('tripId');
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    
    // Increment views
    post.viewsCount += 1;
    await post.save();

    // Fetch comments
    const comments = await Comment.find({ postId: post._id })
      .populate('userId', 'firstName lastName profileImage')
      .sort('-createdAt');

    res.json({ success: true, post, comments });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.likePost = async (req, res) => {
  try {
    const { id } = req.params;
    const existingLike = await Like.findOne({ userId: req.user._id, postId: id });
    const post = await Post.findById(id);

    if (existingLike) {
      await existingLike.deleteOne();
      post.likesCount = Math.max(0, post.likesCount - 1);
      await post.save();
      res.json({ success: true, liked: false, likesCount: post.likesCount });
    } else {
      await Like.create({ userId: req.user._id, postId: id });
      post.likesCount += 1;
      await post.save();
      res.json({ success: true, liked: true, likesCount: post.likesCount });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.create({
      userId: req.user._id,
      postId: id,
      content
    });

    await Post.findByIdAndUpdate(id, { $inc: { commentsCount: 1 } });
    const populated = await Comment.findById(comment._id).populate('userId', 'firstName lastName profileImage');
    
    res.json({ success: true, comment: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    const existingSave = await Save.findOne({ userId: req.user._id, postId: id });

    if (existingSave) {
      await existingSave.deleteOne();
      post.savesCount = Math.max(0, post.savesCount - 1);
      await post.save();
      await User.findByIdAndUpdate(req.user._id, { $pull: { savedItineraries: post.tripId } });
      res.json({ success: true, saved: false, savesCount: post.savesCount });
    } else {
      await Save.create({ userId: req.user._id, postId: id, tripId: post.tripId });
      post.savesCount += 1;
      await post.save();
      if (post.tripId) {
        await User.findByIdAndUpdate(req.user._id, { $addToSet: { savedItineraries: post.tripId } });
      }
      res.json({ success: true, saved: true, savesCount: post.savesCount });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.followUser = async (req, res) => {
  try {
    const { targetId } = req.body;
    if (targetId === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

    const existingFollow = await Follower.findOne({ followerId: req.user._id, followingId: targetId });

    if (existingFollow) {
      await existingFollow.deleteOne();
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: -1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: -1 } });
      res.json({ success: true, following: false });
    } else {
      await Follower.create({ followerId: req.user._id, followingId: targetId });
      await User.findByIdAndUpdate(req.user._id, { $inc: { followingCount: 1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { followersCount: 1 } });
      res.json({ success: true, following: true });
    }
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.copyItinerary = async (req, res) => {
  try {
    const { tripId } = req.body;
    const sourceTrip = await Trip.findById(tripId).lean();
    if (!sourceTrip) return res.status(404).json({ success: false, message: 'Trip not found' });

    // Ensure it's public
    if (!sourceTrip.isPublic) return res.status(403).json({ success: false, message: 'This itinerary is not public' });

    // Copy Trip
    const newTripData = { ...sourceTrip };
    delete newTripData._id;
    delete newTripData.createdAt;
    delete newTripData.updatedAt;
    newTripData.user = req.user._id;
    newTripData.title = `Copy of ${sourceTrip.title}`;
    newTripData.isPublic = false; // Make the copy private by default
    newTripData.travelers = [{ user: req.user._id, role: 'owner' }];
    
    const newTrip = await Trip.create(newTripData);

    // Copy Itinerary Sections
    const sections = await Itinerary.find({ tripId: sourceTrip._id }).lean();
    for (const section of sections) {
      const newSectionData = { ...section };
      delete newSectionData._id;
      delete newSectionData.createdAt;
      delete newSectionData.updatedAt;
      newSectionData.tripId = newTrip._id;
      await Itinerary.create(newSectionData);
    }

    res.json({ success: true, message: 'Itinerary copied successfully!', tripId: newTrip._id });
  } catch (e) {
    console.error('Copy itinerary error:', e);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getTrending = async (req, res) => {
  try {
    const hashtags = await Hashtag.find().sort('-postCount').limit(10);
    
    // Top contributors
    const topUsers = await User.find({ role: 'user' }).sort('-followersCount').limit(5).select('firstName lastName profileImage followersCount');

    res.json({ success: true, hashtags, topUsers });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const posts = await Post.find({ userId: user._id, visibility: 'public' }).sort('-createdAt').populate('tripId');
    const trips = await Trip.find({ user: user._id, isPublic: true }).sort('-createdAt');

    // Check if current user follows them
    let isFollowing = false;
    if (req.user) {
      const follow = await Follower.findOne({ followerId: req.user._id, followingId: user._id });
      if (follow) isFollowing = true;
    }

    res.json({ success: true, user, posts, trips, isFollowing });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
