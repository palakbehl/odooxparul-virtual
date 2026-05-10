const mongoose = require('mongoose');
const dayPlanSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripStop', required: true },
  dayNumber: { type: Number, required: true },
  date: { type: Date, required: true },
  cityName: { type: String, required: true },
  notes: { type: String, default: '' },
  totalCost: { type: Number, default: 0 }
}, { timestamps: true });
dayPlanSchema.index({ tripId: 1, dayNumber: 1 });
dayPlanSchema.index({ stopId: 1 });
module.exports = mongoose.model('DayPlan', dayPlanSchema);
