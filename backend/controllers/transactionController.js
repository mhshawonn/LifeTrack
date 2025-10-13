const asyncHandler = require('express-async-handler');
const Transaction = require('../models/Transaction');
const { predictCategory } = require('../utils/aiCategorizer');
const { DEFAULT_CURRENCY, isSupportedCurrency, convertCurrency } = require('../utils/currency');

const differenceInDays = (dateA, dateB) => {
  const start = new Date(dateA);
  const end = new Date(dateB);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return Math.round((start - end) / (1000 * 60 * 60 * 24));
};

const updateExpenseStreak = (user, transactionDate) => {
  const lastLogged = user.lastExpenseLoggedAt;

  if (!lastLogged) {
    user.streaks.expenses = 1;
  } else {
    const dayDiff = differenceInDays(transactionDate, lastLogged);
    if (dayDiff === 0) {
      // already counted today
      return;
    }
    if (dayDiff === 1) {
      user.streaks.expenses += 1;
    } else {
      user.streaks.expenses = 1;
    }
  }

  user.lastExpenseLoggedAt = transactionDate;
};

exports.getTransactions = asyncHandler(async (req, res) => {
  const { type, category, startDate, endDate } = req.query;
  const query = { user: req.user._id };

  if (type) {
    query.type = type;
  }

  if (category) {
    query.category = category;
  }

  if (startDate || endDate) {
    query.date = {};
    if (startDate) query.date.$gte = new Date(startDate);
    if (endDate) query.date.$lte = new Date(endDate);
  }

  const transactions = await Transaction.find(query).sort({ date: -1 });

  res.json({
    transactions,
    currency: req.user.preferences?.currency || DEFAULT_CURRENCY,
  });
});

exports.createTransaction = asyncHandler(async (req, res) => {
  const { type, amount, description, category, date, notes, tags, source, currency } = req.body;
  const parsedAmount = Number(amount);

  if (!type || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
    res.status(400);
    throw new Error('Type and amount are required');
  }

  let aiSuggestion;
  if (!category || type === 'expense') {
    aiSuggestion = await predictCategory(description, type);
  }

  const userCurrency = req.user.preferences?.currency || DEFAULT_CURRENCY;
  const transactionCurrency = isSupportedCurrency(currency) ? currency : userCurrency;

  const transaction = await Transaction.create({
    user: req.user._id,
    type,
    amount: parsedAmount,
    currency: transactionCurrency,
    description,
    date: date ? new Date(date) : Date.now(),
    notes,
    tags,
    source: source || 'manual',
    category: category || aiSuggestion?.category || 'General',
    aiSuggestedCategory: aiSuggestion?.category,
    aiConfidence: aiSuggestion?.confidence,
  });

  if (type === 'expense') {
    updateExpenseStreak(req.user, transaction.date);
    await req.user.save();
  }

  res.status(201).json({ transaction });
});

exports.getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.json({ transaction });
});

exports.updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOne({ _id: req.params.id, user: req.user._id });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  const updates = req.body;

  if (typeof updates.amount !== 'undefined') {
    const parsedAmount = Number(updates.amount);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      res.status(400);
      throw new Error('Amount must be a positive number');
    }
    updates.amount = parsedAmount;
  }

  if (updates.currency && !isSupportedCurrency(updates.currency)) {
    res.status(400);
    throw new Error('Unsupported currency');
  }

  if (updates.description && !updates.category) {
    const aiSuggestion = await predictCategory(updates.description, updates.type || transaction.type);
    updates.aiSuggestedCategory = aiSuggestion.category;
    updates.aiConfidence = aiSuggestion.confidence;
    if (!transaction.category || transaction.category === transaction.aiSuggestedCategory) {
      updates.category = aiSuggestion.category;
    }
  }

  Object.assign(transaction, updates);
  await transaction.save();

  res.json({ transaction });
});

exports.deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id,
  });

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  res.json({ message: 'Transaction removed' });
});

exports.getMonthlySummary = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const targetMonth = Number(month) || new Date().getMonth();
  const targetYear = Number(year) || new Date().getFullYear();

  const start = new Date(targetYear, targetMonth, 1);
  const end = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);

  const baseCurrency = req.user.preferences?.currency || DEFAULT_CURRENCY;
  const transactions = await Transaction.find({
    user: req.user._id,
    date: { $gte: start, $lte: end },
  });

  const summaryMap = new Map();

  transactions.forEach((txn) => {
    const converted = convertCurrency(txn.amount, txn.currency, baseCurrency);
    const key = `${txn.type}-${txn.category}`;

    if (!summaryMap.has(key)) {
      summaryMap.set(key, {
        _id: { type: txn.type, category: txn.category },
        total: 0,
      });
    }

    const entry = summaryMap.get(key);
    entry.total += converted;
  });

  res.json({
    summary: Array.from(summaryMap.values()),
    currency: baseCurrency,
  });
});

exports.exportTransactions = asyncHandler(async (req, res) => {
  const transactions = await Transaction.find({ user: req.user._id }).sort({ date: -1 });

  const header = ['Date', 'Type', 'Category', 'Amount', 'Currency', 'Description', 'Notes'].join(',');
  const rows = transactions.map((txn) =>
    [
      txn.date.toISOString(),
      txn.type,
      `"${txn.category}"`,
      txn.amount.toFixed(2),
      txn.currency || DEFAULT_CURRENCY,
      `"${txn.description || ''}"`,
      `"${txn.notes || ''}"`,
    ].join(',')
  );

  const csv = [header, ...rows].join('\n');
  res.setHeader('Content-Disposition', 'attachment; filename=lifetrack-transactions.csv');
  res.setHeader('Content-Type', 'text/csv');
  res.send(csv);
});
