// ==========================================
// Trip Routes - Traveloop
// ==========================================

const express = require('express');
const router = express.Router();
const {
  createTrip,
  getMyTrips,
  getTrip,
  updateTrip,
  deleteTrip,
  getDashboardStats
} = require('../controllers/tripController');
const { protect } = require('../middleware/auth');

// All trip routes are protected
router.use(protect);

// Dashboard stats (must be before /:id)
router.get('/stats/dashboard', getDashboardStats);

// CRUD routes
router.route('/')
  .get(getMyTrips)
  .post(createTrip);

router.route('/:id')
  .get(getTrip)
  .put(updateTrip)
  .delete(deleteTrip);

module.exports = router;
