const express = require('express');
const router = express.Router();
const { getWatchlist, addToWatchlist, deleteFromWatchlist } = require('../controllers/watchlistController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { watchlistSchema } = require('../schemas/zodSchemas');

router
  .route('/')
  .get(protect, getWatchlist)
  .post(protect, validateBody(watchlistSchema), addToWatchlist);

router.route('/:id').delete(protect, deleteFromWatchlist);

module.exports = router;
