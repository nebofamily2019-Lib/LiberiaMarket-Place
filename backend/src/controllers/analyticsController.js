const { Product, ProductView, User, Category, Favorite, sequelize } = require('../models');
const { Op } = require('sequelize');
const logger = require('../utils/logger');

/**
 * Track product view
 */
const trackProductView = async (productId, userId = null, req) => {
  try {
    // Don't track views from the product owner
    const product = await Product.findByPk(productId);
    if (product && userId && product.seller_id === userId) {
      return; // Don't count owner's views
    }

    let shouldIncrementCount = true;

    // Try to track detailed view analytics (may fail if ProductView table doesn't exist in tests)
    try {
      // Check if user/session has viewed this product recently (within last hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      const existingView = await ProductView.findOne({
        where: {
          product_id: productId,
          created_at: { [Op.gte]: oneHourAgo },
          ...(userId ? { user_id: userId } : { session_id: req.sessionID || req.ip })
        }
      });

      if (existingView) {
        shouldIncrementCount = false; // Already counted this view recently
      } else {
        // Create view record
        await ProductView.create({
          product_id: productId,
          user_id: userId,
          session_id: req.sessionID || null,
          ip_address: req.ip || req.connection.remoteAddress,
          user_agent: req.headers['user-agent'] || null
        });
      }
    } catch (viewError) {
      // ProductView tracking failed (table might not exist in test env), but continue with count increment
      logger.debug('ProductView tracking skipped', { error: viewError.message });
    }

    // Always increment view count (even if detailed tracking fails)
    if (shouldIncrementCount) {
      await Product.increment('view_count', {
        where: { id: productId }
      });

      logger.info('Product view tracked', {
        productId,
        userId,
        sessionId: req.sessionID
      });
    }
  } catch (error) {
    logger.error('Error tracking product view', {
      error: error.message,
      productId
    });
  }
};

/**
 * Get trending products (most viewed in last 7 days)
 * GET /api/analytics/trending
 */
const getTrendingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 12;
    const days = parseInt(req.query.days) || 7;

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    // Get products with most views in the timeframe
    const trendingProducts = await Product.findAll({
      attributes: [
        'id',
        'title',
        'description',
        'price',
        'images',
        'condition',
        'category_id',
        'seller_id',
        'view_count',
        [
          sequelize.literal(`(
            SELECT COUNT(*) FROM product_views
            WHERE product_views.product_id = Product.id
            AND product_views.created_at >= '${dateThreshold.toISOString()}'
          )`),
          'recent_views'
        ]
      ],
      where: {
        status: 'active',
        deleted_at: null
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'rating', 'total_reviews']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [[sequelize.literal('recent_views'), 'DESC']],
      limit
    });

    res.json({
      success: true,
      data: trendingProducts,
      count: trendingProducts.length
    });
  } catch (error) {
    logger.error('Error fetching trending products', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch trending products'
    });
  }
};

/**
 * Get recommended products for a user
 * Based on: favorites, views, and similar products
 * GET /api/analytics/recommendations
 */
const getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 12;

    // Get user's favorite categories and products
    const userFavorites = await Favorite.findAll({
      where: { user_id: userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['category_id']
      }],
      limit: 20
    });

    const favoriteCategoryIds = [...new Set(
      userFavorites
        .map(f => f.product?.category_id)
        .filter(Boolean)
    )];

    // Get user's recently viewed products
    const recentViews = await ProductView.findAll({
      where: { user_id: userId },
      attributes: ['product_id'],
      order: [['created_at', 'DESC']],
      limit: 20
    });

    const viewedProductIds = recentViews.map(v => v.product_id);
    const viewedProducts = await Product.findAll({
      where: { id: viewedProductIds },
      attributes: ['category_id']
    });

    const viewedCategoryIds = [...new Set(
      viewedProducts.map(p => p.category_id)
    )];

    // Combine favorite and viewed categories
    const relevantCategories = [...new Set([
      ...favoriteCategoryIds,
      ...viewedCategoryIds
    ])];

    if (relevantCategories.length === 0) {
      // No user history, return trending products
      return getTrendingProducts(req, res);
    }

    // Get products from relevant categories
    const recommendations = await Product.findAll({
      where: {
        category_id: { [Op.in]: relevantCategories },
        id: { [Op.notIn]: viewedProductIds }, // Exclude already viewed
        seller_id: { [Op.ne]: userId }, // Exclude own products
        status: 'active',
        deleted_at: null
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'rating', 'total_reviews']
        },
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [
        ['view_count', 'DESC'],
        ['created_at', 'DESC']
      ],
      limit
    });

    res.json({
      success: true,
      data: recommendations,
      count: recommendations.length,
      basedOn: {
        favoriteCategories: favoriteCategoryIds.length,
        viewedCategories: viewedCategoryIds.length
      }
    });
  } catch (error) {
    logger.error('Error fetching recommendations', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recommendations'
    });
  }
};

/**
 * Get product analytics (for sellers)
 * GET /api/analytics/product/:id
 */
const getProductAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Only allow seller or admin to view analytics
    const hasRole = req.user.roles?.includes('admin') || req.user.role === 'admin';
    if (product.seller_id !== userId && !hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view analytics for this product'
      });
    }

    // Get view statistics
    const totalViews = await ProductView.count({
      where: { product_id: id }
    });

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const viewsLast7Days = await ProductView.count({
      where: {
        product_id: id,
        created_at: { [Op.gte]: last7Days }
      }
    });

    const last30Days = new Date();
    last30Days.setDate(last30Days.getDate() - 30);

    const viewsLast30Days = await ProductView.count({
      where: {
        product_id: id,
        created_at: { [Op.gte]: last30Days }
      }
    });

    // Get unique viewers
    const uniqueViewers = await ProductView.count({
      where: { product_id: id },
      distinct: true,
      col: 'user_id'
    });

    // Get favorite count
    const favoriteCount = await Favorite.count({
      where: { product_id: id }
    });

    res.json({
      success: true,
      data: {
        product_id: id,
        total_views: totalViews,
        views_last_7_days: viewsLast7Days,
        views_last_30_days: viewsLast30Days,
        unique_viewers: uniqueViewers,
        favorite_count: favoriteCount,
        view_to_favorite_rate: totalViews > 0 ? (favoriteCount / totalViews * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    logger.error('Error fetching product analytics', { error: error.message });
    res.status(500).json({
      success: false,
      error: 'Failed to fetch product analytics'
    });
  }
};

module.exports = {
  trackProductView,
  getTrendingProducts,
  getRecommendations,
  getProductAnalytics
};
