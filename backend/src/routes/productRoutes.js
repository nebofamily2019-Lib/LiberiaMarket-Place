const express = require('express');
const router = express.Router();
const { protect, optionalAuth, authorize, checkOwnership } = require('../middleware/auth');
const { upload, validateUploadedFiles, handleMulterError } = require('../middleware/secureImageUpload');
const { validatePagination } = require('../middleware/inputValidation');
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts
} = require('../controllers/productController');
const { Product, Category, User } = require('../models');

// Public routes - specific routes MUST come before /:id
// Main products listing
router.get('/', validatePagination, getProducts);

// Search products by keyword
router.get('/search', validatePagination, (req, res, next) => {
  if (!req.query.search || req.query.search.trim() === '') {
    return res.status(400).json({
      success: false,
      error: 'Search keyword is required'
    });
  }
  next();
}, getProducts);

// Get products by category
router.get('/category/:categoryId', validatePagination, async (req, res, next) => {
  try {
    const { categoryId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    const where = { category_id: categoryId, status: 'active' };
    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'icon', 'color'] },
        { model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }
      ],
      order: [['createdAt', 'DESC']],
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
router.get('/user/:userId', optionalAuth, validatePagination, getUserProducts);

// Get single product by ID - MUST be last to avoid matching other routes
router.get('/:id', getProduct);

// Protected routes - with secure image upload
router.post(
  '/',
  protect,
  authorize('seller', 'admin'),
  upload.array('images', 5), // Accept up to 5 images (multer)
  validateUploadedFiles, // Security: magic byte validation
  handleMulterError,
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('seller', 'admin'),
  upload.array('images', 5),
  validateUploadedFiles, // Security: magic byte validation
  handleMulterError,
  updateProduct
);

router.delete('/:id', protect, authorize('seller', 'admin'), deleteProduct);

// PATCH /api/products/:id/status - update product status
router.patch('/:id/status', protect, checkOwnership(Product, 'id', 'seller_id'), async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    // Only allow status update by owner or admin
    if (product.seller_id !== req.user.id && !req.user.roles?.includes('admin')) {
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

module.exports = router;
