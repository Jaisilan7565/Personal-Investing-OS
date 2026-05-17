const express = require('express');
const router = express.Router();
const { getAiMentorFeedback } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/mentor', protect, getAiMentorFeedback);

module.exports = router;
