const express = require('express')
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController')
const { protect, authorize, optionalAuth } = require('../middleware/auth')

const router = express.Router()

// Public routes (with optional auth for admin features)
router.get('/', optionalAuth, getCategories)
router.get('/:idOrSlug', optionalAuth, getCategory)

// Admin only routes
router.post('/', protect, authorize('admin'), createCategory)
router.put('/:id', protect, authorize('admin'), updateCategory)
router.delete('/:id', protect, authorize('admin'), deleteCategory)

module.exports = router