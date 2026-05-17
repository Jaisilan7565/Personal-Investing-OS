const Journal = require('../models/Journal');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all journal entries for a logged-in user with pagination
// @route   GET /api/journals
// @access  Private
const getJournals = async (req, res) => {
  try {
    // Standard pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalResults = await Journal.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalResults / limit);

    const journals = await Journal.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccess(res, {
      message: 'Journal entries retrieved successfully',
      data: journals,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    });
  } catch (error) {
    console.error('Get journals error:', error.message);
    sendError(res, { message: 'Server error retrieving journals' });
  }
};

// @desc    Create a new journal entry
// @route   POST /api/journals
// @access  Private
const createJournal = async (req, res) => {
  try {
    const { date, marketSentiment, stressLevel, focusLevel, thoughts, tags, biasesChecked } = req.body;

    const newJournal = await Journal.create({
      user: req.user._id,
      date,
      marketSentiment,
      stressLevel,
      focusLevel,
      thoughts,
      tags,
      biasesChecked,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Journal entry audited successfully',
      data: newJournal,
    });
  } catch (error) {
    console.error('Create journal error:', error.message);
    sendError(res, { message: 'Server error creating journal entry' });
  }
};

// @desc    Delete a journal entry
// @route   DELETE /api/journals/:id
// @access  Private
const deleteJournal = async (req, res) => {
  try {
    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return sendError(res, { message: 'Journal entry not found', statusCode: 404 });
    }

    // Ensure the entry belongs to the user
    if (journal.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    await journal.deleteOne();
    sendSuccess(res, { message: 'Journal entry removed successfully' });
  } catch (error) {
    console.error('Delete journal error:', error.message);
    sendError(res, { message: 'Server error deleting journal entry' });
  }
};

// @desc    Update a journal entry
// @route   PUT /api/journals/:id
// @access  Private
const updateJournal = async (req, res) => {
  try {
    const { date, marketSentiment, stressLevel, focusLevel, thoughts, tags, biasesChecked } = req.body;

    const journal = await Journal.findById(req.params.id);

    if (!journal) {
      return sendError(res, { message: 'Journal entry not found', statusCode: 404 });
    }

    // Ensure it belongs to the user
    if (journal.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    if (date !== undefined) journal.date = date;
    if (marketSentiment !== undefined) journal.marketSentiment = marketSentiment;
    if (stressLevel !== undefined) journal.stressLevel = stressLevel;
    if (focusLevel !== undefined) journal.focusLevel = focusLevel;
    if (thoughts !== undefined) journal.thoughts = thoughts;
    if (tags !== undefined) journal.tags = tags;
    if (biasesChecked !== undefined) journal.biasesChecked = biasesChecked;

    const updatedJournal = await journal.save();

    sendSuccess(res, {
      message: 'Journal entry updated successfully',
      data: updatedJournal,
    });
  } catch (error) {
    console.error('Update journal error:', error.message);
    sendError(res, { message: 'Server error updating journal entry' });
  }
};

module.exports = {
  getJournals,
  createJournal,
  deleteJournal,
  updateJournal,
};
