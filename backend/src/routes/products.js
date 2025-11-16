const express = require('express')
const router = express.Router()
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getUserProducts
} = require('../controllers/productController')
const { protect, authorize, checkOwnership } = require('../middleware/auth')
const { Product } = require('../models')

// Public routes
router.get('/', getProducts)
router.get('/:id', getProduct)
router.get('/user/:userId', getUserProducts)

// Protected routes - authentication required
router.post('/', protect, authorize('seller', 'admin'), createProduct)

// Protected routes - ownership check required
router.put('/:id', protect, checkOwnership(Product, 'id', 'seller_id'), updateProduct)
router.delete('/:id', protect, checkOwnership(Product, 'id', 'seller_id'), deleteProduct)

module.exports = router