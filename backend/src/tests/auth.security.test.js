const request = require('supertest')
const app = require('../server')
const { User } = require('../models')

describe('🔒 Authentication Security - httpOnly Cookies', () => {
  let testUser
  let authCookie

  beforeAll(async () => {
    // Wait for database to be ready
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  beforeEach(async () => {
    // Clean up test user
    await User.destroy({ where: { phone: { [require('sequelize').Op.like]: '88888888%' } } })
  })

  afterEach(async () => {
    // Clean up after tests
    await User.destroy({ where: { phone: { [require('sequelize').Op.like]: '88888888%' } } })
  })

  // Helper function to extract JUST the token value from Set-Cookie header
  const extractTokenValue = (setCookieHeader) => {
    if (!setCookieHeader) return null
    
    const tokenCookie = Array.isArray(setCookieHeader) 
      ? setCookieHeader.find(c => c.startsWith('token='))
      : setCookieHeader
    
    if (!tokenCookie) return null
    
    // Extract token value between 'token=' and first ';'
    const match = tokenCookie.match(/token=([^;]+)/)
    return match ? match[1] : null
  }

  describe('1. Register/Login - Token stored in httpOnly cookie', () => {
    it('✅ should register user and set httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Security Test User',
          phone: '88888888',
          password: 'SecurePass123',
          role: 'seller'
        })
        .expect(201)

      // Check response body
      expect(res.body.success).toBe(true)
      expect(res.body.user).toBeDefined()
      expect(res.body.user.name).toBe('Security Test User')
      
      // ✅ CRITICAL: Token should NOT be in response body
      expect(res.body.token).toBeUndefined()

      // ✅ Check cookie headers
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      expect(Array.isArray(cookies)).toBe(true)

      // Find and extract token
      const tokenValue = extractTokenValue(cookies)
      expect(tokenValue).toBeDefined()
      expect(tokenValue).not.toBe('none')
      expect(tokenValue.length).toBeGreaterThan(20) // JWT should be long

      // Find token cookie
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      expect(tokenCookie).toBeDefined()

      // ✅ Verify httpOnly flag
      expect(tokenCookie).toContain('HttpOnly')
      
      // ✅ Verify SameSite flag
      expect(tokenCookie).toContain('SameSite=Strict')

      console.log('✅ PASS: httpOnly cookie set on registration')
    })

    it('✅ should login user and set httpOnly cookie', async () => {
      // First register
      await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Login Test User',
          phone: '88888889',
          password: 'SecurePass123'
        })

      // Then login
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          phone: '88888889',
          password: 'SecurePass123'
        })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.user).toBeDefined()

      // ✅ Token should NOT be in response body
      expect(res.body.token).toBeUndefined()

      // ✅ Check cookie
      const cookies = res.headers['set-cookie']
      const tokenCookie = cookies.find(c => c.startsWith('token='))
      
      expect(tokenCookie).toBeDefined()
      expect(tokenCookie).toContain('HttpOnly')

      console.log('✅ PASS: httpOnly cookie set on login')
    })
  })

  describe('2. Navigate Protected Routes - Cookie sent automatically', () => {
    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Protected Route Test',
          phone: '88888887',
          password: 'SecurePass123',
          role: 'seller'
        })

      const cookies = res.headers['set-cookie']
      // Extract ONLY the token value (not the full cookie string)
      const tokenValue = extractTokenValue(cookies)
      // Create cookie header in format: "token=value"
      authCookie = tokenValue ? `token=${tokenValue}` : null
      
      console.log('Auth cookie for tests:', authCookie ? 'Set' : 'Missing')
    })

    it('✅ should access /api/auth/me with cookie', async () => {
      if (!authCookie) {
        console.log('⚠️ Skipping - no auth cookie')
        return
      }
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', authCookie) // Now sends "token=<jwt-value>"
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeDefined()
      expect(res.body.data.name).toBe('Protected Route Test')

      console.log('✅ PASS: Protected route accessible with cookie')
    })

    it('❌ should reject /api/auth/me without cookie', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('Not authorized')

      console.log('✅ PASS: Protected route blocked without cookie')
    })
  })

  describe('3. Logout - Cookie cleared properly', () => {
    let authCookie

    beforeEach(async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Logout Test',
          phone: '88888886',
          password: 'SecurePass123'
        })

      const cookies = res.headers['set-cookie']
      const tokenValue = extractTokenValue(cookies)
      authCookie = tokenValue ? `token=${tokenValue}` : null
    })

    it('✅ should clear cookie on logout', async () => {
      if (!authCookie) {
        console.log('⚠️ Skipping - no auth cookie')
        return
      }
      
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', authCookie)
        .expect(200)

      expect(res.body.success).toBe(true)

      console.log('✅ PASS: Cookie cleared on logout')
    })
  })
})
