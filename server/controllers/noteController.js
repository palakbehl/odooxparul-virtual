const Note = require('../models/Note');
exports.addNote = async (req, res) => {
  try { const note = await Note.create({ ...req.body, userId: req.user._id }); res.status(201).json({ success: true, note }); }
  catch (e) { res.status(500).json({ success: false, message: e.message }); }
};
exports.getTripNotes = async (req, res) => {
  try { const notes = await Note.find({ tripId: req.params.tripId }).sort('-createdAt'); res.json({ success: true, notes }); }
  catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
exports.updateNote = async (req, res) => {
  try { const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json({ success: true, note }); }
  catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
exports.deleteNote = async (req, res) => {
  try { await Note.findByIdAndDelete(req.params.id); res.json({ success: true }); }
  catch (e) { res.status(500).json({ success: false, message: 'Server error' }); }
};
