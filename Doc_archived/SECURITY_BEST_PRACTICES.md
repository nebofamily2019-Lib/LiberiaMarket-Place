# 🛡️ Security Best Practices - Liberia Marketplace

**For Developers Working on This Project**

---

## 🚨 **NEVER Commit These Files**

### Absolutely Forbidden
```
.env
.env.local
.env.development
.env.production
.env.test
*.sqlite
*.db
*.sqlite3
node_modules/
uploads/
logs/
```

### How to Check Before Committing
```bash
# Always run before committing:
git status

# If you see any of the above files, DO NOT COMMIT!
# Remove them from staging:
git reset HEAD .env
```

---

## ✅ **Automated Protection (Installed)**

### Pre-Commit Hook
**Location:** `.git/hooks/pre-commit`

**What It Does:**
- ✅ Blocks `.env` files automatically
- ✅ Scans for JWT_SECRET patterns
- ✅ Detects API keys and tokens
- ✅ Prevents database files
- ✅ Warns about large files
- ✅ Blocks node_modules

**To bypass (emergency only):**
```bash
git commit --no-verify  # ⚠️ Use with extreme caution!
```

### Environment Validation
**Script:** `backend/scripts/validate-env.js`

**Runs automatically before:**
- `npm start`
- `npm run dev`

**Or run manually:**
```bash
cd backend
npm run validate:env
```

**Checks:**
- Required variables set
- JWT_SECRET strength (64+ chars)
- No default/example values
- Database configuration
- Production-specific settings

---

## 🔐 **Secrets Management**

### JWT_SECRET

**❌ NEVER:**
```javascript
// DON'T hardcode in code
const JWT_SECRET = 'my-secret-key';
```

**✅ ALWAYS:**
```javascript
// Use from environment
const JWT_SECRET = process.env.JWT_SECRET;
```

**Generate Strong Secrets:**
```bash
# Generate 64-character hex secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate 32-character base64 secret
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Database Credentials

**For SQLite (Development):**
```env
DB_DIALECT=sqlite
DB_STORAGE=./database.sqlite
```

**For PostgreSQL (Production):**
```env
DB_DIALECT=postgres
DB_HOST=your-database-host.com
DB_PORT=5432
DB_NAME=libmarket_production
DB_USER=libmarket_app
DB_PASSWORD=STRONG_RANDOM_PASSWORD_HERE_64_CHARS_MIN
```

**Password Requirements:**
- Minimum 20 characters
- Mix of uppercase, lowercase, numbers, symbols
- Never use: `password`, `admin`, `postgres`, `123456`

---

## 📝 **Git Workflow (Safe)**

### Before Making Changes
```bash
# 1. Pull latest
git pull origin main

# 2. Create feature branch
git checkout -b feature/your-feature-name
```

### Before Committing
```bash
# 1. Check what you're committing
git status
git diff

# 2. Stage files (pre-commit hook will scan)
git add .

# 3. Commit (validation runs automatically)
git commit -m "feat: your feature description"

# If pre-commit hook fails:
# - Review the errors
# - Fix the issues
# - Try again
```

### Before Pushing
```bash
# 1. Make sure repo is PRIVATE
# Check at: https://github.com/nebofamily2019-Lib/LiberiaMarket-Place/settings

# 2. Push to your branch
git push origin feature/your-feature-name

# 3. Create Pull Request on GitHub
```

---

## 🔍 **Code Review Checklist**

### Before Submitting PR

- [ ] No `.env` files in commit
- [ ] No hardcoded secrets in code
- [ ] No API keys in frontend code
- [ ] No database credentials in code
- [ ] No console.log with sensitive data
- [ ] Pre-commit hook passed
- [ ] All tests pass: `npm test`
- [ ] Environment validation passes: `npm run validate:env`

### What Reviewers Should Check

- [ ] No sensitive data exposure
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS prevention (escaped output)
- [ ] Authentication on protected routes
- [ ] Authorization checks (user can only access their own data)
- [ ] Rate limiting on auth endpoints

---

## 🌍 **Environment-Specific Settings**

### Development (Local)
```env
NODE_ENV=development
PORT=5000
DB_DIALECT=sqlite
CORS_ORIGIN=http://localhost:5173
```

### Testing
```env
NODE_ENV=test
DB_DIALECT=sqlite
DB_STORAGE=:memory:  # In-memory database
```

### Production
```env
NODE_ENV=production
PORT=5000
DB_DIALECT=postgres
CORS_ORIGIN=https://yourdomain.com  # Specific domain!
```

**⚠️ Production Requirements:**
- HTTPS only (no HTTP)
- Specific CORS origin (never `*`)
- Strong database password
- PostgreSQL (not SQLite)
- Error messages don't leak details

---

## 🚀 **Deployment Security**

### Pre-Deployment Checklist

- [ ] Repository is PRIVATE
- [ ] All secrets in environment variables (not code)
- [ ] `.env` file NOT deployed (use hosting platform's env vars)
- [ ] Database password rotated from dev
- [ ] JWT_SECRET rotated from dev
- [ ] CORS limited to production domain
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Security headers enabled (Helmet)
- [ ] Dependencies audited: `npm audit`

### Platform-Specific

**Render.com:**
```bash
# Set environment variables in dashboard
# Settings → Environment → Add Environment Variable
JWT_SECRET=your-production-secret
DB_PASSWORD=your-db-password
```

**Netlify:**
```bash
# Frontend only - NO backend secrets!
# Site settings → Environment variables
VITE_API_URL=https://your-api.com
```

---

## 🔒 **Password Security**

### User Passwords

**✅ DO:**
- Store hashed with bcrypt (already implemented)
- Minimum 8 characters
- Require complexity (uppercase, lowercase, number, special)
- Account lockout after 5 failed attempts (already implemented)

**❌ DON'T:**
- Store plaintext passwords
- Store encrypted passwords (use hashing, not encryption)
- Allow weak passwords (`password123`, etc.)

### Password Reset

**Secure Flow:**
1. User requests reset
2. Generate random token (crypto.randomBytes)
3. Send token via email (expires in 1 hour)
4. User clicks link with token
5. Validate token + expiry
6. Allow new password
7. Invalidate token

---

## 📊 **Logging Best Practices**

### What to Log
```javascript
// ✅ Good logging
logger.info('User login', { userId: user.id, ip: req.ip });
logger.warn('Failed login attempt', { phone: '88*****23', ip: req.ip });
logger.error('Database error', { error: error.message, stack: error.stack });
```

### What NOT to Log
```javascript
// ❌ NEVER log these
logger.info('User login', { password: user.password }); // Passwords!
logger.info('JWT token', { token: req.headers.authorization }); // Tokens!
logger.info('Card details', { card: payment.cardNumber }); // Payment info!
```

### Log Levels (Winston)

| Level | Use For | Example |
|-------|---------|---------|
| `error` | Critical failures | Database connection failed |
| `warn` | Suspicious activity | Rate limit exceeded |
| `info` | Normal operations | User registered |
| `http` | HTTP requests | GET /api/products |
| `debug` | Development only | Variable values |

---

## 🐛 **Debugging Securely**

### Development
```javascript
// ✅ OK in development
console.log('Debug user:', user);
console.log('API response:', response.data);
```

### Production
```javascript
// ❌ Remove before production
// console.log('Sensitive data:', ...);

// ✅ Use logger with sanitized data
logger.debug('User action', {
  userId: user.id,  // ID only, not full user object
  action: 'purchase',
  ip: req.ip
});
```

---

## 📚 **Additional Resources**

### OWASP Top 10 (2021)
- A01:2021 – Broken Access Control
- A02:2021 – Cryptographic Failures
- A03:2021 – Injection
- A04:2021 – Insecure Design
- A05:2021 – Security Misconfiguration

### This Project's Protection

| OWASP Risk | Our Defense |
|------------|-------------|
| Broken Access Control | RBAC, auth middleware, ownership checks |
| Cryptographic Failures | bcrypt passwords, JWT tokens, HTTPS |
| Injection | Input validation, parameterized queries |
| Insecure Design | Security by design, defense in depth |
| Security Misconfiguration | Helmet, CORS, env validation |

### Security Tools

- **npm audit:** `npm audit` (check for vulnerabilities)
- **Snyk:** `npx snyk test` (continuous security monitoring)
- **OWASP ZAP:** Penetration testing tool
- **ESLint Security Plugin:** `eslint-plugin-security`

---

## 🆘 **If You Accidentally Commit Secrets**

### Immediate Actions

1. **DON'T just delete the file and commit again** (it's in git history!)

2. **Rotate the secret immediately:**
   ```bash
   # Generate new secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

   # Update .env with new secret
   ```

3. **Remove from git history:**
   ```bash
   # Using BFG Repo-Cleaner (easiest)
   java -jar bfg.jar --delete-files .env
   git reflog expire --expire=now --all
   git gc --prune=now --aggressive
   git push origin --force --all

   # Or using git filter-branch
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   ```

4. **Notify team members** (if applicable)

5. **Monitor for suspicious activity**

---

## ✅ **Quick Reference**

### Daily Development
```bash
# Morning routine
git pull origin main
npm run validate:env  # Check env setup
npm run dev           # Start server (validation runs automatically)

# Before committing
git status            # Check what you're committing
git diff              # Review changes
git add .             # Pre-commit hook scans automatically
git commit -m "..."   # Blocked if secrets detected

# Before pushing
# Verify repo is private!
git push origin your-branch
```

### Emergency Commands
```bash
# Validate environment
npm run validate:env

# Security audit
npm audit

# Check for secrets in staged files
git diff --cached | grep -i "secret\|password\|key"

# Un-stage .env file
git reset HEAD .env
```

---

**Last Updated:** 2025-01-16
**Maintained By:** Security Team
**Questions?** Check `SECURITY_INCIDENT_RESPONSE.md` for incident procedures

🔒 **Stay Secure!**
