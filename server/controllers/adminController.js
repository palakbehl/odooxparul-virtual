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

// ==========================================
// @desc    Get popular activities across all trips
// @route   GET /api/admin/activities
// @access  Admin
// ==========================================
exports.getPopularActivities = async (req, res) => {
  try {
    // Aggregate activities from all trip itineraries
    const activitiesAgg = await Trip.aggregate([
      { $unwind: '$itinerary' },
      { $unwind: '$itinerary.activities' },
      {
        $group: {
          _id: '$itinerary.activities.title',
          count: { $sum: 1 },
          totalCost: { $sum: '$itinerary.activities.cost' },
          avgCost: { $avg: '$itinerary.activities.cost' },
          locations: { $addToSet: '$itinerary.activities.location' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 },
      {
        $project: {
          _id: 0,
          activity: '$_id',
          count: 1,
          totalCost: { $round: ['$totalCost', 2] },
          avgCost: { $round: ['$avgCost', 2] },
          locations: 1
        }
      }
    ]);

    // Top destinations by activity count
    const destActivities = await Trip.aggregate([
      { $unwind: '$destinations' },
      { $unwind: '$itinerary' },
      {
        $group: {
          _id: '$destinations.name',
          country: { $first: '$destinations.country' },
          activityCount: { $sum: { $size: { $ifNull: ['$itinerary.activities', []] } } }
        }
      },
      { $sort: { activityCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          destination: '$_id',
          country: 1,
          activityCount: 1
        }
      }
    ]);

    // Trip type breakdown
    const tripTypes = await Trip.aggregate([
      { $match: { tripType: { $ne: '' } } },
      { $group: { _id: '$tripType', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Total activity stats
    const totalActivities = await Trip.aggregate([
      { $unwind: '$itinerary' },
      { $unwind: '$itinerary.activities' },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          completed: { $sum: { $cond: ['$itinerary.activities.completed', 1, 0] } },
          totalCost: { $sum: '$itinerary.activities.cost' }
        }
      }
    ]);

    res.json({
      success: true,
      activities: activitiesAgg,
      destinationActivities: destActivities,
      tripTypes: tripTypes.map(t => ({ type: t._id, count: t.count })),
      summary: {
        totalActivities: totalActivities[0]?.total || 0,
        completedActivities: totalActivities[0]?.completed || 0,
        totalActivityCost: totalActivities[0]?.totalCost || 0
      }
    });
  } catch (error) {
    console.error('Popular activities error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get user trends & analytics
// @route   GET /api/admin/analytics
// @access  Admin
// ==========================================
exports.getAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // --- User registration trend (last 12 months) ---
    const registrationTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const count = await User.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      registrationTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        users: count
      });
    }

    // --- Trip creation trend (last 12 months) ---
    const tripCreationTrend = [];
    for (let i = 11; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      const count = await Trip.countDocuments({ createdAt: { $gte: monthStart, $lte: monthEnd } });
      tripCreationTrend.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        trips: count
      });
    }

    // --- Top countries ---
    const topCountries = await Trip.aggregate([
      { $unwind: '$destinations' },
      { $match: { 'destinations.country': { $ne: '', $ne: null } } },
      { $group: { _id: '$destinations.country', trips: { $sum: 1 } } },
      { $sort: { trips: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, country: '$_id', trips: 1 } }
    ]);

    // --- Trip duration distribution ---
    const durationDist = await Trip.aggregate([
      {
        $project: {
          duration: { $divide: [{ $subtract: ['$endDate', '$startDate'] }, 86400000] }
        }
      },
      {
        $bucket: {
          groupBy: '$duration',
          boundaries: [0, 3, 7, 14, 30, 365],
          default: '30+',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    const durationLabels = { 0: '1-3 days', 3: '3-7 days', 7: '1-2 weeks', 14: '2-4 weeks', 30: '1+ month', '30+': '1+ month' };
    const durationFormatted = durationDist.map(d => ({
      range: durationLabels[d._id] || `${d._id}+ days`,
      count: d.count
    }));

    // --- Traveler count distribution ---
    const travelerDist = await Trip.aggregate([
      { $group: { _id: '$travelerCount', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 8 }
    ]);

    // --- Average budget per trip ---
    const avgBudget = await Trip.aggregate([
      { $match: { 'budget.total': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          avgTotal: { $avg: '$budget.total' },
          avgSpent: { $avg: '$budget.spent' }
        }
      }
    ]);

    res.json({
      success: true,
      registrationTrend,
      tripCreationTrend,
      topCountries,
      durationDistribution: durationFormatted,
      travelerDistribution: travelerDist.map(t => ({ travelers: t._id, count: t.count })),
      avgBudget: {
        avgTotal: Math.round(avgBudget[0]?.avgTotal || 0),
        avgSpent: Math.round(avgBudget[0]?.avgSpent || 0)
      }
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get platform-wide budget overview
// @route   GET /api/admin/budget
// @access  Admin
// ==========================================
exports.getBudgetOverview = async (req, res) => {
  try {
    // Overall budget aggregation
    const budgetAgg = await Trip.aggregate([
      {
        $group: {
          _id: null,
          totalBudgeted: { $sum: '$budget.total' },
          totalSpent: { $sum: '$budget.spent' },
          avgBudget: { $avg: '$budget.total' },
          avgSpent: { $avg: '$budget.spent' },
          tripsWithBudget: { $sum: { $cond: [{ $gt: ['$budget.total', 0] }, 1, 0] } }
        }
      }
    ]);

    // Budget by currency
    const currencyBreakdown = await Trip.aggregate([
      { $match: { 'budget.total': { $gt: 0 } } },
      {
        $group: {
          _id: '$budget.currency',
          totalBudget: { $sum: '$budget.total' },
          totalSpent: { $sum: '$budget.spent' },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Budget by trip status
    const budgetByStatus = await Trip.aggregate([
      {
        $group: {
          _id: '$status',
          totalBudget: { $sum: '$budget.total' },
          totalSpent: { $sum: '$budget.spent' },
          count: { $sum: 1 }
        }
      },
      { $sort: { totalBudget: -1 } }
    ]);

    // Top spenders (users who spent the most)
    const topSpenders = await Trip.aggregate([
      { $group: { _id: '$user', totalSpent: { $sum: '$budget.spent' }, tripCount: { $sum: 1 } } },
      { $sort: { totalSpent: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          _id: 0,
          userId: '$_id',
          firstName: '$userInfo.firstName',
          lastName: '$userInfo.lastName',
          email: '$userInfo.email',
          totalSpent: { $round: ['$totalSpent', 2] },
          tripCount: 1
        }
      }
    ]);

    // Activity cost breakdown (from itinerary)
    const activityCosts = await Trip.aggregate([
      { $unwind: '$itinerary' },
      { $unwind: '$itinerary.activities' },
      { $match: { 'itinerary.activities.cost': { $gt: 0 } } },
      {
        $group: {
          _id: null,
          totalActivityCost: { $sum: '$itinerary.activities.cost' },
          avgActivityCost: { $avg: '$itinerary.activities.cost' },
          maxActivityCost: { $max: '$itinerary.activities.cost' },
          activityCount: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      overview: {
        totalBudgeted: Math.round(budgetAgg[0]?.totalBudgeted || 0),
        totalSpent: Math.round(budgetAgg[0]?.totalSpent || 0),
        avgBudget: Math.round(budgetAgg[0]?.avgBudget || 0),
        avgSpent: Math.round(budgetAgg[0]?.avgSpent || 0),
        tripsWithBudget: budgetAgg[0]?.tripsWithBudget || 0
      },
      currencyBreakdown: currencyBreakdown.map(c => ({
        currency: c._id || 'USD',
        totalBudget: Math.round(c.totalBudget),
        totalSpent: Math.round(c.totalSpent),
        count: c.count
      })),
      budgetByStatus: budgetByStatus.map(b => ({
        status: b._id,
        totalBudget: Math.round(b.totalBudget),
        totalSpent: Math.round(b.totalSpent),
        count: b.count
      })),
      topSpenders,
      activityCosts: {
        total: Math.round(activityCosts[0]?.totalActivityCost || 0),
        avg: Math.round(activityCosts[0]?.avgActivityCost || 0),
        max: Math.round(activityCosts[0]?.maxActivityCost || 0),
        count: activityCosts[0]?.activityCount || 0
      }
    });
  } catch (error) {
    console.error('Budget overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ==========================================
// @desc    Get platform-wide checklist overview
// @route   GET /api/admin/checklist
// @access  Admin
// ==========================================
exports.getChecklistOverview = async (req, res) => {
  try {
    // Trips with checklists
    const tripsWithChecklist = await Trip.countDocuments({ 'checklist.0': { $exists: true } });

    // Checklist item aggregation
    const checklistAgg = await Trip.aggregate([
      { $match: { 'checklist.0': { $exists: true } } },
      { $unwind: '$checklist' },
      {
        $group: {
          _id: null,
          totalItems: { $sum: 1 },
          checkedItems: { $sum: { $cond: ['$checklist.checked', 1, 0] } },
          uncheckedItems: { $sum: { $cond: ['$checklist.checked', 0, 1] } }
        }
      }
    ]);

    // By category
    const categoryBreakdown = await Trip.aggregate([
      { $match: { 'checklist.0': { $exists: true } } },
      { $unwind: '$checklist' },
      {
        $group: {
          _id: { $ifNull: ['$checklist.category', 'general'] },
          total: { $sum: 1 },
          checked: { $sum: { $cond: ['$checklist.checked', 1, 0] } }
        }
      },
      { $sort: { total: -1 } }
    ]);

    // Most popular items
    const popularItems = await Trip.aggregate([
      { $match: { 'checklist.0': { $exists: true } } },
      { $unwind: '$checklist' },
      {
        $group: {
          _id: { $toLower: '$checklist.item' },
          count: { $sum: 1 },
          checkedCount: { $sum: { $cond: ['$checklist.checked', 1, 0] } },
          category: { $first: '$checklist.category' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
      {
        $project: {
          _id: 0,
          item: '$_id',
          count: 1,
          checkedCount: 1,
          category: { $ifNull: ['$category', 'general'] }
        }
      }
    ]);

    // Trips with highest checklist completion rate
    const topCompleted = await Trip.aggregate([
      { $match: { 'checklist.0': { $exists: true } } },
      {
        $project: {
          title: 1,
          user: 1,
          total: { $size: '$checklist' },
          checked: {
            $size: {
              $filter: { input: '$checklist', as: 'c', cond: { $eq: ['$$c.checked', true] } }
            }
          }
        }
      },
      { $match: { total: { $gt: 0 } } },
      { $addFields: { rate: { $multiply: [{ $divide: ['$checked', '$total'] }, 100] } } },
      { $sort: { rate: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          tripTitle: '$title',
          userName: { $concat: [{ $ifNull: ['$userInfo.firstName', ''] }, ' ', { $ifNull: ['$userInfo.lastName', ''] }] },
          total: 1,
          checked: 1,
          rate: { $round: ['$rate', 0] }
        }
      }
    ]);

    res.json({
      success: true,
      tripsWithChecklist,
      summary: {
        totalItems: checklistAgg[0]?.totalItems || 0,
        checkedItems: checklistAgg[0]?.checkedItems || 0,
        uncheckedItems: checklistAgg[0]?.uncheckedItems || 0,
        completionRate: checklistAgg[0]?.totalItems
          ? Math.round((checklistAgg[0].checkedItems / checklistAgg[0].totalItems) * 100)
          : 0
      },
      categoryBreakdown: categoryBreakdown.map(c => ({
        category: c._id,
        total: c.total,
        checked: c.checked,
        rate: c.total ? Math.round((c.checked / c.total) * 100) : 0
      })),
      popularItems,
      topCompleted
    });
  } catch (error) {
    console.error('Checklist overview error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
