const express = require('express')
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getUserProfile,
  updateUserProfile,
  updatePaymentPreferences,
  uploadUserAvatar
} = require('../controllers/userController')
const { protect, authorize } = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = express.Router()

// Protected routes - require authentication
router.get('/profile', protect, getUserProfile)
router.put('/profile', protect, updateUserProfile)
router.put('/payment-preferences', protect, updatePaymentPreferences)
router.post('/avatar', protect, upload.single('avatar'), uploadUserAvatar)

// Admin routes
router.get('/', protect, authorize('admin'), getUsers)
router.get('/:id', protect, authorize('admin'), getUser)
router.put('/:id', protect, authorize('admin'), updateUser)
router.delete('/:id', protect, authorize('admin'), deleteUser)

module.exports = router