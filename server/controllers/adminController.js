// ==========================================
// Admin Controller - Traveloop
// Dynamic analytics from MongoDB
// ==========================================

const User = require('../models/User');
const Trip = require('../models/Trip');
const Destination = require('../models/Destination');

// ==========================================
// @desc    Get admin dashboard overview stats
// @route   GET /api/admin/stats
// @access  Admin
// ==========================================
exports.getAdminStats = async (req, res) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    // --- User counts ---
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Active users = users who created/updated a trip in the last 30 days
    const activeUserIds = await Trip.distinct('user', { updatedAt: { $gte: thirtyDaysAgo } });
    const activeUsers = activeUserIds.length;
    const inactiveUsers = totalUsers - activeUsers;

    // --- User Activity Trend (last 7 days) ---
    const activityTrend = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayActive = await Trip.distinct('user', {
        updatedAt: { $gte: dayStart, $lte: dayEnd }
      });

      activityTrend.push({
        date: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: dayStart.toISOString().slice(0, 10),
        activeUsers: dayActive.length
      });
    }

    // --- Popular Destinations (most trips to each destination) ---
    const popularDests = await Trip.aggregate([
      { $unwind: '$destinations' },
      {
        $group: {
          _id: { name: '$destinations.name', country: '$destinations.country' },
          totalTrips: { $sum: 1 }
        }
      },
      { $sort: { totalTrips: -1 } },
      { $limit: 5 },
      {
        $project: {
          _id: 0,
          destination: {
            $concat: [
              '$_id.name',
              { $cond: [{ $and: [{ $ne: ['$_id.country', ''] }, { $ne: ['$_id.country', null] }] }, { $concat: [', ', '$_id.country'] }, ''] }
            ]
          },
          name: '$_id.name',
          country: '$_id.country',
          totalTrips: 1
        }
      }
    ]);

    // --- Trip Status Breakdown ---
    const tripStatusAgg = await Trip.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const tripStatus = {};
    tripStatusAgg.forEach(s => { tripStatus[s._id] = s.count; });

    // --- Total trips ---
    const totalTrips = await Trip.countDocuments();

    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        newUsers,
        inactiveUsers,
        totalTrips,
        tripStatus,
        activityTrend,
        popularDestinations: popularDests
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get all users (paginated)
// @route   GET /api/admin/users
// @access  Admin
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', sort = '-createdAt' } = req.query;

    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-password');

    const total = await User.countDocuments(query);

    // For each user, get trip count
    const userIds = users.map(u => u._id);
    const tripCounts = await Trip.aggregate([
      { $match: { user: { $in: userIds } } },
      { $group: { _id: '$user', count: { $sum: 1 } } }
    ]);
    const tripCountMap = {};
    tripCounts.forEach(t => { tripCountMap[t._id.toString()] = t.count; });

    const usersWithTrips = users.map(u => ({
      ...u.toObject(),
      tripCount: tripCountMap[u._id.toString()] || 0
    }));

    res.json({
      success: true,
      users: usersWithTrips,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get all trips (admin view)
// @route   GET /api/admin/trips
// @access  Admin
// ==========================================
exports.getAllTrips = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, sort = '-createdAt' } = req.query;

    const query = {};
    if (status) query.status = status;

    const trips = await Trip.find(query)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'firstName lastName email profileImage')
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
    console.error('Admin get trips error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Delete a user (admin)
// @route   DELETE /api/admin/users/:id
// @access  Admin
// ==========================================
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin user' });
    }

    // Delete user's trips
    await Trip.deleteMany({ user: user._id });
    await user.deleteOne();

    res.json({ success: true, message: 'User and their trips deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Update user role (admin)
// @route   PUT /api/admin/users/:id/role
// @access  Admin
// ==========================================
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'Role updated', user });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
