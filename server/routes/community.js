const express = require('express');
const router = express.Router();
const c = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/auth');

// Public routes
// Optional auth allows req.user if logged in, but doesn't throw if not
router.get('/feed', optionalAuth, c.getFeed);
router.get('/trending', c.getTrending);
router.get('/post/:id', optionalAuth, c.getPost);
router.get('/profile/:id', optionalAuth, c.getUserProfile);

// Protected routes
router.use(protect);
router.post('/create', c.createPost);
router.post('/like/:id', c.likePost); // POST /api/community/like/:id
router.post('/comment/:id', c.addComment);
router.post('/save/:id', c.savePost);
router.post('/follow', c.followUser);
router.post('/copy-itinerary', c.copyItinerary);

module.exports = router;
