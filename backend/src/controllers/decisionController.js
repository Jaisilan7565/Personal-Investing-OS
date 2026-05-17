const Decision = require('../models/Decision');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all decisions for a logged-in user with pagination
// @route   GET /api/decisions
// @access  Private
const getDecisions = async (req, res) => {
  try {
    // Standard pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const totalResults = await Decision.countDocuments({ user: req.user._id });
    const totalPages = Math.ceil(totalResults / limit);

    const decisions = await Decision.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    sendSuccess(res, {
      message: 'Decision logs retrieved successfully',
      data: decisions,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    });
  } catch (error) {
    console.error('Get decisions error:', error.message);
    sendError(res, { message: 'Server error retrieving decisions' });
  }
};

// @desc    Log a new decision
// @route   POST /api/decisions
// @access  Private
const createDecision = async (req, res) => {
  try {
    const { date, asset, horizon, rationale, conviction, result, sentimentTag, metrics } = req.body;

    const newDecision = await Decision.create({
      user: req.user._id,
      date,
      asset,
      horizon,
      rationale,
      conviction,
      result,
      sentimentTag,
      metrics,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Systematic trade decision logged successfully',
      data: newDecision,
    });
  } catch (error) {
    console.error('Create decision error:', error.message);
    sendError(res, { message: 'Server error creating decision' });
  }
};

// @desc    Update all editable fields of a decision (full edit form)
// @route   PUT /api/decisions/:id
// @access  Private
const updateDecision = async (req, res) => {
  try {
    const { date, asset, horizon, rationale, conviction, sentimentTag, metrics } = req.body;

    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      return sendError(res, { message: 'Decision not found', statusCode: 404 });
    }

    if (decision.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    // Apply every provided field (PUT semantics — caller sends full editable surface)
    if (date !== undefined) decision.date = date;
    if (asset !== undefined) decision.asset = asset;
    if (horizon !== undefined) decision.horizon = horizon;
    if (rationale !== undefined) decision.rationale = rationale;
    if (conviction !== undefined) decision.conviction = conviction;
    if (sentimentTag !== undefined) decision.sentimentTag = sentimentTag;
    if (metrics !== undefined) decision.metrics = metrics;

    const updatedDecision = await decision.save();

    sendSuccess(res, {
      message: 'Decision updated successfully',
      data: updatedDecision,
    });
  } catch (error) {
    console.error('Update decision error:', error.message);
    sendError(res, { message: 'Server error updating decision' });
  }
};

// @desc    Partially update a decision's outcome only (Winner / Loser / Pending)
// @route   PATCH /api/decisions/:id/outcome
// @access  Private
const patchDecisionOutcome = async (req, res) => {
  try {
    const { result } = req.body;

    if (!result || !['Pending', 'Winner', 'Loser'].includes(result)) {
      return sendError(res, {
        message: 'Invalid result value. Must be Pending, Winner, or Loser.',
        statusCode: 400,
      });
    }

    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      return sendError(res, { message: 'Decision not found', statusCode: 404 });
    }

    if (decision.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    decision.result = result;
    const updatedDecision = await decision.save();

    sendSuccess(res, {
      message: `Outcome patched to ${result} successfully`,
      data: updatedDecision,
    });
  } catch (error) {
    console.error('Patch decision outcome error:', error.message);
    sendError(res, { message: 'Server error patching decision outcome' });
  }
};

// @desc    Delete a logged decision
// @route   DELETE /api/decisions/:id
// @access  Private
const deleteDecision = async (req, res) => {
  try {
    const decision = await Decision.findById(req.params.id);

    if (!decision) {
      return sendError(res, { message: 'Decision not found', statusCode: 404 });
    }

    // Ensure it belongs to the user
    if (decision.user.toString() !== req.user._id.toString()) {
      return sendError(res, { message: 'Not authorized', statusCode: 401 });
    }

    await decision.deleteOne();
    sendSuccess(res, { message: 'Decision thesis removed successfully' });
  } catch (error) {
    console.error('Delete decision error:', error.message);
    sendError(res, { message: 'Server error deleting decision' });
  }
};

module.exports = {
  getDecisions,
  createDecision,
  updateDecision,
  patchDecisionOutcome,
  deleteDecision,
};
