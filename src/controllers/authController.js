const User = require('../models/User');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) throw new AppError('Email is already registered', 409);

  const user = await User.create({ name, email, password });
  res.status(201).json({ success: true, message: 'Registration successful', token: signToken(user._id), user });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  // Same message for unknown email / wrong password to avoid user enumeration
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }

  res.json({ success: true, message: 'Login successful', token: signToken(user._id), user });
});

// GET /api/auth/profile
exports.getProfile = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});
