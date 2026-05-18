const express = require('express');
const router = express.Router();
const {
  getLearningProgress,
  updateLearningProgress,
  generateAILesson,
  getAILesson,
  syncLessonToDrive,
} = require('../controllers/learningController');
const { protect } = require('../middleware/authMiddleware');

// General progress and manual updates
router
  .route('/')
  .get(protect, getLearningProgress)
  .post(protect, updateLearningProgress);

// Dynamic lesson generation, retrieval, and backups
router.post('/generate', protect, generateAILesson);
router.get('/lesson/:topic', protect, getAILesson);
router.post('/sync-drive', protect, syncLessonToDrive);

module.exports = router;
