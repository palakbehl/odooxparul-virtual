const mongoose = require('mongoose');
const activitySchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  dayPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'DayPlan', required: true },
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripStop', required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, enum: ['activity','food','stay','transfer','shopping','other'], default: 'activity' },
  startTime: { type: String, default: '' },
  endTime: { type: String, default: '' },
  cost: { type: Number, default: 0 },
  costType: { type: String, enum: ['per_person','total','free'], default: 'per_person' },
  location: { type: String, default: '' },
  image: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  duration: { type: String, default: '' },
  completed: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  placeId: { type: String, default: '' }
}, { timestamps: true });
activitySchema.index({ dayPlanId: 1, order: 1 });
module.exports = mongoose.model('Activity', activitySchema);
