const mongoose = require('mongoose');

const JournalSchema = new mongoose.Schema(
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
    marketSentiment: {
      type: String,
      enum: ['fear', 'neutral', 'greed'],
      required: true,
    },
    stressLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    focusLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    thoughts: {
      type: String,
      required: [true, 'Please add some introspective thoughts'],
      trim: true,
    },
    tags: {
      type: [String],
      default: ['Discipline'],
    },
    biasesChecked: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Optimize index queries for specific user logs sorted by date or creation time
JournalSchema.index({ user: 1, date: -1 });
JournalSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Journal', JournalSchema);
