const Journal = require('../models/Journal');
const Decision = require('../models/Decision');
const { generateBehavioralFeedback } = require('../services/aiService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get AI Mentor review of logs & optional prompt response
// @route   POST /api/ai/mentor
// @access  Private
const getAiMentorFeedback = async (req, res) => {
  try {
    const { prompt } = req.body;

    // Fetch user journals & decisions
    const [journals, decisions] = await Promise.all([
      Journal.find({ user: req.user._id }).sort({ createdAt: -1 }),
      Decision.find({ user: req.user._id }).sort({ createdAt: -1 }),
    ]);

    const feedback = await generateBehavioralFeedback(journals, decisions, prompt);
    sendSuccess(res, {
      message: 'AI Mentor behavioral advice generated successfully',
      data: { feedback },
    });
  } catch (error) {
    console.error('AI Mentor controller error:', error.message);
    sendError(res, { message: 'Server error generating mentor feedback' });
  }
};

module.exports = {
  getAiMentorFeedback,
};
