const express = require('express')
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts,
  getProductsByCategory,
  getUserProducts,
  updateProductStatus
} = require('../controllers/productController')
const { protect, optionalAuth } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

// Public routes
router.get('/', optionalAuth, getProducts)
router.get('/search', searchProducts)
router.get('/category/:categoryIdOrSlug', getProductsByCategory)
router.get('/:id', optionalAuth, getProduct)

// Protected routes
router.post('/', protect, upload.single('image'), createProduct)
router.put('/:id', protect, upload.single('image'), updateProduct)
router.delete('/:id', protect, deleteProduct)
router.get('/user/:userId', getUserProducts)
router.patch('/:id/status', protect, updateProductStatus)

module.exports = router