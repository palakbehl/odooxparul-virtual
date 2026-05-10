// ==========================================
// Admin Routes - Traveloop
// ==========================================

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getAdminStats,
  getAllUsers,
  getAllTrips,
  deleteUser,
  updateUserRole
} = require('../controllers/adminController');

// Admin middleware - checks role after auth
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required' });
  }
  next();
};

// All routes require auth + admin role
router.use(protect, adminOnly);

router.get('/stats', getAdminStats);
router.get('/users', getAllUsers);
router.get('/trips', getAllTrips);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/role', updateUserRole);

module.exports = router;
