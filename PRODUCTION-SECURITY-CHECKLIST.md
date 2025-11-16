# 🔒 Production Security Deployment Checklist

## Pre-Deployment Security Verification

### 1. Environment Variables
- [ ] `NODE_ENV=production` set in backend
- [ ] `JWT_SECRET` is strong (minimum 32 characters)
- [ ] `JWT_COOKIE_EXPIRE` set appropriately (default: 7 days)
- [ ] No hardcoded secrets in code
- [ ] `.env` file in `.gitignore`

### 2. HTTPS Configuration
- [ ] SSL/TLS certificate installed
- [ ] All routes use HTTPS (no HTTP)
- [ ] `Secure` flag enabled on cookies (automatic in production)
- [ ] HSTS header configured
- [ ] Certificate auto-renewal configured

### 3. Cookie Security
- [ ] `httpOnly: true` (prevents JavaScript access)
- [ ] `secure: true` (HTTPS only)
- [ ] `sameSite: 'strict'` (CSRF protection)
- [ ] Appropriate cookie expiration time
- [ ] Cookie domain correctly set

### 4. CORS Configuration
- [ ] Only production domain in `origin`
- [ ] `credentials: true` enabled
- [ ] No wildcard (`*`) in production
- [ ] Proper methods and headers specified

### 5. Authentication Flow
- [ ] No tokens in response body
- [ ] No tokens in localStorage/sessionStorage
- [ ] Auth middleware validates cookies
- [ ] Protected routes use `protect` middleware
- [ ] Role checks use `authorize` middleware
- [ ] Ownership checks use `checkOwnership` middleware

### 6. Database Security
- [ ] Database credentials not in code
- [ ] Connection uses SSL/TLS
- [ ] Prepared statements prevent SQL injection
- [ ] Password hashing with bcrypt (salt rounds >= 10)
- [ ] User data properly sanitized

### 7. API Security
- [ ] Rate limiting enabled
- [ ] Request size limits configured
- [ ] Input validation on all endpoints
- [ ] Error messages don't leak sensitive info
- [ ] API versioning in place

### 8. Frontend Security
- [ ] No sensitive data in frontend code
- [ ] `withCredentials: true` in axios
- [ ] CSP (Content Security Policy) headers
- [ ] XSS protection enabled
- [ ] Dependencies up to date (no vulnerabilities)

## Deployment Steps

### Step 1: Update Environment
```bash
# Backend .env
NODE_ENV=production
JWT_SECRET=your-production-secret-min-32-chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
FRONTEND_URL=https://yourdomain.com
DATABASE_URL=your-production-db-url
```

### Step 2: Update CORS
```javascript
// backend/src/server.js
app.use(cors({
  origin: process.env.FRONTEND_URL, // https://yourdomain.com
  credentials: true
}))
```

### Step 3: Verify Cookie Configuration
```javascript
// backend/src/controllers/authController.js
const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // ✅ true in production
  sameSite: 'strict',
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
}
```

### Step 4: Deploy Backend
- [ ] Build backend
- [ ] Run database migrations
- [ ] Start server with production env
- [ ] Verify HTTPS works
- [ ] Test health endpoint

### Step 5: Deploy Frontend
- [ ] Update API base URL to production
- [ ] Build frontend
- [ ] Deploy to CDN/hosting
- [ ] Verify HTTPS works
- [ ] Test cookie functionality

### Step 6: Post-Deployment Testing
- [ ] Register new user
- [ ] Verify httpOnly cookie set
- [ ] Login with credentials
- [ ] Access protected routes
- [ ] Create/update resources
- [ ] Logout and verify cookie cleared
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

## Security Monitoring

### Ongoing Checks
- [ ] Monitor failed login attempts
- [ ] Track token expiration issues
- [ ] Watch for unauthorized access attempts
- [ ] Review error logs regularly
- [ ] Keep dependencies updated
- [ ] Renew SSL certificates
- [ ] Audit user permissions

### Security Headers (Add to server)
```javascript
// Helmet.js for security headers
const helmet = require('helmet')
app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:']
    }
  }
}))
```

## Incident Response Plan

### If Token Leak Detected:
1. Invalidate all tokens immediately
2. Force all users to re-login
3. Review auth logs
4. Patch vulnerability
5. Notify affected users

### If Database Breach:
1. Isolate database
2. Change all credentials
3. Review access logs
4. Notify users
5. Implement additional security measures

## Compliance Checklist
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy
- [ ] User consent for cookies
- [ ] Privacy policy updated
- [ ] Terms of service updated
- [ ] Security audit completed
- [ ] Penetration testing done

## Success Criteria
✅ All tests passing
✅ HTTPS enforced everywhere
✅ Cookies secure and httpOnly
✅ No sensitive data exposure
✅ Protected routes working
✅ Authorization verified
✅ Logout clears cookies
✅ No security warnings in browser
✅ SSL certificate valid
✅ Rate limiting active

---

**Last Updated:** [Current Date]
**Security Audit By:** [Your Name]
**Next Review:** [30 days from now]
