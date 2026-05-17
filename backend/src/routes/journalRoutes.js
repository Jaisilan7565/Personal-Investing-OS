const express = require('express');
const router = express.Router();
const { getJournals, createJournal, deleteJournal, updateJournal } = require('../controllers/journalController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { journalSchema } = require('../schemas/zodSchemas');

router
  .route('/')
  .get(protect, getJournals)
  .post(protect, validateBody(journalSchema), createJournal);

router
  .route('/:id')
  .put(protect, updateJournal)
  .delete(protect, deleteJournal);

module.exports = router;
