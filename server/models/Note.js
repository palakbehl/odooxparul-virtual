const mongoose = require('mongoose');
const noteSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  dayPlanId: { type: mongoose.Schema.Types.ObjectId, ref: 'DayPlan' },
  stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'TripStop' },
  type: { type: String, enum: ['general','day','city'], default: 'general' },
  title: { type: String, default: '' },
  content: { type: String, required: true },
  color: { type: String, default: '#FEF3C7' }
}, { timestamps: true });
noteSchema.index({ tripId: 1 });
module.exports = mongoose.model('Note', noteSchema);
