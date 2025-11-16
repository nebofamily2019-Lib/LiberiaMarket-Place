# ...existing content...

## 🔒 Security

⚠️ **BEFORE RUNNING IN PRODUCTION:**

1. **Generate secure JWT_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

2. **Copy to .env file:**
   ```bash
   cp .env.example .env
   # Edit .env and replace JWT_SECRET with generated value
   ```

3. **Never commit .env to Git:**
   ```bash
   # Already in .gitignore, but verify:
   git status
   # Should NOT show .env file
   ```

4. **Review security documentation:**
   ```bash
   cat SECURITY.md
   ```

For full security guidelines, see [SECURITY.md](./SECURITY.md)

# ...rest of existing README...
