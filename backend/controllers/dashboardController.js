const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const { DEFAULT_CURRENCY, convertCurrency } = require('../utils/currency');

const startOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth(), 1);
const endOfMonth = (date = new Date()) => new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

exports.getDashboardMetrics = asyncHandler(async (req, res) => {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const baseCurrency = req.user.preferences?.currency || DEFAULT_CURRENCY;

  const [allTransactions, goals, activities] = await Promise.all([
    Transaction.find({ user: req.user._id, date: { $lte: now } }),
    Goal.find({ user: req.user._id }),
    Activity.find({ user: req.user._id }),
  ]);

  const totals = allTransactions.reduce(
    (acc, txn) => {
      const amount = convertCurrency(txn.amount, txn.currency, baseCurrency);
      if (txn.type === 'income') {
        acc.totalIncome += amount;
      } else {
        acc.totalExpense += amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  const savings = totals.totalIncome - totals.totalExpense;

  const monthlyBuckets = new Map();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);
  const categoryMap = new Map();

  allTransactions.forEach((txn) => {
    const txnDate = new Date(txn.date);
    const amount = convertCurrency(txn.amount, txn.currency, baseCurrency);

    if (txnDate >= sixMonthsAgo && txnDate <= now) {
      const key = `${txnDate.getFullYear()}-${txnDate.getMonth() + 1}`;
      if (!monthlyBuckets.has(key)) {
        monthlyBuckets.set(key, {
          year: txnDate.getFullYear(),
          month: txnDate.getMonth() + 1,
          income: 0,
          expense: 0,
        });
      }

      const bucket = monthlyBuckets.get(key);
      if (txn.type === 'income') {
        bucket.income += amount;
      } else {
        bucket.expense += amount;
      }
    }

    if (txn.type === 'expense' && txnDate >= monthStart && txnDate <= monthEnd) {
      const total = categoryMap.get(txn.category) || 0;
      categoryMap.set(txn.category, total + amount);
    }
  });

  const monthlyTrends = Array.from(monthlyBuckets.values())
    .flatMap((bucket) => [
      bucket.income > 0
        ? {
            _id: { month: bucket.month, year: bucket.year, type: 'income' },
            total: bucket.income,
          }
        : null,
      bucket.expense > 0
        ? {
            _id: { month: bucket.month, year: bucket.year, type: 'expense' },
            total: bucket.expense,
          }
        : null,
    ])
    .filter(Boolean)
    .sort((a, b) => {
      if (a._id.year === b._id.year) {
        return a._id.month - b._id.month;
      }
      return a._id.year - b._id.year;
    });

  const categories = Array.from(categoryMap.entries())
    .map(([name, total]) => ({ _id: name, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

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
    currency: baseCurrency,
  });
});
