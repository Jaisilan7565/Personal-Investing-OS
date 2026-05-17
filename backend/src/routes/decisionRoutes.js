const express = require('express');
const router = express.Router();
const { getDecisions, createDecision, updateDecision, patchDecisionOutcome, deleteDecision } = require('../controllers/decisionController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { decisionSchema } = require('../schemas/zodSchemas');

router
  .route('/')
  .get(protect, getDecisions)
  .post(protect, validateBody(decisionSchema), createDecision);

// Full edit of all fields
router
  .route('/:id')
  .put(protect, updateDecision)
  .delete(protect, deleteDecision);

// Partial update — outcome only (Winner / Loser / Pending)
router
  .route('/:id/outcome')
  .patch(protect, patchDecisionOutcome);

module.exports = router;
