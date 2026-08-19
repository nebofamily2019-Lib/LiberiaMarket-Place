const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

/**
 * @route   POST /api/reviews
 * @desc    Create a new review
 * @access  Private
 */
router.post('/', protect, reviewController.createReview);

/**
 * @route   GET /api/reviews/user/:userId
 * @desc    Get reviews for a specific user
 * @access  Public
 */
router.get('/user/:userId', reviewController.getUserReviews);

/**
 * @route   GET /api/reviews/product/:productId
 * @desc    Get reviews for a specific product
 * @access  Public
 */
router.get('/product/:productId', reviewController.getProductReviews);

/**
 * @route   PUT /api/reviews/:id/respond
 * @desc    Respond to a review (seller/reviewee only)
 * @access  Private
 */
router.put('/:id/respond', protect, reviewController.respondToReview);

/**
 * @route   PUT /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @access  Public
 */
router.put('/:id/helpful', reviewController.markHelpful);

module.exports = router;
