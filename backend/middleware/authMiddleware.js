const jwt = require('jsonwebtoken');

// Verify JWT Token (Supabase compatible)
const verifyJWT = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

// Simple mock middleware for development
const mockAuth = (req, res, next) => {
  // For development only - mock user data
  req.user = {
    id: 'mock-user-id',
    email: 'test@example.com',
    role: 'user'
  };
  next();
};

module.exports = {
  verifyJWT,
  mockAuth
};