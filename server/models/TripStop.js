const mongoose = require('mongoose');
const tripStopSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  cityName: { type: String, required: true },
  country: { type: String, default: '' },
  arrivalDate: { type: Date, required: true },
  departureDate: { type: Date, required: true },
  hotel: { name: { type: String, default: '' }, address: { type: String, default: '' }, costPerNight: { type: Number, default: 0 }, nights: { type: Number, default: 0 } },
  transportMode: { type: String, enum: ['flight','train','bus','car','ferry','walk','other'], default: 'flight' },
  transportCost: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  order: { type: Number, default: 0 },
  lat: { type: Number }, lng: { type: Number }
}, { timestamps: true });
tripStopSchema.virtual('stayDuration').get(function() {
  if (this.arrivalDate && this.departureDate) return Math.ceil((this.departureDate - this.arrivalDate) / 86400000);
  return 0;
});
tripStopSchema.set('toJSON', { virtuals: true });
tripStopSchema.set('toObject', { virtuals: true });
tripStopSchema.index({ tripId: 1, order: 1 });
module.exports = mongoose.model('TripStop', tripStopSchema);
