const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPayment,
  getMyPayments,
  getReceivedPayments,
  confirmPayment
} = require('../controllers/paymentController');

router.post('/', protect, createPayment);
router.get('/my-payments', protect, getMyPayments);
router.get('/received', protect, getReceivedPayments);
router.patch('/:id/confirm', protect, confirmPayment);

module.exports = router;
