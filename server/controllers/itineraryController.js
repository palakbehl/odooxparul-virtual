// ==========================================
// Itinerary Controller - Traveloop
// ==========================================

const Itinerary = require('../models/Itinerary');
const Trip = require('../models/Trip');

// @desc    Add itinerary section to a trip
// @route   POST /api/itinerary/add
exports.addSection = async (req, res) => {
  try {
    const { tripId, cityName, country, coverImage, description, startDate, endDate, activities, estimatedCost, notes } = req.body;

    // Verify trip belongs to user
    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ success: false, message: 'Trip not found' });
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Get next order
    const lastSection = await Itinerary.findOne({ tripId }).sort('-order');
    const order = lastSection ? lastSection.order + 1 : 0;

    const section = await Itinerary.create({
      tripId, cityName, country, coverImage, description,
      startDate, endDate, activities: activities || [],
      estimatedCost: estimatedCost || 0, notes, order
    });

    res.status(201).json({ success: true, message: 'Section added!', section });
  } catch (error) {
    console.error('Add section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Get all itinerary sections for a trip
// @route   GET /api/itinerary/trip/:tripId
exports.getTripItinerary = async (req, res) => {
  try {
    const sections = await Itinerary.find({ tripId: req.params.tripId }).sort('order');
    const totalCost = sections.reduce((sum, s) => sum + (s.estimatedCost || 0), 0);
    res.json({ success: true, sections, totalCost });
  } catch (error) {
    console.error('Get itinerary error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Update itinerary section
// @route   PUT /api/itinerary/update/:id
exports.updateSection = async (req, res) => {
  try {
    const section = await Itinerary.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    // Verify trip ownership
    const trip = await Trip.findById(section.tripId);
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Itinerary.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, message: 'Section updated!', section: updated });
  } catch (error) {
    console.error('Update section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Delete itinerary section
// @route   DELETE /api/itinerary/delete/:id
exports.deleteSection = async (req, res) => {
  try {
    const section = await Itinerary.findById(req.params.id);
    if (!section) return res.status(404).json({ success: false, message: 'Section not found' });

    const trip = await Trip.findById(section.tripId);
    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await section.deleteOne();
    res.json({ success: true, message: 'Section deleted!' });
  } catch (error) {
    console.error('Delete section error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// @desc    Reorder itinerary sections
// @route   PUT /api/itinerary/reorder
exports.reorderSections = async (req, res) => {
  try {
    const { tripId, orderedIds } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updates = orderedIds.map((id, index) =>
      Itinerary.findByIdAndUpdate(id, { order: index })
    );
    await Promise.all(updates);

    const sections = await Itinerary.find({ tripId }).sort('order');
    res.json({ success: true, message: 'Reordered!', sections });
  } catch (error) {
    console.error('Reorder error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
