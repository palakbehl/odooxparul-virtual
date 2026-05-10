// ==========================================
// Traveloop Backend Server - Entry Point
// ==========================================

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const tripRoutes = require('./routes/trips');
const destinationRoutes = require('./routes/destinations');
const itineraryRoutes = require('./routes/itinerary');
const placesRoutes = require('./routes/places');
const adminRoutes = require('./routes/admin');
const stopRoutes = require('./routes/stops');
const dayPlanRoutes = require('./routes/dayplans');
const activityRoutes = require('./routes/activities');
const expenseRoutes = require('./routes/expenses');
const communityRoutes = require('./routes/community');
const invoiceRoutes = require('./routes/invoices');
const noteRoutes = require('./routes/notes');
const sharedTripRoutes = require('./routes/sharedTrip');

const app = express();

// ==========================================
// Middleware
// ==========================================
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ==========================================
// Routes
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/itinerary', itineraryRoutes);
app.use('/api/places', placesRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stops', stopRoutes);
app.use('/api/dayplans', dayPlanRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/shared-trip', sharedTripRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Traveloop API is running' });
});

// ==========================================
// MongoDB Connection & Server Start
// ==========================================
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveloop';

mongoose.connect(MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected to MongoDB');

    // Auto-seed admin if none exists
    try {
      const User = require('./models/User');
      const adminExists = await User.findOne({ role: 'admin' });
      if (!adminExists) {
        await User.create({
          firstName: 'Admin',
          lastName: 'Traveloop',
          email: 'admin@traveloop.com',
          password: 'admin123',
          role: 'admin',
          adminPermissions: {
            manageUsers: true, manageTrips: true, moderateCommunity: true,
            manageReports: true, manageDestinations: true, analyticsAccess: true
          }
        });
        console.log('🔑 Admin user created: admin@traveloop.com / admin123');
      }
    } catch (e) { /* admin already exists or creation failed silently */ }

    app.listen(PORT, () => {
      console.log(`🚀 Traveloop server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
