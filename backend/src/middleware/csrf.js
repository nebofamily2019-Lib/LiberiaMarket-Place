const csrf = require('csurf');

// CSRF protection middleware
// Uses cookies to store the CSRF secret
const csrfProtection = csrf({
  cookie: {
    key: 'csrfToken',
    httpOnly: false, // Allow frontend JS to read token
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  }
});

module.exports = csrfProtection;
