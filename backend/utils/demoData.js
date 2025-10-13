/* eslint-disable no-console */
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Goal = require('../models/Goal');
const Activity = require('../models/Activity');
const connectDB = require('../config/db');

dotenv.config();

const seed = async () => {
  await connectDB();

  const email = 'demo@lifetrack.app';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log('Demo user already exists, skipping seed.');
    process.exit(0);
  }

  const demoUser = await User.create({
    name: 'Demo User',
    email,
    password: 'password123',
    preferences: { theme: 'light', dailyReminder: true },
  });

  const now = new Date();

  await Transaction.insertMany([
    {
      user: demoUser._id,
      type: 'income',
      amount: 4500,
      category: 'Salary',
      description: 'Monthly salary',
      date: new Date(now.getFullYear(), now.getMonth(), 1),
    },
    {
      user: demoUser._id,
      type: 'expense',
      amount: 120,
      category: 'Health & Fitness',
      description: 'Gym membership',
      aiSuggestedCategory: 'Health & Fitness',
      aiConfidence: 0.9,
      date: new Date(now.getFullYear(), now.getMonth(), 2),
    },
    {
      user: demoUser._id,
      type: 'expense',
      amount: 240,
      category: 'Education',
      description: 'Online course subscription',
      aiSuggestedCategory: 'Education',
      aiConfidence: 0.8,
      date: new Date(now.getFullYear(), now.getMonth(), 5),
    },
  ]);

  await Goal.create({
    user: demoUser._id,
    title: 'Build emergency fund',
    targetValue: 5000,
    currentValue: 2200,
    frequency: 'monthly',
    category: 'Savings',
    progressHistory: [{ value: 2200, recordedAt: now }],
  });

  await Activity.create({
    user: demoUser._id,
    name: 'Morning workout',
    frequency: 'daily',
    streak: 3,
    lastCompletedAt: now,
    completions: [{ completedAt: now, note: 'Felt great!' }],
  });

  console.log('✅  Demo data seeded successfully');
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
