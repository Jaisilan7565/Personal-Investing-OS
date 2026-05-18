const mongoose = require('mongoose');

const GeneratedLessonSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: [true, 'Please specify the lesson topic name'],
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      required: true,
    },
    category: {
      type: String,
      default: 'General',
    },
    contentJson: {
      title: { type: String, required: true },
      summary: { type: String, required: true },
      slides: [
        {
          slideNumber: { type: Number, required: true },
          title: { type: String, required: true },
          text: { type: String, required: true },
          visualDescription: { type: String },
          narrativeScript: { type: String, required: true },
        }
      ],
      tips: [{ type: String }],
      mistakes: [{ type: String }],
      quiz: [
        {
          questionNumber: { type: Number, required: true },
          question: { type: String, required: true },
          options: [{ type: String, required: true }],
          correctOptionIndex: { type: Number, required: true },
          explanation: { type: String, required: true },
        }
      ],
    },
    googleDriveFileId: {
      type: String,
      default: '',
    },
    googleDriveFileUrl: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Guarantee unique lesson generation per user/topic pair to save resources
GeneratedLessonSchema.index({ user: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('GeneratedLesson', GeneratedLessonSchema);
