const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');

const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

exports.getDashboardMetrics = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [transactions, goals, activities] = await Promise.all([
    Transaction.find({ user: req.user._id, date: { $lte: now } }),
    Goal.find({ user: req.user._id }),
    Activity.find({ user: req.user._id }),
  ]);

  const totals = transactions.reduce(
    (acc, txn) => {
      if (txn.type === 'income') {
        acc.totalIncome += txn.amount;
      } else {
        acc.totalExpense += txn.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  const savings = totals.totalIncome - totals.totalExpense;

  const monthlyTrends = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        date: { $gte: sixMonthsAgo, $lte: now },
      },
    },
    {
      $group: {
        _id: {
          month: { $month: '$date' },
          year: { $year: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 },
    },
  ]);

  const categories = await Transaction.aggregate([
    {
      $match: {
        user: req.user._id,
        type: 'expense',
        date: { $gte: startOfMonth(now), $lte: endOfMonth(now) },
      },
    },
    {
      $group: {
        _id: '$category',
        total: { $sum: '$amount' },
      },
    },
    {
      $sort: { total: -1 },
    },
    { $limit: 5 },
  ]);

  const goalStats = goals.map((goal) => ({
    id: goal._id,
    title: goal.title,
    progress: Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)),
    isCompleted: goal.isCompleted,
  }));

  const activityStreaks = activities.map((activity) => ({
    id: activity._id,
    name: activity.name,
    streak: activity.streak,
    lastCompletedAt: activity.lastCompletedAt,
  }));

  res.json({
    income: totals.totalIncome,
    expenses: totals.totalExpense,
    savings,
    topCategories: categories,
    monthlyTrends,
    goalStats,
    activityStreaks,
    streaks: req.user.streaks,
  });
});
