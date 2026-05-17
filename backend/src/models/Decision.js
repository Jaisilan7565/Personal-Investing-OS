const mongoose = require('mongoose');

const DecisionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    asset: {
      type: String,
      required: [true, 'Please add stock symbol or asset name'],
      uppercase: true,
      trim: true,
    },
    horizon: {
      type: String,
      required: true,
    },
    rationale: {
      type: String,
      required: [true, 'Please explain your investment thesis'],
      trim: true,
    },
    conviction: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    result: {
      type: String,
      enum: ['Pending', 'Winner', 'Loser'],
      default: 'Pending',
    },
    sentimentTag: {
      type: String,
      default: 'Discipline',
    },
    metrics: {
      entry: {
        type: String,
        default: 'Market',
      },
      stop: {
        type: String,
        required: [true, 'Please define your stop loss/invalidation criteria'],
      },
    },
    strategy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Strategy',
      default: null,
    },
  },
  { timestamps: true }
);

// Optimize queries for systematic decision logs
DecisionSchema.index({ user: 1, date: -1 });
DecisionSchema.index({ user: 1, createdAt: -1 });
DecisionSchema.index({ asset: 1 });

module.exports = mongoose.model('Decision', DecisionSchema);
