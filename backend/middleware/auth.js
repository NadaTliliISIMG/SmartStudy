const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Protects a route: verifies the Bearer token and attaches the user to req.user
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(header.split(' ')[1], jwtSecret);
  } catch (e) {
    throw new ApiError(401, 'Invalid or expired token');
  }

  const user = await User.findById(payload.id);
  if (!user) throw new ApiError(401, 'User not found');
  req.user = user;
  next();
});

module.exports = { protect };