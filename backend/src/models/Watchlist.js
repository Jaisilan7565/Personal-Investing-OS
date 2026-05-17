const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    symbol: {
      type: String,
      required: [true, 'Please provide stock symbol'],
      uppercase: true,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure a user cannot log the same watch symbol twice
WatchlistSchema.index({ user: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
