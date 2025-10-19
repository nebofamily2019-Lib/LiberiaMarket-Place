const express = require('express')
const {
  getRatings,
  createRating,
  updateRating,
  deleteRating,
  getUserRatings,
  getProductRatings
} = require('../controllers/ratingController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Public routes
router.get('/user/:userId', getUserRatings)
router.get('/product/:productId', getProductRatings)

// Protected routes
router.post('/', protect, createRating)
router.get('/', protect, getRatings)
router.put('/:id', protect, updateRating)
router.delete('/:id', protect, deleteRating)

module.exports = router