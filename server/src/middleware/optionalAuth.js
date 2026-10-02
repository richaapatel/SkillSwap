const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware — attaches user if token is valid, but does NOT reject missing tokens
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !/^Bearer\s+\S+$/i.test(authHeader)) {
      return next();
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');

    if (user) {
      req.user = user;
    }
  } catch (error) {
    // Token invalid or expired — just continue without user
  }

  next();
};

module.exports = optionalAuth;
