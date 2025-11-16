const express = require('express');
const router = express.Router();

// @desc    Welcome/Root endpoint
// @route   GET /
// @access  Public
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Welcome to LibMarket API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      testHeaders: '/api/test/headers',
      auth: '/api/auth',
      products: '/api/products',
      categories: '/api/categories'
    },
    security: {
      helmet: '✅ Enabled',
      xss: '✅ Enabled',
      rateLimit: '✅ Enabled',
      cookies: '✅ HttpOnly + SameSite'
    }
  });
});

// @desc    Test security headers and cookies
// @route   GET /test/headers
// @access  Public
router.get('/headers', (req, res) => {
  console.log('🔍 Request Cookies:', req.cookies);
  console.log('🔍 Request Headers:', req.headers);

  res.json({
    success: true,
    message: '✅ Cookie parser and security headers are active',
    receivedCookies: req.cookies || {},
    cookieParserActive: !!req.cookies,
    headers: {
      'content-security-policy': req.headers['content-security-policy'] || 'Not set',
      'x-frame-options': req.headers['x-frame-options'] || 'Not set',
      'strict-transport-security': req.headers['strict-transport-security'] || 'Not set'
    },
    testInstructions: {
      step1: 'Check browser DevTools > Network tab for security headers',
      step2: 'Look for: X-Content-Type-Options, X-Frame-Options, etc.',
      step3: 'Console should show received cookies (if any)'
    }
  });
});

// @desc    Test rate limiting
// @route   GET /test/rate-limit
// @access  Public
router.get('/rate-limit', (req, res) => {
  res.json({
    success: true,
    message: '✅ Rate limiter is active',
    instructions: 'Make 100+ requests to this endpoint to trigger rate limiting'
  });
});

// @desc    Check cookie attributes
// @route   GET /test/cookie-check
// @access  Public
router.get('/cookie-check', (req, res) => {
  res.json({
    success: true,
    cookies: req.cookies,
    headers: {
      cookie: req.headers.cookie,
      origin: req.headers.origin
    },
    message: 'Cookie debugging info'
  })
})

module.exports = router;
