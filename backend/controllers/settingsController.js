const asyncHandler = require('express-async-handler');
const { isSupportedCurrency, DEFAULT_CURRENCY } = require('../utils/currency');

exports.getSettings = asyncHandler(async (req, res) => {
  res.json({
    preferences: req.user.preferences,
    streaks: req.user.streaks,
  });
});

exports.updateSettings = asyncHandler(async (req, res) => {
  const { preferences } = req.body;

  if (preferences) {
    if (preferences.currency && !isSupportedCurrency(preferences.currency)) {
      res.status(400);
      throw new Error('Unsupported currency preference');
    }

    const existingPrefs =
      typeof req.user.preferences?.toObject === 'function'
        ? req.user.preferences.toObject()
        : { ...req.user.preferences };

    const nextPreferences = {
      ...existingPrefs,
      ...preferences,
    };

    if (!nextPreferences.currency) {
      nextPreferences.currency = DEFAULT_CURRENCY;
    }

    req.user.preferences = nextPreferences;
  }

  await req.user.save();

  res.json({
    preferences: req.user.preferences,
  });
});
