const asyncHandler = require('express-async-handler');
const Goal = require('../models/Goal');

const differenceInDays = (dateA, dateB) => {
  const start = new Date(dateA);
  const end = new Date(dateB);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((start - end) / (1000 * 60 * 60 * 24));
};

exports.getGoals = asyncHandler(async (req, res) => {
  const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ goals });
});

exports.createGoal = asyncHandler(async (req, res) => {
  const { title, description, targetValue, currentValue, frequency, deadline, category } = req.body;

  if (!title || !targetValue) {
    res.status(400);
    throw new Error('Title and target value are required');
  }

  const goal = await Goal.create({
    user: req.user._id,
    title,
    description,
    targetValue,
    currentValue,
    frequency,
    deadline,
    category,
  });

  res.status(201).json({ goal });
});

exports.getGoalById = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  res.json({ goal });
});

exports.updateGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  Object.assign(goal, req.body);
  await goal.save();

  res.json({ goal });
});

exports.recordProgress = asyncHandler(async (req, res) => {
  const { value, note } = req.body;
  const goal = await Goal.findOne({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  if (typeof value !== 'number') {
    res.status(400);
    throw new Error('Progress value is required');
  }

  goal.currentValue = value;
  goal.progressHistory.push({ value, note });
  goal.isCompleted = goal.currentValue >= goal.targetValue;
  await goal.save();

  const user = req.user;
  if (user) {
    const now = new Date();
    if (!user.lastGoalUpdatedAt) {
      user.streaks.goals = 1;
    } else {
      const diff = differenceInDays(now, user.lastGoalUpdatedAt);
      if (diff === 1) {
        user.streaks.goals += 1;
      } else if (diff > 1) {
        user.streaks.goals = 1;
      }
    }
    user.lastGoalUpdatedAt = now;
    await user.save();
  }

  res.json({ goal });
});

exports.deleteGoal = asyncHandler(async (req, res) => {
  const goal = await Goal.findOneAndDelete({ _id: req.params.id, user: req.user._id });

  if (!goal) {
    res.status(404);
    throw new Error('Goal not found');
  }

  res.json({ message: 'Goal removed' });
});
