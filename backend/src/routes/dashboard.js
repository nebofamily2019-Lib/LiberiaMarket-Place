const express = require('express')
const router = express.Router()
const { protect, authorize } = require('../middleware/auth')
const { User, Product, Category, Offer } = require('../models')
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
    const stats = {}

    if (req.user.hasRole('admin')) {
      const [totalUsers, totalProducts, activeProducts, totalCategories] = await Promise.all([
        User.count(),
        Product.count(),
        Product.count({ where: { status: 'active' } }),
        Category.count({ where: { isActive: true } })
      ])

      stats.admin = { totalUsers, totalProducts, activeProducts, totalCategories }
    }

    // A user can hold both roles at once, so check independently rather than
    // branching on a single primary role — otherwise a seller's buyer stats
    // (or vice versa) silently never load.
    if (req.user.hasRole('seller')) {
      const [myProducts, activeProducts, pendingProducts, soldProducts, pendingOffers] = await Promise.all([
        Product.count({ where: { seller_id: userId } }),
        Product.count({ where: { seller_id: userId, status: 'active' } }),
        Product.count({ where: { seller_id: userId, status: 'pending' } }),
        Product.count({ where: { seller_id: userId, status: 'sold' } }),
        Offer.count({ where: { seller_id: userId, status: 'pending' } })
      ])

      stats.seller = { myProducts, activeProducts, pendingProducts, soldProducts, pendingOffers }
    }

    if (req.user.hasRole('buyer')) {
      const [activeOffers, awaitingYourResponse, purchases] = await Promise.all([
        Offer.count({ where: { buyer_id: userId, status: ['pending', 'countered'] } }),
        Offer.count({ where: { buyer_id: userId, status: 'countered' } }),
        Offer.count({ where: { buyer_id: userId, status: 'completed' } })
      ])

      stats.buyer = { activeOffers, awaitingYourResponse, purchases }
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

// @desc    Get user's purchases (for buyers)
// @route   GET /api/dashboard/my-purchases
// @access  Private
router.get('/my-purchases', protect, async (req, res, next) => {
  try {
    const userId = req.user.id
    const limit = parseInt(req.query.limit) || 20

    const completedOffers = await Offer.findAll({
      where: { buyer_id: userId, status: 'completed' },
      limit,
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Product,
          as: 'offerProduct',
          attributes: ['id', 'title', 'images', 'sold_price', 'sold_at']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone']
        }
      ]
    })

    const purchases = completedOffers.map(offer => ({
      id: offer.id,
      product: offer.offerProduct
        ? { id: offer.offerProduct.id, title: offer.offerProduct.title, images: offer.offerProduct.images }
        : null,
      seller: offer.seller ? { id: offer.seller.id, name: offer.seller.name, phone: offer.seller.phone } : null,
      amount: offer.offerProduct?.sold_price ?? offer.counter_amount ?? offer.offer_amount,
      currency: offer.counter_currency || offer.currency,
      createdAt: offer.offerProduct?.sold_at || offer.updatedAt
    }))

    res.status(200).json({
      success: true,
      data: purchases
    })
  } catch (error) {
    console.error('❌ My purchases error:', error)
    next(error)
  }
})

module.exports = router
