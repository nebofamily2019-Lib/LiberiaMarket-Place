const { Review, User, Product, Offer } = require('../models');
const { Op } = require('sequelize');
const { updateTrustScore } = require('../utils/trustScore');

/**
 * Create a new review
 * @route POST /api/reviews
 */
exports.createReview = async (req, res) => {
  try {
    const {
      reviewee_id,
      product_id,
      offer_id,
      rating,
      comment,
      review_type
    } = req.body;
    const reviewer_id = req.user.id;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    // Check if review already exists for this transaction
    if (offer_id) {
      const existingReview = await Review.findOne({
        where: {
          reviewer_id,
          reviewee_id,
          offer_id
        }
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this transaction'
        });
      }
    }

    // Reviews are only allowed for a completed transaction the reviewer
    // actually took part in — no more open/untethered reviews.
    if (!offer_id) {
      return res.status(400).json({
        success: false,
        message: 'A completed transaction is required to leave a review'
      });
    }

    const offer = await Offer.findByPk(offer_id);
    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found'
      });
    }

    if (offer.buyer_id !== reviewer_id && offer.seller_id !== reviewer_id) {
      return res.status(403).json({
        success: false,
        message: 'You cannot review this transaction'
      });
    }

    if (offer.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'You can only review a completed transaction'
      });
    }

    // The reviewee must be the other party in this same transaction
    const expectedReviewee = offer.buyer_id === reviewer_id ? offer.seller_id : offer.buyer_id;
    if (reviewee_id !== expectedReviewee) {
      return res.status(400).json({
        success: false,
        message: 'reviewee_id must be the other party in this transaction'
      });
    }

    // Create review
    const review = await Review.create({
      reviewer_id,
      reviewee_id,
      product_id: product_id || offer.product_id || null,
      offer_id,
      rating,
      comment: comment || null,
      review_type: review_type || 'seller',
      is_verified_purchase: true
    });

    // Update reviewee's average rating + trust score
    await updateUserRating(reviewee_id);
    await updateTrustScore(User, reviewee_id);

    // Fetch complete review data
    const completeReview = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'reviewee',
          attributes: ['id', 'name', 'avg_rating', 'total_reviews']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Review created successfully',
      data: completeReview
    });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating review',
      error: error.message
    });
  }
};

/**
 * Get reviews for a user
 * @route GET /api/reviews/user/:userId
 */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10, review_type } = req.query;
    const offset = (page - 1) * limit;

    const where = {
      reviewee_id: userId,
      is_visible: true
    };

    if (review_type) {
      where.review_type = review_type;
    }

    const { count, rows: reviews } = await Review.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        },
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'title', 'images']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Calculate rating distribution
    const ratingDistribution = await Review.findAll({
      where: { reviewee_id: userId, is_visible: true },
      attributes: [
        'rating',
        [require('../models').sequelize.fn('COUNT', 'id'), 'count']
      ],
      group: ['rating']
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      ratingDistribution,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching reviews',
      error: error.message
    });
  }
};

/**
 * Get reviews for a product
 * @route GET /api/reviews/product/:productId
 */
exports.getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: reviews } = await Review.findAndCountAll({
      where: {
        product_id: productId,
        is_visible: true
      },
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching product reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product reviews',
      error: error.message
    });
  }
};

/**
 * Respond to a review (seller only)
 * @route PUT /api/reviews/:id/respond
 */
exports.respondToReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const userId = req.user.id;

    if (!response || response.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required'
      });
    }

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Only the reviewee can respond
    if (review.reviewee_id !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to reviews about you'
      });
    }

    review.response = response;
    review.responded_at = new Date();
    await review.save();

    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'reviewer',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'reviewee',
          attributes: ['id', 'name']
        }
      ]
    });

    res.json({
      success: true,
      message: 'Response added successfully',
      data: updatedReview
    });
  } catch (error) {
    console.error('Error responding to review:', error);
    res.status(500).json({
      success: false,
      message: 'Error responding to review',
      error: error.message
    });
  }
};

/**
 * Mark review as helpful
 * @route PUT /api/reviews/:id/helpful
 */
exports.markHelpful = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByPk(id);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.helpful_count = (review.helpful_count || 0) + 1;
    await review.save();

    res.json({
      success: true,
      message: 'Review marked as helpful',
      data: { helpful_count: review.helpful_count }
    });
  } catch (error) {
    console.error('Error marking review as helpful:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating review',
      error: error.message
    });
  }
};

/**
 * Helper function to update user's average rating
 */
async function updateUserRating(userId) {
  try {
    const { sequelize } = require('../models');

    const result = await Review.findAll({
      where: {
        reviewee_id: userId,
        is_visible: true
      },
      attributes: [
        [sequelize.fn('AVG', sequelize.col('rating')), 'avg_rating'],
        [sequelize.fn('COUNT', 'id'), 'total_reviews']
      ],
      raw: true
    });

    if (result && result[0]) {
      await User.update(
        {
          avg_rating: parseFloat(result[0].avg_rating).toFixed(2),
          total_reviews: result[0].total_reviews
        },
        { where: { id: userId } }
      );
    }
  } catch (error) {
    console.error('Error updating user rating:', error);
  }
}
