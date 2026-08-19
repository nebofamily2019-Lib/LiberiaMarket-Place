const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  toggleSavedItem,
  getSavedItems,
  checkSavedStatus
} = require('../controllers/savedItemController');

router.use(protect); // All routes are protected

router.route('/')
  .get(getSavedItems);

router.route('/:productId')
  .post(toggleSavedItem);

router.route('/:productId/check')
  .get(checkSavedStatus);

module.exports = router;
