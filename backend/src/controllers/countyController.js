const { County, Product, User } = require('../models');
const { Op } = require('sequelize');

/**
 * Get all Liberian counties
 * @route GET /api/counties
 */
exports.getAllCounties = async (req, res) => {
  try {
    const counties = await County.findAll({
      attributes: ['id', 'name', 'code', 'capital', 'population', 'coordinates'],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      count: counties.length,
      data: counties
    });
  } catch (error) {
    console.error('Error fetching counties:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching counties',
      error: error.message
    });
  }
};

/**
 * Get a single county by ID
 * @route GET /api/counties/:id
 */
exports.getCountyById = async (req, res) => {
  try {
    const county = await County.findByPk(req.params.id, {
      attributes: ['id', 'name', 'code', 'capital', 'population', 'coordinates']
    });

    if (!county) {
      return res.status(404).json({
        success: false,
        message: 'County not found'
      });
    }

    res.json({
      success: true,
      data: county
    });
  } catch (error) {
    console.error('Error fetching county:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching county',
      error: error.message
    });
  }
};

/**
 * Get products in a specific county
 * @route GET /api/counties/:id/products
 */
exports.getCountyProducts = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20, status = 'active' } = req.query;
    const offset = (page - 1) * limit;

    const { count, rows: products } = await Product.findAndCountAll({
      where: {
        county_id: id,
        status,
        deleted_at: null
      },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'avg_rating', 'total_reviews']
        },
        {
          model: County,
          as: 'county',
          attributes: ['name', 'code']
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
      data: products
    });
  } catch (error) {
    console.error('Error fetching county products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching county products',
      error: error.message
    });
  }
};

/**
 * Get counties with product counts
 * @route GET /api/counties/stats
 */
exports.getCountyStats = async (req, res) => {
  try {
    const { sequelize } = require('../models');

    const counties = await County.findAll({
      attributes: [
        'id',
        'name',
        'code',
        'population',
        [
          sequelize.literal(`(
            SELECT COUNT(*)
            FROM products
            WHERE products.county_id = County.id
            AND products.status = 'active'
            AND products.deleted_at IS NULL
          )`),
          'product_count'
        ]
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: counties
    });
  } catch (error) {
    console.error('Error fetching county stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching county statistics',
      error: error.message
    });
  }
};
