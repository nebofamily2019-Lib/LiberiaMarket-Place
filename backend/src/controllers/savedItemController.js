const { SavedItem, Product, User, Category } = require('../models');
const logger = require('../utils/logger');

// @desc    Toggle saved item (save/unsave)
// @route   POST /api/saved-items/:productId
// @access  Private
const toggleSavedItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedItem.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    if (existingSave) {
      // Unsave
      await existingSave.destroy();
      return res.status(200).json({
        success: true,
        saved: false,
        message: 'Item removed from saved items'
      });
    } else {
      // Save
      await SavedItem.create({
        user_id: userId,
        product_id: productId
      });
      return res.status(201).json({
        success: true,
        saved: true,
        message: 'Item added to saved items'
      });
    }
  } catch (error) {
    logger.error('Error toggling saved item:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Get my saved items
// @route   GET /api/saved-items
// @access  Private
const getSavedItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const { count, rows } = await SavedItem.findAndCountAll({
      where: { user_id: userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: User,
              as: 'seller',
              attributes: ['id', 'name', 'phone']
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.status(200).json({
      success: true,
      count,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(count / limit)
      },
      data: rows
    });
  } catch (error) {
    logger.error('Error fetching saved items:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

// @desc    Check if item is saved
// @route   GET /api/saved-items/:productId/check
// @access  Private
const checkSavedStatus = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user.id;

    const savedItem = await SavedItem.findOne({
      where: {
        user_id: userId,
        product_id: productId
      }
    });

    res.status(200).json({
      success: true,
      isSaved: !!savedItem
    });
  } catch (error) {
    logger.error('Error checking saved status:', error);
    res.status(500).json({
      success: false,
      error: 'Server Error'
    });
  }
};

module.exports = {
  toggleSavedItem,
  getSavedItems,
  checkSavedStatus
};
