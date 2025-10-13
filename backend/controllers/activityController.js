const asyncHandler = require('express-async-handler');
const Activity = require('../models/Activity');

const differenceInDays = (dateA, dateB) => {
  const start = new Date(dateA);
  const end = new Date(dateB);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((start - end) / (1000 * 60 * 60 * 24));
};

const calculateStreak = (activity, frequency) => {
  const now = new Date();
  const last = activity.lastCompletedAt ? new Date(activity.lastCompletedAt) : null;

  if (!last) {
    return 1;
  }

  const diffHours = (now - last) / (1000 * 60 * 60);

  switch (frequency) {
    case 'daily':
      return diffHours <= 48 ? activity.streak + 1 : 1;
    case 'weekly':
      return diffHours <= 24 * 14 ? activity.streak + 1 : 1;
    default:
      return activity.streak + 1;
  }
};

exports.getActivities = asyncHandler(async (req, res) => {
  const activities = await Activity.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ activities });
});

exports.getActivityById = asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  res.json({ activity });
});

exports.createActivity = asyncHandler(async (req, res) => {
  const { name, frequency, notes, icon } = req.body;

  if (!name) {
    res.status(400);
    throw new Error('Activity name is required');
  }

  const activity = await Activity.create({
    user: req.user._id,
    name,
    frequency,
    notes,
    icon,
  });

  res.status(201).json({ activity });
});

exports.updateActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  Object.assign(activity, req.body);
  await activity.save();

  res.json({ activity });
});

exports.markCompleted = asyncHandler(async (req, res) => {
  const { note } = req.body;
  const activity = await Activity.findOne({ _id: req.params.id, user: req.user._id });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  activity.streak = calculateStreak(activity, activity.frequency);
  activity.lastCompletedAt = new Date();
  activity.completions.push({ note });
  await activity.save();

  const user = req.user;
  if (user) {
    const now = new Date();
    if (!user.lastActivityCompletedAt) {
      user.streaks.activities = 1;
    } else {
      const diff = differenceInDays(now, user.lastActivityCompletedAt);
      if (diff === 1) {
        user.streaks.activities += 1;
      } else if (diff > 1) {
        user.streaks.activities = 1;
      }
    }
    user.lastActivityCompletedAt = now;
    await user.save();
  }

  res.json({ activity });
});

exports.deleteActivity = asyncHandler(async (req, res) => {
  const activity = await Activity.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!activity) {
    res.status(404);
    throw new Error('Activity not found');
  }

  res.json({ message: 'Activity removed' });
});
