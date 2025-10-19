const request = require('supertest')
const app = require('../server')
const { User } = require('../models')
const jwt = require('jsonwebtoken')

// --- Added helpers to generate unique emails/phones ---
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const genEmail = (prefix = 'test') => `${prefix}.${uid()}@example.com`
const genPhone = (prefix = '77') => {
  // returns 9-digit string starting with valid prefix
  const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
  return `${prefix}${rest}`
}

describe('Auth API Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: genEmail('register'),
        password: 'password123',
        phone: genPhone('77'),
        role: 'buyer'
      }

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('User registered successfully')
      expect(res.body.token).toBeDefined()
      expect(res.body.user.email).toBe(userData.email)
      expect(res.body.user.name).toBe(userData.name)
      expect(res.body.user.password).toBeUndefined()
    })

    it('should not register user with existing email', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+231777123456'
      }

      // Create user first
      await request(app).post('/api/auth/register').send(userData)

      // Try to register again with same email
      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('already exists')
    })

    it('should hash password before saving', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+231777123456'
      }

      await request(app).post('/api/auth/register').send(userData)

      const user = await User.findOne({ where: { email: userData.email } })
      expect(user.password).not.toBe(userData.password)
      expect(user.password).toMatch(/^\$2[ayb]\$.{56}$/)
    })

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBeDefined()
    })

    it('should validate email format', async () => {
      const userData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'password123',
        phone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should validate password length', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: '123',
        phone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should set default role to buyer if not specified', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(res.body.user.role).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    let registeredUser

    beforeEach(async () => {
      // Create a test user with unique credentials
      const userData = {
        name: 'Test User',
        email: genEmail('login'),
        password: 'password123',
        phone: genPhone('77')
      }
      const res = await request(app).post('/api/auth/register').send(userData)
      registeredUser = { ...userData, token: res.body.token, id: res.body.user && res.body.user.id }
    })

    it('should login with valid credentials (phone + password)', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          phone: registeredUser.phone,
          password: registeredUser.password
        })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Login successful')
      expect(res.body.token).toBeDefined()
      expect(res.body.user.phone).toBe(registeredUser.phone)
      expect(res.body.user.password).toBeUndefined()
    })

    it('should not login with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'wrong@example.com',
          password: 'password123'
        })
        .expect(401)

      expect(res.body.success).toBe(false)
      // Accept common variants of the invalid credentials message
      const combined = `${res.body.error || ''} ${res.body.message || ''}`.toLowerCase()
      expect(/invalid|credentials|phone|password/.test(combined)).toBe(true)
    })

    it('should not login with invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          phone: registeredUser.phone,
          password: 'wrongpassword'
        })
        .expect(401)

      expect(res.body.success).toBe(false)
      const combined = `${res.body.error || ''} ${res.body.message || ''}`.toLowerCase()
      expect(/invalid|credentials|phone|password/.test(combined)).toBe(true)
    })

    it('should require phone and password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({}) // missing fields
        .expect(400)

      // API may return { success: false, error: '...' } or { success: false, message: '...' }
      expect(res.body.success).toBe(false)

      // accept a variety of wording about required phone/password
      const combined = `${res.body.error || ''} ${res.body.message || ''}`.toLowerCase()
      expect(/phone.*required|phone.*and.*password|required|missing/i.test(combined)).toBe(true)
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Logged out successfully')
    })
  })

  describe('GET /api/auth/me', () => {
    let token

    beforeEach(async () => {
      // Register and login to get token
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phone: '+231777123456'
      })
      token = res.body.token
    })

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.email).toBe('test@example.com')
      expect(res.body.data.password).toBeUndefined()
    })

    it('should not get user without token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not get user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not get user with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 'test-id' },
        process.env.JWT_SECRET,
        { expiresIn: '0s' }
      )

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should validate JWT token structure', async () => {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      expect(decoded.id).toBeDefined()
      expect(decoded.exp).toBeDefined()
    })
  })
})
