const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUserProfile, clearUserData } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { registerSchema, loginSchema } = require('../schemas/zodSchemas');

router.post('/register', validateBody(registerSchema), registerUser);
router.post('/login', validateBody(loginSchema), loginUser);
router.get('/profile', protect, getUserProfile);
router.delete('/clear', protect, clearUserData);

module.exports = router;
