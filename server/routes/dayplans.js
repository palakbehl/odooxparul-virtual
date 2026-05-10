const express = require('express');
const r = express.Router();
const c = require('../controllers/dayPlanController');
const { protect } = require('../middleware/auth');
r.use(protect);
r.get('/trip/:tripId', c.getDayPlans);
r.get('/stop/:stopId', c.getDayPlansByStop);
r.put('/:id', c.updateDayPlan);
module.exports = r;
