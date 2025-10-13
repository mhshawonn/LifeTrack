const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  preferences: user.preferences,
  streaks: user.streaks,
  createdAt: user.createdAt,
});

exports.registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please provide name, email, and password');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  res.status(201).json({
    user: sanitizeUser(user),
    token: generateToken(user._id),
  });
});

exports.loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    user: sanitizeUser(user),
    token: generateToken(user._id),
  });
});

exports.getCurrentUser = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});

exports.updatePreferences = asyncHandler(async (req, res) => {
  const { theme, dailyReminder, reminderTime } = req.body;

  if (theme) {
    req.user.preferences.theme = theme;
  }

  if (typeof dailyReminder === 'boolean') {
    req.user.preferences.dailyReminder = dailyReminder;
  }

  if (reminderTime) {
    req.user.preferences.reminderTime = reminderTime;
  }

  await req.user.save();

  res.json({ user: sanitizeUser(req.user) });
});

exports.logoutUser = asyncHandler(async (_req, res) => {
  res.json({ message: 'Logged out' });
});
