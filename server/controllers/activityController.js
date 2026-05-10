const Activity = require('../models/Activity');
const DayPlan = require('../models/DayPlan');

exports.addActivity = async (req, res) => {
  try {
    const last = await Activity.findOne({ dayPlanId: req.body.dayPlanId }).sort('-order');
    const activity = await Activity.create({ ...req.body, order: last ? last.order + 1 : 0 });
    // Update day total cost
    const acts = await Activity.find({ dayPlanId: req.body.dayPlanId });
    const total = acts.reduce((s, a) => s + (a.cost || 0), 0);
    await DayPlan.findByIdAndUpdate(req.body.dayPlanId, { totalCost: total });
    res.status(201).json({ success: true, activity });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getActivities = async (req, res) => {
  try {
    const activities = await Activity.find({ dayPlanId: req.params.dayPlanId }).sort('order');
    res.json({ success: true, activities });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    // Recalc day cost
    const acts = await Activity.find({ dayPlanId: activity.dayPlanId });
    const total = acts.reduce((s, a) => s + (a.cost || 0), 0);
    await DayPlan.findByIdAndUpdate(activity.dayPlanId, { totalCost: total });
    res.json({ success: true, activity });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) return res.status(404).json({ success: false, message: 'Not found' });
    const dayId = activity.dayPlanId;
    await activity.deleteOne();
    const acts = await Activity.find({ dayPlanId: dayId });
    const total = acts.reduce((s, a) => s + (a.cost || 0), 0);
    await DayPlan.findByIdAndUpdate(dayId, { totalCost: total });
    res.json({ success: true, message: 'Deleted' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.reorderActivities = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, i) => Activity.findByIdAndUpdate(id, { order: i })));
    res.json({ success: true });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
