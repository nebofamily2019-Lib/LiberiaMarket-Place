const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts,
  markAsSold,
  getSellerStats,
  renewProduct // Import renewProduct
} = require('../controllers/productController')
const { protect, optionalAuth, authorize, checkOwnership } = require('../middleware/auth')
const { validateProduct, validatePagination, sanitizeBody } = require('../middleware/inputValidation')
const { upload, handleMulterError, validateUploadedFiles } = require('../middleware/secureImageUpload')
const { Product } = require('../models')

// Apply sanitization to all routes
router.use(sanitizeBody)

// Public routes - specific routes MUST come before /:id
router.get('/', optionalAuth, validatePagination, getProducts)
// Search products by keyword
router.get('/search', optionalAuth, validatePagination, (req, res, next) => {
  if (!req.query.search || req.query.search.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Search keyword is required'
    });
  }
  next();
}, require('../controllers/productController').getProducts)
// Get products by category
router.get('/category/:categoryId', validatePagination, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const where = { category_id: categoryId, status: 'active' };
    const { Product, Category, User } = require('../models');
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
      distinct: true
    });
    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        page,
        limit,
        total: count,
        pages: Math.ceil(count / limit)
      },
      data: products
    });
  } catch (error) {
    next(error);
  }
});
// Get products by user (optional auth to check if requester is owner)
router.get('/user/:userId', optionalAuth, validatePagination, getUserProducts)

// Get seller stats
router.get('/stats/seller', protect, authorize('seller', 'admin'), getSellerStats)

// Renew product (Seller only)
router.post('/:id/renew', protect, renewProduct)

router.get('/:id', optionalAuth, getProduct)

// Protected routes - authentication required
router.post('/', protect, authorize('seller', 'admin'), upload.array('images', 5), handleMulterError, validateUploadedFiles, validateProduct, createProduct)

// Protected routes - ownership check required
router.post('/:id/sold', protect, checkOwnership(Product, 'id', 'seller_id'), markAsSold)
router.put('/:id', protect, checkOwnership(Product, 'id', 'seller_id'), upload.array('images', 5), handleMulterError, validateUploadedFiles, validateProduct, updateProduct)
router.delete('/:id', protect, checkOwnership(Product, 'id', 'seller_id'), deleteProduct)
// PATCH /api/products/:id/status - update product status
router.patch('/:id/status', protect, checkOwnership(Product, 'id', 'seller_id'), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    // Only allow status update by owner or admin
    if (product.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update status' });
    }
    const validStatuses = ['active', 'sold', 'inactive', 'pending'];
    const { status } = req.body;
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    await product.update({ status });
    res.status(200).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
});

module.exports = router