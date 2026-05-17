const Watchlist = require('../models/Watchlist');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get user watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const watchlist = await Watchlist.find({ user: req.user._id }).sort({ symbol: 1 });
    sendSuccess(res, {
      message: 'Watchlist retrieved successfully',
      data: watchlist,
    });
  } catch (error) {
    console.error('Get watchlist error:', error.message);
    sendError(res, { message: 'Server error retrieving watchlist' });
  }
};

// @desc    Add symbol to watchlist (observation-only)
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { symbol, notes } = req.body;

    // Check if symbol already in watchlist for this user
    const exists = await Watchlist.findOne({ user: req.user._id, symbol: symbol.toUpperCase() });
    if (exists) {
      return sendError(res, { message: 'Symbol is already in your watchlist', statusCode: 400 });
    }

    const item = await Watchlist.create({
      user: req.user._id,
      symbol,
      notes,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Symbol added to watchlist successfully',
      data: item,
    });
  } catch (error) {
    console.error('Add to watchlist error:', error.message);
    sendError(res, { message: 'Server error adding stock to watchlist' });
  }
};

// @desc    Delete symbol from watchlist
// @route   DELETE /api/watchlist/:id
// @access  Private
const deleteFromWatchlist = async (req, res) => {
  try {
    const item = await Watchlist.findById(req.params.id);

    if (!item) {
      return sendError(res, { message: 'Watchlist item not found', statusCode: 404 });
    }

    // Ensure it belongs to the user
    if (item.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    await item.deleteOne();
    sendSuccess(res, { message: 'Watchlist item removed successfully' });
  } catch (error) {
    console.error('Delete from watchlist error:', error.message);
    sendError(res, { message: 'Server error removing stock from watchlist' });
  }
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  deleteFromWatchlist,
};
