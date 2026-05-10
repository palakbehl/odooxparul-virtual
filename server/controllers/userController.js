// ==========================================
// User Controller - Traveloop (Profile)
// ==========================================

const User = require('../models/User');

// ==========================================
// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
// ==========================================
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone, city, country, bio, profileImage } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { firstName, lastName, phone, city, country, bio, profileImage },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully!',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        country: user.country,
        bio: user.bio,
        profileImage: user.profileImage,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
