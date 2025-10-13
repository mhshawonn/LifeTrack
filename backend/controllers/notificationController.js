const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');

const hoursSince = (date) => {
  if (!date) return Infinity;
  return (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60);
};

exports.getNotifications = asyncHandler(async (req, res) => {
  const notifications = [];
  const user = req.user;

  if (user.preferences.dailyReminder) {
    const expenseGap = hoursSince(user.lastExpenseLoggedAt);
    if (expenseGap > 24) {
      notifications.push({
        id: 'expense-reminder',
        type: 'reminder',
        message: 'Log today’s expenses to keep your streak alive.',
        action: 'log-expense',
      });
    }
  }

  const [incompleteGoals, activities] = await Promise.all([
    Goal.find({ user: user._id, isCompleted: false }),
    Activity.find({ user: user._id }),
  ]);

  incompleteGoals.forEach((goal) => {
    if (goal.deadline) {
      const deadline = new Date(goal.deadline);
      const daysLeft = Math.ceil((deadline - Date.now()) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 3 && daysLeft >= 0) {
        notifications.push({
          id: `goal-${goal._id}`,
          type: 'goal',
          message: `"${goal.title}" deadline is ${daysLeft} day(s) away.`,
          action: 'view-goals',
        });
      }
    }
  });

  activities.forEach((activity) => {
    const gap = hoursSince(activity.lastCompletedAt);
    if (gap > 24 && activity.frequency === 'daily') {
      notifications.push({
        id: `activity-${activity._id}`,
        type: 'activity',
        message: `Keep your ${activity.name} streak going.`,
        action: 'view-activities',
      });
    }
  });

  const latestTransactions = await Transaction.find({ user: user._id })
    .sort({ createdAt: -1 })
    .limit(1);

  const lastTxn = latestTransactions[0];
  if (lastTxn && lastTxn.type === 'expense' && lastTxn.aiConfidence && lastTxn.aiConfidence < 0.5) {
    notifications.push({
      id: `txn-${lastTxn._id}`,
      type: 'ai-review',
      message: 'Review the category we suggested for your latest expense.',
      action: 'review-transaction',
    });
  }

  res.json({ notifications });
});
