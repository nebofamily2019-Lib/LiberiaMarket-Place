const express = require('express')
const router = express.Router()
// CSRF token endpoint for frontend
const csrf = require('csurf');
const csrfProtection = csrf({
  cookie: {
    key: 'csrfToken',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  }
});
router.get('/csrf-token', csrfProtection, (req, res) => {
  res.cookie('csrfToken', req.csrfToken(), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  });
  res.status(200).json({ csrfToken: req.csrfToken() });
});
const rateLimit = require('express-rate-limit')
const {
  register,
  login,
  logout,
  logoutAll,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  sendVerificationCode,
  verifyPhone
} = require('../controllers/authController')
const { protect } = require('../middleware/auth')

// Rate limiter specifically for auth routes
// POC: Relaxed rate limiting for easier testing
const authLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 50, // 50 attempts
  message: 'Too many attempts, please try again after 2 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful requests
  skip: (req) => process.env.NODE_ENV === 'test',
})

// Public routes
router.post('/register', authLimiter, register)
router.post('/login', authLimiter, login)
router.post('/logout', logout)
router.post('/logout-all', protect, logoutAll)
router.post('/forgot-password', authLimiter, forgotPassword)
router.put('/reset-password/:resettoken', resetPassword)

// Protected routes
router.get('/me', protect, getMe) // No rate limiter for /me during POC
router.put('/update-password', protect, updatePassword)
router.post('/send-verification', protect, sendVerificationCode)
router.post('/verify-phone', protect, verifyPhone)

module.exports = router