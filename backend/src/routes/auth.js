const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')
const {
  register,
  login,
  logout,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  verifyPhone
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

// Rate limiter specifically for auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
})

// Public routes
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.post('/forgot-password', authLimiter, forgotPassword)
router.put('/reset-password/:resettoken', resetPassword)

// Protected routes
router.get('/me', protect, getMe)
router.put('/update-password', protect, updatePassword)
router.post('/send-verification', protect, sendVerificationCode)
router.post('/verify-phone', protect, verifyPhone)

module.exports = router