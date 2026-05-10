const mongoose = require('mongoose');
const expenseSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, enum: ['hotel','transport','activity','food','shopping','other'], required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  date: { type: Date, default: Date.now },
  paidBy: { type: String, default: '' },
  receipt: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });
expenseSchema.index({ tripId: 1, category: 1 });
module.exports = mongoose.model('Expense', expenseSchema);
