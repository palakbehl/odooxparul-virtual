const Expense = require('../models/Expense');
const Activity = require('../models/Activity');
const TripStop = require('../models/TripStop');

exports.addExpense = async (req, res) => {
  try { const e = await Expense.create({ ...req.body, userId: req.user._id }); res.status(201).json({ success: true, expense: e }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};

exports.getTripExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ tripId: req.params.tripId }).sort('-date');
    const byCategory = {};
    expenses.forEach(e => { byCategory[e.category] = (byCategory[e.category] || 0) + e.amount; });
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    res.json({ success: true, expenses, byCategory, total });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.deleteExpense = async (req, res) => {
  try { await Expense.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};

exports.getBudgetDashboard = async (req, res) => {
  try {
    const tripId = req.params.tripId;
    const [expenses, stops, activities] = await Promise.all([
      Expense.find({ tripId }),
      TripStop.find({ tripId }),
      Activity.find({ tripId })
    ]);
    const expenseTotal = expenses.reduce((s, e) => s + e.amount, 0);
    const activityTotal = activities.reduce((s, a) => s + (a.cost || 0), 0);
    const hotelTotal = stops.reduce((s, st) => s + (st.hotel?.costPerNight || 0) * (st.hotel?.nights || 0), 0);
    const transportTotal = stops.reduce((s, st) => s + (st.transportCost || 0), 0);
    const byCategory = { hotel: hotelTotal, transport: transportTotal, activity: activityTotal, food: 0, shopping: 0 };
    expenses.forEach(e => { if (byCategory[e.category] !== undefined) byCategory[e.category] += e.amount; else byCategory[e.category] = e.amount; });
    const grandTotal = Object.values(byCategory).reduce((s, v) => s + v, 0);
    res.json({ success: true, byCategory, grandTotal, expenses, activityTotal, hotelTotal, transportTotal });
  } catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
