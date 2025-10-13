const mongoose = require('mongoose');

const completionSchema = new mongoose.Schema(
  {
    completedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  },
  { _id: false }
);

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'custom'],
      default: 'daily',
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastCompletedAt: Date,
    completions: [completionSchema],
    notes: String,
    icon: String,
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', activitySchema);

module.exports = Activity;
