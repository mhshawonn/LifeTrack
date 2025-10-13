const mongoose = require('mongoose');

const progressEntrySchema = new mongoose.Schema(
  {
    value: Number,
    note: String,
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const goalSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    targetValue: {
      type: Number,
      required: true,
      min: 0,
    },
    currentValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'one-time'],
      default: 'monthly',
    },
    deadline: Date,
    category: {
      type: String,
      default: 'General',
    },
    progressHistory: [progressEntrySchema],
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Goal = mongoose.model('Goal', goalSchema);

module.exports = Goal;
