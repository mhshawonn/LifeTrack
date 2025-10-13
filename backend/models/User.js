const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const preferencesSchema = new mongoose.Schema(
  {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    dailyReminder: {
      type: Boolean,
      default: true,
    },
    reminderTime: {
      type: String,
      default: '20:00',
    },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    preferences: {
      type: preferencesSchema,
      default: () => ({}),
    },
    streaks: {
      expenses: {
        type: Number,
        default: 0,
      },
      goals: {
        type: Number,
        default: 0,
      },
      activities: {
        type: Number,
        default: 0,
      },
    },
    lastExpenseLoggedAt: Date,
    lastGoalUpdatedAt: Date,
    lastActivityCompletedAt: Date,
  },
  { timestamps: true }
);

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = function matchPassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
