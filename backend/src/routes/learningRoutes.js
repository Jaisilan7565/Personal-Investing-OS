const express = require('express');
const router = express.Router();
const { getLearningProgress, updateLearningProgress } = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { learningSchema } = require('../schemas/zodSchemas');

router
  .route('/')
  .get(protect, getLearningProgress)
  .post(protect, validateBody(learningSchema), updateLearningProgress);

module.exports = router;
