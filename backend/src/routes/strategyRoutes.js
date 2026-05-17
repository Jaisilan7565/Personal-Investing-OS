const express = require('express');
const router = express.Router();
const { getStrategies, createStrategy, updateStrategy, deleteStrategy } = require('../controllers/strategyController');
const { protect } = require('../middleware/authMiddleware');
const { validateBody } = require('../middleware/validateMiddleware');
const { strategySchema } = require('../schemas/zodSchemas');

router
  .route('/')
  .get(protect, getStrategies)
  .post(protect, validateBody(strategySchema), createStrategy);

router
  .route('/:id')
  .put(protect, validateBody(strategySchema.partial()), updateStrategy)
  .delete(protect, deleteStrategy);

module.exports = router;
