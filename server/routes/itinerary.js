// ==========================================
// Itinerary Routes - Traveloop
// ==========================================

const express = require('express');
const router = express.Router();
const { addSection, getTripItinerary, updateSection, deleteSection, reorderSections } = require('../controllers/itineraryController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.post('/add', addSection);
router.get('/trip/:tripId', getTripItinerary);
router.put('/update/:id', updateSection);
router.delete('/delete/:id', deleteSection);
router.put('/reorder', reorderSections);

module.exports = router;
