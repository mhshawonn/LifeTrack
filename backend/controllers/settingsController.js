const asyncHandler = require('express-async-handler');

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({
    preferences: req.user.preferences,
    streaks: req.user.streaks,
  });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (preferences) {
    req.user.preferences = { ...req.user.preferences, ...preferences };
  }

  await req.user.save();

  res.json({
    preferences: req.user.preferences,
  });
});
