// ==========================================
// Seed Admin User Script - Traveloop
// Run: node scripts/seedAdmin.js
// ==========================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/traveloop';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  country: { type: String, default: '' },
  bio: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  password: { type: String, select: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existingAdmin = await User.findOne({ email: 'admin@traveloop.com' });
    if (existingAdmin) {
      // Update role to admin if not already
      await User.updateOne({ email: 'admin@traveloop.com' }, { $set: { role: 'admin' } });
      console.log('✅ Admin user already exists — role ensured as admin');
      console.log('   Email: admin@traveloop.com');
      console.log('   Password: admin123');
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);

      await User.create({
        firstName: 'Pranav',
        lastName: 'Kumar',
        email: 'admin@traveloop.com',
        phone: '+91 9876543210',
        city: 'Mumbai',
        country: 'India',
        bio: 'Traveloop Admin',
        role: 'admin',
        password: hashedPassword
      });
      console.log('✅ Admin user created successfully!');
      console.log('   Email: admin@traveloop.com');
      console.log('   Password: admin123');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedAdmin();
