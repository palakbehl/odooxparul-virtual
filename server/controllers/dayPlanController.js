const DayPlan = require('../models/DayPlan');
const Activity = require('../models/Activity');

exports.getDayPlans = async (req, res) => {
  try {
    const days = await DayPlan.find({ tripId: req.params.tripId }).sort('dayNumber');
    // Attach activities to each day
    const dayIds = days.map(d => d._id);
    const activities = await Activity.find({ dayPlanId: { $in: dayIds } }).sort('order');
    const result = days.map(d => ({
      ...d.toObject(),
      activities: activities.filter(a => a.dayPlanId.toString() === d._id.toString())
    }));
    // Calculate totals
    const totalCost = activities.reduce((s, a) => s + (a.cost || 0), 0);
    res.json({ success: true, days: result, totalCost });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getDayPlansByStop = async (req, res) => {
  try {
    const days = await DayPlan.find({ stopId: req.params.stopId }).sort('dayNumber');
    const dayIds = days.map(d => d._id);
    const activities = await Activity.find({ dayPlanId: { $in: dayIds } }).sort('order');
    const result = days.map(d => ({
      ...d.toObject(),
      activities: activities.filter(a => a.dayPlanId.toString() === d._id.toString())
    }));
    res.json({ success: true, days: result });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.updateDayPlan = async (req, res) => {
  try {
    const day = await DayPlan.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, day });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
