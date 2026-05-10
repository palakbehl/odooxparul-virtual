const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const c = require('../controllers/adminController');

// Admin middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

router.use(protect, adminOnly);

// Dashboard
router.get('/stats', c.getAdminStats);

// User management
router.get('/users', c.getAllUsers);
router.delete('/users/:id', c.deleteUser);
router.put('/users/:id/role', c.updateUserRole);
router.put('/users/:id/suspend', c.suspendUser);

// Trip management
router.get('/trips', c.getAllTrips);

// Activities & Analytics
router.get('/activities', c.getPopularActivities);
router.get('/analytics', c.getAnalytics);
router.get('/budget', c.getBudgetOverview);
router.get('/checklist', c.getChecklistOverview);

// Community moderation
router.get('/community/posts', c.getCommunityPosts);
router.delete('/community/posts/:id', c.deleteCommunityPost);

// System
router.get('/system-health', c.getSystemHealth);

module.exports = router;
