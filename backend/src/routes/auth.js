const express = require('express')
const {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

const router = express.Router()

// Debug middleware to log all auth requests
router.use((req, res, next) => {
  console.log(`[AUTH ROUTE] ${req.method} ${req.path}`)
  next()
})

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/logout', logout)
router.post('/forgot-password', forgotPassword)
router.put('/reset-password/:resettoken', resetPassword)

// Protected routes
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)

module.exports = router