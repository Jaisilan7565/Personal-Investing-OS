const { calculateUserAnalytics } = require('../services/analyticsService');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get user psychological & investment behavior analytics
// @route   GET /api/analytics
// @access  Private
const getUserAnalytics = async (req, res) => {
  try {
    const analytics = await calculateUserAnalytics(req.user._id);
    sendSuccess(res, {
      message: 'Behavioral analytics calculated successfully',
      data: analytics,
    });
  } catch (error) {
    console.error('Get analytics error:', error.message);
    sendError(res, { message: 'Server error generating behavioral analytics' });
  }
};

module.exports = {
  getUserAnalytics,
};
