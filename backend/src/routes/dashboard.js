const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { User, Product, Category } = require('../models')
const { Op } = require('sequelize')
const { getRecentActivity } = require('../controllers/analyticsController')

// @desc    Get recent activity
// @route   GET /api/dashboard/activity
// @access  Private
router.get('/activity', protect, getRecentActivity)

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
      const [myProducts, activeProducts, pendingProducts, soldProducts] = await Promise.all([
        Product.count({ where: { seller_id: userId } }),
        Product.count({ where: { seller_id: userId, status: 'active' } }),
        Product.count({ where: { seller_id: userId, status: 'pending' } }),
        Product.count({ where: { seller_id: userId, status: 'sold' } })
      ])

      stats = {
        myProducts,
        activeProducts,
        pendingProducts,
        soldProducts,
        totalViews: 0 // Placeholder
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
            created_at: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
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
      order: [['created_at', 'DESC']],
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

    // Build where clause
    const where = { seller_id: userId }

    // Add status filter if provided
    if (req.query.status) {
      where.status = req.query.status
    }

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      limit,
      offset,
      order: [['created_at', 'DESC']],
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
