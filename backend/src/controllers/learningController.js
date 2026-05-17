const Learning = require('../models/Learning');
const { sendSuccess, sendError } = require('../utils/apiResponse');

const DEFAULT_TOPICS = [
  'Fundamental Analysis',
  'Technical Analysis',
  'Risk Management & Sizing',
  'Market Psychology & Biases',
  'Macroeconomics & Cycles',
  'Portfolio Diversification',
];

// @desc    Get user's learning topics and progress
// @route   GET /api/learning
// @access  Private
const getLearningProgress = async (req, res) => {
  try {
    const userTopics = await Learning.find({ user: req.user._id });
    
    // Create a map of user's saved topic progress
    const progressMap = {};
    userTopics.forEach((t) => {
      progressMap[t.topic] = {
        _id: t._id,
        status: t.status,
      };
    });

    // Merge default curriculum with user's specific progress
    const mergedCurriculum = DEFAULT_TOPICS.map((topicName) => {
      if (progressMap[topicName]) {
        return {
          topic: topicName,
          status: progressMap[topicName].status,
          _id: progressMap[topicName]._id,
        };
      }
      return {
        topic: topicName,
        status: 'todo',
        _id: null,
      };
    });

    sendSuccess(res, {
      message: 'Learning progress curriculum retrieved successfully',
      data: mergedCurriculum,
    });
  } catch (error) {
    console.error('Get learning progress error:', error.message);
    sendError(res, { message: 'Server error retrieving learning progress' });
  }
};

// @desc    Update progress status for a learning topic
// @route   POST /api/learning
// @access  Private
const updateLearningProgress = async (req, res) => {
  try {
    const { topic, status } = req.body;

    if (!DEFAULT_TOPICS.includes(topic)) {
      return sendError(res, { message: 'Topic is not part of the standard curriculum', statusCode: 400 });
    }

    let progress = await Learning.findOne({ user: req.user._id, topic });

    if (progress) {
      progress.status = status;
      await progress.save();
    } else {
      progress = await Learning.create({
        user: req.user._id,
        topic,
        status,
      });
    }

    sendSuccess(res, {
      message: 'Learning topic progress updated successfully',
      data: progress,
    });
  } catch (error) {
    console.error('Update learning progress error:', error.message);
    sendError(res, { message: 'Server error updating learning progress' });
  }
};

module.exports = {
  getLearningProgress,
  updateLearningProgress,
};
