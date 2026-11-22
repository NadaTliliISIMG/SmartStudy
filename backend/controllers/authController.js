const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const generateToken = require('../utils/generateToken');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (await User.findOne({ email })) throw new ApiError(409, 'This email is already used');
  const user = await User.create({ name, email, password }); // password hashed by the model
  res.status(201).json({ user: user.toPublic(), token: generateToken(user._id) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    // Same message for both cases: do not reveal whether the email exists
    throw new ApiError(401, 'Incorrect email or password');
  }
  res.json({ user: user.toPublic(), token: generateToken(user._id) });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toPublic() });
});