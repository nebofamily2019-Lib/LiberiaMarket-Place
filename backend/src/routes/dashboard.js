const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { User, Product, Category } = require('../models')
const { Op } = require('sequelize')

// @desc    Get dashboard stats for current user
// @route   GET /api/dashboard/stats
// @access  Private
router.get('/stats', protect, async (req, res, next) => {
  try {
    const userId = req.user.id
    const userRole = req.user.role

    let stats = {}

    if (userRole === 'admin') {
      // Admin sees all stats
      const [totalUsers, totalProducts, activeProducts, totalCategories] = await Promise.all([
        User.count(),
        Product.count(),
        Product.count({ where: { status: 'active' } }),
        Category.count({ where: { isActive: true } })
      ])

      stats = {
        totalUsers,
        totalProducts,
        activeProducts,
        totalCategories,
        recentActivity: `${totalProducts} products listed`
      }
    } else if (userRole === 'seller') {
      // Seller sees their own product stats
      const [myProducts, activeProducts, totalViews] = await Promise.all([
        Product.count({ where: { seller_id: userId } }),
        Product.count({ where: { seller_id: userId, status: 'active' } }),
        Promise.resolve(0) // Placeholder for views (implement later)
      ])

      stats = {
        myProducts,
        activeProducts,
        pendingProducts: myProducts - activeProducts,
        totalViews
      }
    } else {
      // Buyer sees general marketplace stats
      const [totalProducts, totalCategories] = await Promise.all([
        Product.count({ where: { status: 'active' } }),
        Category.count({ where: { isActive: true } })
      ])

      stats = {
        totalProducts,
        totalCategories,
        newListings: await Product.count({
          where: {
            status: 'active',
            createdAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }
        })
      }
    }

    res.status(200).json({
      success: true,
      data: stats
    })
  } catch (error) {
    console.error('❌ Dashboard stats error:', error)
    next(error)
  }
})

// @desc    Get recent products for dashboard
// @route   GET /api/dashboard/recent-products
// @access  Private
router.get('/recent-products', protect, async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 5

    const products = await Product.findAll({
      where: { status: 'active' },
      limit,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        }
      ]
    })

    res.status(200).json({
      success: true,
      data: products
    })
  } catch (error) {
    console.error('❌ Recent products error:', error)
    next(error)
  }
})

// @desc    Get user's products (for sellers)
// @route   GET /api/dashboard/my-products
// @access  Private (Seller/Admin)
router.get('/my-products', protect, async (req, res, next) => {
  try {
    const userId = req.user.id
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const offset = (page - 1) * limit

    const { count, rows: products } = await Product.findAndCountAll({
      where: { seller_id: userId },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'icon', 'color']
        }
      ]
    })

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: limit
      }
    })
  } catch (error) {
    console.error('❌ My products error:', error)
    next(error)
  }
})

// @desc    Get user's purchases (for buyers) - Placeholder
// @route   GET /api/dashboard/my-purchases
// @access  Private
router.get('/my-purchases', protect, async (req, res, next) => {
  try {
    // TODO: Implement order/purchase tracking system
    // For now, return empty array as placeholder
    res.status(200).json({
      success: true,
      data: [],
      message: 'Purchase history will be available soon'
    })
  } catch (error) {
    console.error('❌ My purchases error:', error)
    next(error)
  }
})

module.exports = router
