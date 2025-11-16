# 🔒 LibMarket API - Security Documentation

## Critical Security Requirements

### JWT_SECRET Configuration

**The JWT_SECRET is the MOST CRITICAL security variable.**

#### Requirements:
- ✅ Minimum 64 characters (128+ recommended)
- ✅ Cryptographically random
- ✅ Unique per environment
- ✅ NEVER committed to Git

#### Generation:

```bash
# Node.js (Recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# OpenSSL
openssl rand -hex 64

# PowerShell
[System.Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

#### ❌ NEVER Use:
```bash
JWT_SECRET=mysecret                    # Too short
JWT_SECRET=libmarket2024               # Predictable
JWT_SECRET=your-secret-key-here        # Default value
```

---

## Current Security Features

### ✅ Implemented:
- **HttpOnly Cookies** - Prevents XSS token theft
- **Bcrypt Hashing** - 10 salt rounds for passwords
- **Helmet.js** - Security headers (CSP, XSS)
- **Rate Limiting** - 100 requests/15min, 5 auth attempts/15min
- **XSS Protection** - Input sanitization with `xss-clean`
- **Input Validation** - Phone, email, color validation
- **CORS Configuration** - Whitelisted origins only
- **Sequelize ORM** - SQL injection prevention

### ⚠️ Recommended Improvements:
1. Stronger password policy (8+ chars, complexity requirements)
2. Shorter token expiry (15min with refresh tokens)
3. 2FA for admin accounts
4. Audit logging for sensitive operations
5. Password reset token expiry (currently missing)

---

## Production Deployment Checklist

### Before Going Live:

- [ ] **Secrets**
  - [ ] JWT_SECRET is 64+ random characters
  - [ ] Database password is 20+ characters
  - [ ] All default values changed
  - [ ] Secrets stored in AWS Secrets Manager/Azure Key Vault

- [ ] **Database**
  - [ ] PostgreSQL configured
  - [ ] SSL/TLS enabled
  - [ ] Regular backups configured
  - [ ] Non-root user created

- [ ] **Application**
  - [ ] NODE_ENV=production
  - [ ] HTTPS enabled
  - [ ] CORS_ORIGIN set to production domain
  - [ ] Error messages don't leak info
  - [ ] npm audit shows 0 vulnerabilities

- [ ] **Infrastructure**
  - [ ] Firewall configured
  - [ ] DDoS protection enabled
  - [ ] CDN configured (Cloudflare)
  - [ ] Monitoring enabled (Sentry)

---

## Security Best Practices

### Password Policy (To Implement):
```javascript
const PASSWORD_REQUIREMENTS = {
  minLength: 8,                    // Current: 6
  requireUppercase: true,          // Not implemented
  requireNumbers: true,            // Not implemented
  requireSpecialChars: true,       // Not implemented
  maxAge: 90, // days              // Not implemented
};
```

### Token Expiry (Recommended):
```javascript
const TOKEN_EXPIRY = {
  accessToken: '15m',    // Short-lived
  refreshToken: '7d',    // Long-lived
  resetToken: '1h',      // Password reset
};
```

---

## Vulnerability Reporting

Report security issues to: **security@libmarket.com**

**Do NOT:**
- ❌ Post publicly before disclosure
- ❌ Exploit vulnerabilities
- ❌ Access user data

**Response Timeline:**
- Acknowledge: 24 hours
- Fix critical issues: 7 days
- Credit researchers (with permission)

---

## Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security](https://expressjs.com/en/advanced/best-practice-security.html)

---

**Last Updated**: 2025-01-16  
**Review Cycle**: Quarterly
