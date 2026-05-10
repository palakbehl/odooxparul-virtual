const crypto = require('crypto');
const Trip = require('../models/Trip');
const Itinerary = require('../models/Itinerary');
const SavedTrip = require('../models/SavedTrip');
const LikedTrip = require('../models/LikedTrip');
const SharedTripView = require('../models/SharedTripView');

// Generate share ID for a trip
exports.generateShareLink = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.tripId, user: req.user._id });
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });

    if (!trip.shareId) {
      trip.shareId = crypto.randomBytes(6).toString('hex');
    }
    trip.isPublic = true;
    await trip.save();

    res.json({ success: true, shareId: trip.shareId, message: 'Share link generated' });
  } catch (error) {
    console.error('Generate share link error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get public trip by shareId
exports.getSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true })
      .populate('user', 'firstName lastName profileImage')
      .lean();

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Shared trip not found or is no longer public' });
    }

    // Fetch itinerary sections if they exist
    const itinerary = await Itinerary.find({ tripId: trip._id }).sort('order').lean();
    
    // Check if the current user (if logged in) has liked or saved it
    let isLiked = false;
    let isSaved = false;
    
    if (req.user) {
      const liked = await LikedTrip.findOne({ tripId: trip._id, userId: req.user._id });
      const saved = await SavedTrip.findOne({ tripId: trip._id, userId: req.user._id });
      if (liked) isLiked = true;
      if (saved) isSaved = true;
    }

    res.json({ 
      success: true, 
      trip, 
      itinerarySections: itinerary, // Support both embedded and separate collections depending on data format
      isLiked, 
      isSaved 
    });
  } catch (error) {
    console.error('Get shared trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Copy itinerary
exports.copySharedTrip = async (req, res) => {
  try {
    const sourceTrip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true }).lean();
    if (!sourceTrip) return res.status(404).json({ success: false, message: 'Shared trip not found' });

    // Create a new trip for current user
    const newTripData = { ...sourceTrip };
    delete newTripData._id;
    delete newTripData.createdAt;
    delete newTripData.updatedAt;
    delete newTripData.shareId;
    
    newTripData.user = req.user._id;
    newTripData.title = `Copy of ${sourceTrip.title}`;
    newTripData.isPublic = false;
    newTripData.publicViews = 0;
    newTripData.likes = 0;
    newTripData.saves = 0;
    newTripData.travelers = [{ user: req.user._id, role: 'owner' }];
    
    const newTrip = await Trip.create(newTripData);

    // Copy external Itinerary sections if present
    const sections = await Itinerary.find({ tripId: sourceTrip._id }).lean();
    for (const section of sections) {
      const newSectionData = { ...section };
      delete newSectionData._id;
      delete newSectionData.createdAt;
      delete newSectionData.updatedAt;
      newSectionData.tripId = newTrip._id;
      await Itinerary.create(newSectionData);
    }

    res.json({ success: true, message: 'Trip copied successfully!', tripId: newTrip._id });
  } catch (error) {
    console.error('Copy shared trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Save / Bookmark
exports.saveSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!trip) return res.status(404).json({ success: false, message: 'Shared trip not found' });

    const existingSave = await SavedTrip.findOne({ userId: req.user._id, tripId: trip._id });
    if (existingSave) {
      await existingSave.deleteOne();
      trip.saves = Math.max(0, (trip.saves || 0) - 1);
      await trip.save();
      res.json({ success: true, saved: false, saves: trip.saves });
    } else {
      await SavedTrip.create({ userId: req.user._id, tripId: trip._id });
      trip.saves = (trip.saves || 0) + 1;
      await trip.save();
      res.json({ success: true, saved: true, saves: trip.saves });
    }
  } catch (error) {
    console.error('Save trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Like
exports.likeSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!trip) return res.status(404).json({ success: false, message: 'Shared trip not found' });

    const existingLike = await LikedTrip.findOne({ userId: req.user._id, tripId: trip._id });
    if (existingLike) {
      await existingLike.deleteOne();
      trip.likes = Math.max(0, (trip.likes || 0) - 1);
      await trip.save();
      res.json({ success: true, liked: false, likes: trip.likes });
    } else {
      await LikedTrip.create({ userId: req.user._id, tripId: trip._id });
      trip.likes = (trip.likes || 0) + 1;
      await trip.save();
      res.json({ success: true, liked: true, likes: trip.likes });
    }
  } catch (error) {
    console.error('Like trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// View count
exports.viewSharedTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ shareId: req.params.shareId, isPublic: true });
    if (!trip) return res.status(404).json({ success: false, message: 'Shared trip not found' });

    // Track view
    await SharedTripView.create({
      tripId: trip._id,
      userId: req.user ? req.user._id : undefined,
      ipAddress: req.ip
    });

    trip.publicViews = (trip.publicViews || 0) + 1;
    await trip.save();

    res.json({ success: true, views: trip.publicViews });
  } catch (error) {
    console.error('View trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
