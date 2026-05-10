// ==========================================
// Destination Routes - Traveloop
// ==========================================

const express = require('express');
const router = express.Router();
const {
  getDestinations,
  getFeaturedDestinations,
  getDestination,
  seedDestinations
} = require('../controllers/destinationController');

// Public routes
router.get('/featured', getFeaturedDestinations);
router.get('/', getDestinations);
router.get('/:id', getDestination);

// Seed route (for development)
router.post('/seed', seedDestinations);

module.exports = router;
