// ==========================================
// Places Routes - OpenTripMap API Proxy
// ==========================================

const express = require('express');
const router = express.Router();
const {
  searchPlaces,
  getGeoname,
  getPlacesByRadius,
  autosuggest,
  getPlaceDetails,
  batchDetails,
  getSuggestions
} = require('../controllers/placesController');

// These are public — no auth needed for place search
router.get('/search', searchPlaces);           // Combined: geoname + radius in one call
router.get('/geoname', getGeoname);            // Get lat/lon for a city name
router.get('/radius', getPlacesByRadius);      // Get places within radius
router.get('/autosuggest', autosuggest);       // Autosuggest by partial name
router.get('/details/:xid', getPlaceDetails);  // Full details for one place
router.post('/batch-details', batchDetails);   // Batch details for multiple xids
router.get('/suggestions', getSuggestions);    // Curated suggestions

module.exports = router;
