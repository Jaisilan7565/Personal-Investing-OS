const Strategy = require('../models/Strategy');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all strategies for a logged-in user
// @route   GET /api/strategies
// @access  Private
const getStrategies = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 0;

    const filter = { user: req.user._id };

    // 1. Search term: match strategy name or description
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    // 2. Risk Profile Filter
    if (req.query.riskProfile && req.query.riskProfile !== 'all') {
      if (req.query.riskProfile === 'Capital') {
        filter.riskProfile = { $regex: 'Capital|%', $options: 'i' };
      } else {
        filter.riskProfile = { $regex: req.query.riskProfile, $options: 'i' };
      }
    }

    const totalResults = await Strategy.countDocuments(filter);
    let query = Strategy.find(filter).sort({ createdAt: -1 });

    if (limit > 0 && limit < 100000) {
      const skip = (page - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const strategies = await query;
    const totalPages = limit > 0 ? Math.ceil(totalResults / limit) : 1;

    sendSuccess(res, {
      message: 'Strategies retrieved successfully',
      data: strategies,
      pagination: {
        page,
        limit: limit || totalResults,
        totalPages,
        totalResults,
      },
    });
  } catch (error) {
    console.error('Get strategies error:', error.message);
    sendError(res, { message: 'Server error retrieving strategies' });
  }
};

// @desc    Create a new strategy
// @route   POST /api/strategies
// @access  Private
const createStrategy = async (req, res) => {
  try {
    const { name, description, entryRules, exitRules, stopLossRules, riskProfile } = req.body;

    const newStrategy = await Strategy.create({
      user: req.user._id,
      name,
      description,
      entryRules,
      exitRules,
      stopLossRules,
      riskProfile,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Strategy created successfully',
      data: newStrategy,
    });
  } catch (error) {
    console.error('Create strategy error:', error.message);
    sendError(res, { message: 'Server error creating strategy' });
  }
};

// @desc    Update an existing strategy
// @route   PUT /api/strategies/:id
// @access  Private
const updateStrategy = async (req, res) => {
  try {
    const { name, description, entryRules, exitRules, stopLossRules, riskProfile } = req.body;

    let strategy = await Strategy.findOne({ _id: req.params.id, user: req.user._id });

    if (!strategy) {
      return sendError(res, { statusCode: 404, message: 'Strategy not found' });
    }

    strategy.name = name || strategy.name;
    strategy.description = description !== undefined ? description : strategy.description;
    strategy.entryRules = entryRules || strategy.entryRules;
    strategy.exitRules = exitRules || strategy.exitRules;
    strategy.stopLossRules = stopLossRules || strategy.stopLossRules;
    strategy.riskProfile = riskProfile || strategy.riskProfile;

    const updatedStrategy = await strategy.save();

    sendSuccess(res, {
      message: 'Strategy updated successfully',
      data: updatedStrategy,
    });
  } catch (error) {
    console.error('Update strategy error:', error.message);
    sendError(res, { message: 'Server error updating strategy' });
  }
};

// @desc    Delete a strategy
// @route   DELETE /api/strategies/:id
// @access  Private
const deleteStrategy = async (req, res) => {
  try {
    const strategy = await Strategy.findOne({ _id: req.params.id, user: req.user._id });

    if (!strategy) {
      return sendError(res, { statusCode: 404, message: 'Strategy not found' });
    }

    await strategy.deleteOne();

    sendSuccess(res, {
      message: 'Strategy deleted successfully',
    });
  } catch (error) {
    console.error('Delete strategy error:', error.message);
    sendError(res, { message: 'Server error deleting strategy' });
  }
};

module.exports = {
  getStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
};
