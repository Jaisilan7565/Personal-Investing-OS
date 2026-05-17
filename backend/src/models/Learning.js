const mongoose = require('mongoose');

const LearningSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Please specify learning topic name'],
      trim: true,
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'mastered'],
      default: 'todo',
    },
  },
  { timestamps: true }
);

// Optimize index searches and guarantee unique topic tracker per user
LearningSchema.index({ user: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('Learning', LearningSchema);
