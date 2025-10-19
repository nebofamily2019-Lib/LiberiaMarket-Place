const { Rating, User } = require('../models');
const { Op } = require('sequelize');

// @desc    Get all ratings (for current user)
// @route   GET /api/ratings
// @access  Private
const getRatings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get ratings where current user is either rater or rated
    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: {
        [Op.or]: [
          { rater_id: req.user.id },
          { rated_user_id: req.user.id }
        ],
        isHidden: false
      },
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'phone', 'avatar']
        },
        {
          model: User,
          as: 'ratedUser',
          attributes: ['id', 'name', 'phone', 'avatar']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    res.status(200).json({
      success: true,
      count: ratings.length,
      total: count,
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: ratings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings for a specific user
// @route   GET /api/ratings/user/:userId
// @access  Public
const getUserRatings = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: ratings } = await Rating.findAndCountAll({
      where: {
        rated_user_id: req.params.userId,
        isHidden: false
      },
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'phone', 'avatar']
        },
        {
          model: User,
          as: 'ratedUser',
          attributes: ['id', 'name', 'phone', 'avatar']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']],
      distinct: true
    });

    // Calculate average rating
    const allRatings = await Rating.findAll({
      where: {
        rated_user_id: req.params.userId,
        isHidden: false
      },
      attributes: ['rating']
    });

    const avgRating = allRatings.length > 0
      ? (allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length).toFixed(1)
      : 0;

    res.status(200).json({
      success: true,
      count: ratings.length,
      total: count,
      averageRating: parseFloat(avgRating),
      pagination: {
        page,
        limit,
        pages: Math.ceil(count / limit)
      },
      data: ratings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ratings for a specific product (via seller)
// @route   GET /api/ratings/product/:productId
// @access  Public
// NOTE: This is a placeholder - actual implementation depends on your business logic
// Currently ratings are user-to-user, not product-specific
const getProductRatings = async (req, res, next) => {
  try {
    // TODO: Implement product-specific ratings if needed
    // For now, return ratings for the product's seller
    const { Product } = require('../models');

    const product = await Product.findByPk(req.params.productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Get seller's ratings
    const ratings = await Rating.findAll({
      where: {
        rated_user_id: product.seller_id,
        isHidden: false
      },
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'phone', 'avatar']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 10
    });

    res.status(200).json({
      success: true,
      message: 'Showing seller ratings for this product',
      count: ratings.length,
      data: ratings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new rating
// @route   POST /api/ratings
// @access  Private
const createRating = async (req, res, next) => {
  try {
    const { rated_user_id, rating, review, isAnonymous } = req.body;

    // Validation
    if (!rated_user_id || !rating) {
      return res.status(400).json({
        success: false,
        error: 'Please provide rated_user_id and rating'
      });
    }

    // Prevent self-rating
    if (rated_user_id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'You cannot rate yourself'
      });
    }

    // Check if rated user exists
    const ratedUser = await User.findByPk(rated_user_id);
    if (!ratedUser) {
      return res.status(404).json({
        success: false,
        error: 'User to be rated not found'
      });
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({
      where: {
        rater_id: req.user.id,
        rated_user_id
      }
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        error: 'You have already rated this user. Use update endpoint to modify your rating.'
      });
    }

    // Create rating
    const newRating = await Rating.create({
      rater_id: req.user.id,
      rated_user_id,
      rating,
      review,
      isAnonymous: isAnonymous || false,
      isVerified: false, // Admin can verify later
      isHidden: false
    });

    // Fetch with associations
    const createdRating = await Rating.findByPk(newRating.id, {
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'phone', 'avatar']
        },
        {
          model: User,
          as: 'ratedUser',
          attributes: ['id', 'name', 'phone', 'avatar']
        }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Rating created successfully',
      data: createdRating
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update rating
// @route   PUT /api/ratings/:id
// @access  Private (Owner only)
const updateRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByPk(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    // Check ownership
    if (rating.rater_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update this rating'
      });
    }

    const allowedFields = ['rating', 'review', 'isAnonymous'];
    const updates = {};

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Admin-only fields
    if (req.user.role === 'admin') {
      if (req.body.isVerified !== undefined) updates.isVerified = req.body.isVerified;
      if (req.body.isHidden !== undefined) updates.isHidden = req.body.isHidden;
    }

    await rating.update(updates);

    const updatedRating = await Rating.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'rater',
          attributes: ['id', 'name', 'phone', 'avatar']
        },
        {
          model: User,
          as: 'ratedUser',
          attributes: ['id', 'name', 'phone', 'avatar']
        }
      ]
    });

    res.status(200).json({
      success: true,
      message: 'Rating updated successfully',
      data: updatedRating
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete rating
// @route   DELETE /api/ratings/:id
// @access  Private (Owner/Admin only)
const deleteRating = async (req, res, next) => {
  try {
    const rating = await Rating.findByPk(req.params.id);

    if (!rating) {
      return res.status(404).json({
        success: false,
        error: 'Rating not found'
      });
    }

    // Check ownership
    if (rating.rater_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to delete this rating'
      });
    }

    await rating.destroy();

    res.status(200).json({
      success: true,
      message: 'Rating deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRatings,
  createRating,
  updateRating,
  deleteRating,
  getUserRatings,
  getProductRatings
};