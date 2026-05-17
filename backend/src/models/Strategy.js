const mongoose = require('mongoose');

const StrategySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a strategy name'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    entryRules: {
      type: String,
      required: [true, 'Please explain your entry setup triggers'],
    },
    exitRules: {
      type: String,
      required: [true, 'Please explain your exit/profit-taking targets'],
    },
    stopLossRules: {
      type: String,
      required: [true, 'Please explain your stop-loss/invalidation criteria'],
    },
    riskProfile: {
      type: String,
      default: "1% of Capital",
    }
  },
  { timestamps: true }
);

// Optimize queries for finding strategies per user
StrategySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Strategy', StrategySchema);
