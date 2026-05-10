const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const TripStop = require('../models/TripStop');
const Activity = require('../models/Activity');

exports.createInvoice = async (req, res) => {
  try {
    const { tripId } = req.body;
    const [stops, activities, expenses] = await Promise.all([
      TripStop.find({ tripId }), Activity.find({ tripId }), Expense.find({ tripId })
    ]);
    const items = [];
    stops.forEach(s => {
      if (s.hotel?.costPerNight > 0) items.push({ category: 'Hotel', description: `${s.hotel.name || 'Hotel'} – ${s.cityName}`, quantity: `${s.hotel.nights || 1} nights`, unitCost: s.hotel.costPerNight, amount: s.hotel.costPerNight * (s.hotel.nights || 1) });
      if (s.transportCost > 0) items.push({ category: 'Travel', description: `${s.transportMode} to ${s.cityName}`, quantity: '1', unitCost: s.transportCost, amount: s.transportCost });
    });
    activities.forEach(a => { if (a.cost > 0) items.push({ category: 'Activity', description: a.title, quantity: '1', unitCost: a.cost, amount: a.cost }); });
    expenses.forEach(e => { items.push({ category: e.category, description: e.description, quantity: '1', unitCost: e.amount, amount: e.amount }); });
    const subtotal = items.reduce((s, i) => s + i.amount, 0);
    const taxRate = req.body.taxRate || 5;
    const taxAmount = Math.round(subtotal * taxRate / 100);
    const discount = req.body.discount || 0;
    const grandTotal = subtotal + taxAmount - discount;
    const invoiceId = `INV-${Date.now().toString(36).toUpperCase()}`;
    const invoice = await Invoice.create({ tripId, userId: req.user._id, invoiceId, items, subtotal, taxRate, taxAmount, discount, grandTotal });
    res.status(201).json({ success: true, invoice });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getTripInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ tripId: req.params.tripId }).sort('-createdAt').populate('tripId', 'title startDate endDate destinations travelerCount');
    res.json({ success: true, invoices });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.markPaid = async (req, res) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: 'paid', paidDate: new Date() }, { new: true });
    res.json({ success: true, invoice });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.deleteInvoice = async (req, res) => {
  try { await Invoice.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
