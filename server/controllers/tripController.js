// ==========================================
// Trip Controller - Traveloop
// ==========================================

const Trip = require('../models/Trip');

// ==========================================
// @desc    Create a new trip
// @route   POST /api/trips
// @access  Private
// ==========================================
exports.createTrip = async (req, res) => {
  try {
    const tripData = {
      ...req.body,
      user: req.user._id,
      travelers: [{ user: req.user._id, role: 'owner' }]
    };

    const trip = await Trip.create(tripData);

    res.status(201).json({
      success: true,
      message: 'Trip created successfully!',
      trip
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    console.error('Create trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get all trips for current user
// @route   GET /api/trips
// @access  Private
// ==========================================
exports.getMyTrips = async (req, res) => {
  try {
    const { status, sort = '-startDate', page = 1, limit = 10 } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const trips = await Trip.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('travelers.user', 'firstName lastName profileImage');

    const total = await Trip.countDocuments(query);

    res.json({
      success: true,
      trips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get trips error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get single trip by ID
// @route   GET /api/trips/:id
// @access  Private
// ==========================================
exports.getTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id)
      .populate('travelers.user', 'firstName lastName profileImage email');

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    // Check if user is the owner or a traveler
    if (trip.user.toString() !== req.user._id.toString()) {
      const isTraveler = trip.travelers.some(t => t.user._id.toString() === req.user._id.toString());
      if (!isTraveler && !trip.isPublic) {
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }
    }

    res.json({ success: true, trip });
  } catch (error) {
    console.error('Get trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private
// ==========================================
exports.updateTrip = async (req, res) => {
  try {
    let trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.json({ success: true, message: 'Trip updated successfully!', trip });
  } catch (error) {
    console.error('Update trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private
// ==========================================
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return res.status(404).json({ success: false, message: 'Trip not found' });
    }

    if (trip.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await trip.deleteOne();

    res.json({ success: true, message: 'Trip deleted successfully!' });
  } catch (error) {
    console.error('Delete trip error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get dashboard stats for current user
// @route   GET /api/trips/stats/dashboard
// @access  Private
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalTrips, upcoming, completed, active] = await Promise.all([
      Trip.countDocuments({ user: userId }),
      Trip.countDocuments({ user: userId, status: 'upcoming' }),
      Trip.countDocuments({ user: userId, status: 'completed' }),
      Trip.countDocuments({ user: userId, status: 'active' })
    ]);

    // Get total budget spent
    const budgetAgg = await Trip.aggregate([
      { $match: { user: userId } },
      { $group: { _id: null, totalBudget: { $sum: '$budget.total' }, totalSpent: { $sum: '$budget.spent' } } }
    ]);

    // Get unique countries visited
    const countriesAgg = await Trip.aggregate([
      { $match: { user: userId, status: 'completed' } },
      { $unwind: '$destinations' },
      { $group: { _id: '$destinations.country' } }
    ]);

    // Get recent trips
    const recentTrips = await Trip.find({ user: userId })
      .sort('-updatedAt')
      .limit(5)
      .populate('travelers.user', 'firstName lastName profileImage');

    res.json({
      success: true,
      stats: {
        totalTrips,
        upcoming,
        completed,
        active,
        totalBudget: budgetAgg[0]?.totalBudget || 0,
        totalSpent: budgetAgg[0]?.totalSpent || 0,
        countriesVisited: countriesAgg.length
      },
      recentTrips
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
