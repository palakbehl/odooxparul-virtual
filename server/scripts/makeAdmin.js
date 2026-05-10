// Quick script to make a user admin
// Usage: node scripts/makeAdmin.js <email>
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function makeAdmin() {
  const email = process.argv[2];
  if (!email) {
    console.log('Usage: node scripts/makeAdmin.js <email>');
    console.log('This will promote the user to admin role.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      // List existing users
      const users = await User.find({}, 'email firstName lastName role').limit(10);
      console.log('\nExisting users:');
      users.forEach(u => console.log(`  ${u.email} (${u.firstName} ${u.lastName}) - ${u.role}`));
      process.exit(1);
    }

    user.role = 'admin';
    user.adminPermissions = {
      manageUsers: true,
      manageTrips: true,
      moderateCommunity: true,
      manageReports: true,
      manageDestinations: true,
      analyticsAccess: true
    };
    await user.save();
    console.log(`✅ ${user.firstName} ${user.lastName} (${user.email}) is now an ADMIN`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

makeAdmin();
