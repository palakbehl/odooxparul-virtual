const mongoose = require('mongoose');
const invoiceItemSchema = new mongoose.Schema({
  category: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: String, default: '1' },
  unitCost: { type: Number, default: 0 },
  amount: { type: Number, default: 0 }
});
const invoiceSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceId: { type: String, required: true, unique: true },
  items: [invoiceItemSchema],
  subtotal: { type: Number, default: 0 },
  taxRate: { type: Number, default: 5 },
  taxAmount: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  status: { type: String, enum: ['pending','paid','overdue'], default: 'pending' },
  generatedDate: { type: Date, default: Date.now },
  paidDate: { type: Date }
}, { timestamps: true });
invoiceSchema.index({ tripId: 1 });
module.exports = mongoose.model('Invoice', invoiceSchema);
