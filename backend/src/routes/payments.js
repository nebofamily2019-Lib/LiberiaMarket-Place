const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for an accepted offer
 * @access  Private
 */
router.post('/initiate', protect, paymentController.initiatePayment);

/**
 * @route   POST /api/payments/:id/confirm
 * @desc    Confirm payment (buyer confirms they've paid)
 * @access  Private
 */
router.post('/:id/confirm', protect, paymentController.confirmPayment);

/**
 * @route   POST /api/payments/:id/release-escrow
 * @desc    Release escrow (seller confirms delivery)
 * @access  Private
 */
router.post('/:id/release-escrow', protect, paymentController.releaseEscrow);

/**
 * @route   POST /api/payments/:id/refund
 * @desc    Request refund for a payment
 * @access  Private
 */
router.post('/:id/refund', protect, paymentController.requestRefund);

/**
 * @route   GET /api/payments/my-payments
 * @desc    Get user's payment history
 * @access  Private
 */
router.get('/my-payments', protect, paymentController.getMyPayments);

/**
 * @route   GET /api/payments/stats
 * @desc    Get payment statistics for user
 * @access  Private
 */
router.get('/stats', protect, paymentController.getPaymentStats);

/**
 * @route   GET /api/payments/:id
 * @desc    Get payment by ID
 * @access  Private
 */
router.get('/:id', protect, paymentController.getPaymentById);

module.exports = router;
