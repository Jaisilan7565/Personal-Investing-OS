const mongoose = require('mongoose');

const UserLearningStateSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    currentLevel: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    streak: {
      type: Number,
      default: 0,
    },
    lastActiveDate: {
      type: Date,
      default: Date.now,
    },
    completedTopicsCount: {
      type: Number,
      default: 0,
    },
    weakTopics: [
      {
        type: String, // e.g. "Greed", "Revenge Trading", "FOMO", "Stress Control"
      }
    ],
    recommendedTopics: [
      {
        topicName: { type: String, required: true },
        reason: { type: String, required: true },
        difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
        category: { type: String, default: 'General' },
      }
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('UserLearningState', UserLearningStateSchema);
