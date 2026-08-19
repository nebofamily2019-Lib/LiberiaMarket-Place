const logger = require('../utils/logger');
const { Product, UserActivity } = require('../models');

const trackProductView = async (productId, userId, req) => {
  try {
    // Increment view count
    await Product.increment('view_count', { where: { id: productId } });
    
    if (userId) {
      await UserActivity.create({
        user_id: userId,
        activity_type: 'view_product',
        entity_id: productId,
        details: {
          ip: req.ip,
          userAgent: req.get('User-Agent')
        }
      });
    }

    return true;
  } catch (error) {
    logger.error('Error tracking product view:', error);
    return false;
  }
};

const getRecentActivity = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 10;

    const activities = await UserActivity.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });

    // Enrich activities with product details if needed
    // This is a simple implementation. For production, use proper associations or batch loading.
    const enrichedActivities = await Promise.all(activities.map(async (activity) => {
      const act = activity.toJSON();
      if (['view_product', 'listed_product', 'sold_product'].includes(act.activity_type) && act.entity_id) {
        const product = await Product.findByPk(act.entity_id, {
          attributes: ['id', 'title', 'price', 'images']
        });
        if (product) {
          act.product = product;
        }
      }
      return act;
    }));

    res.status(200).json({
      success: true,
      data: enrichedActivities
    });
  } catch (error) {
    logger.error('Error fetching recent activity:', error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};

module.exports = {
  trackProductView,
  getRecentActivity
};
