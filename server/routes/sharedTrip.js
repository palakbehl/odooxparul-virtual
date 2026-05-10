const express = require('express');
const router = express.Router();
const sharedTripController = require('../controllers/sharedTripController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
router.get('/:shareId', optionalAuth, sharedTripController.getSharedTrip);
router.post('/:shareId/view', optionalAuth, sharedTripController.viewSharedTrip);

// Protected routes
router.post('/generate/:tripId', protect, sharedTripController.generateShareLink);
router.post('/:shareId/copy', protect, sharedTripController.copySharedTrip);
router.post('/:shareId/save', protect, sharedTripController.saveSharedTrip);
router.post('/:shareId/like', protect, sharedTripController.likeSharedTrip);

module.exports = router;
