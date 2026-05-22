const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Read token from cookies or Authorization header
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this resource, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretsyncspacekey123!');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      return res.status(404).json({ success: false, message: 'No user found with this id' });
    }
    next();
  } catch (error) {
    console.error('Auth Middleware error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token validation failed' });
  }
};

module.exports = { protect };
