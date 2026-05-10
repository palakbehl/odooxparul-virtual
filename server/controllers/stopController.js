const TripStop = require('../models/TripStop');
const DayPlan = require('../models/DayPlan');
const Activity = require('../models/Activity');
const Trip = require('../models/Trip');

// Auto-generate days for a stop
const generateDays = async (stop, tripId) => {
  const start = new Date(stop.arrivalDate);
  const end = new Date(stop.departureDate);
  const days = [];
  let dayNum = 1;
  // Get existing max day number for this trip
  const lastDay = await DayPlan.findOne({ tripId }).sort('-dayNumber');
  let globalDay = lastDay ? lastDay.dayNumber + 1 : 1;
  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    days.push({ tripId, stopId: stop._id, dayNumber: globalDay++, date: new Date(d), cityName: stop.cityName });
  }
  if (days.length > 0) await DayPlan.insertMany(days);
  return days;
};

exports.addStop = async (req, res) => {
  try {
    const { tripId } = req.body;
    const trip = await Trip.findById(tripId);
    if (!trip || trip.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    const last = await TripStop.findOne({ tripId }).sort('-order');
    const stop = await TripStop.create({ ...req.body, order: last ? last.order + 1 : 0 });
    const days = await generateDays(stop, tripId);
    res.status(201).json({ success: true, stop, daysGenerated: days.length });
  } catch (e) { console.error(e); res.status(500).json({ success: false, message: e.message }); }
};

exports.getStops = async (req, res) => {
  try {
    const stops = await TripStop.find({ tripId: req.params.tripId }).sort('order');
    res.json({ success: true, stops });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.updateStop = async (req, res) => {
  try {
    const stop = await TripStop.findById(req.params.id);
    if (!stop) return res.status(404).json({ success: false, message: 'Not found' });
    const trip = await Trip.findById(stop.tripId);
    if (trip.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    const oldArr = stop.arrivalDate?.toISOString();
    const oldDep = stop.departureDate?.toISOString();
    const updated = await TripStop.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    // Regenerate days if dates changed
    if (req.body.arrivalDate !== oldArr || req.body.departureDate !== oldDep) {
      await DayPlan.deleteMany({ stopId: stop._id });
      await Activity.deleteMany({ stopId: stop._id });
      await generateDays(updated, stop.tripId);
    }
    res.json({ success: true, stop: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.deleteStop = async (req, res) => {
  try {
    const stop = await TripStop.findById(req.params.id);
    if (!stop) return res.status(404).json({ success: false, message: 'Not found' });
    const trip = await Trip.findById(stop.tripId);
    if (trip.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Not authorized' });
    await Activity.deleteMany({ stopId: stop._id });
    await DayPlan.deleteMany({ stopId: stop._id });
    await stop.deleteOne();
    res.json({ success: true, message: 'Stop deleted' });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
