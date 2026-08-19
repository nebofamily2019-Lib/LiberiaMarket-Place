const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { createReport } = require('../controllers/reportController');

router.use(protect);

router.route('/')
  .post(createReport);

module.exports = router;
