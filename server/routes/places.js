// ==========================================
// Places Routes - Outscraper API Proxy
// ==========================================

const express = require('express');
const router = express.Router();
const { searchPlaces, getAttractions, getSuggestions } = require('../controllers/placesController');

// These are public — no auth needed for place search
router.get('/search', searchPlaces);
router.get('/attractions', getAttractions);
router.get('/suggestions', getSuggestions);

module.exports = router;
