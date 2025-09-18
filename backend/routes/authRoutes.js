const express = require('express');
const router = express.Router();
const { verifyUser, getUserProfile } = require('../controllers/authController');
const { verifyJWT } = require('../middleware/authMiddleware');

// Supabase authentication routes
router.post('/verify', verifyUser);
router.get('/profile', verifyJWT, getUserProfile);

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Supabase Auth API is working!',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;