const request = require('supertest')
const app = require('../server')
const { User, Product, Category } = require('../models')

// --- Added helpers to avoid duplicate users across tests ---
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
const genEmail = (p = 'user') => `${p}.${uid()}@example.com`
const genPhone = (prefix = '77') => {
  const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')
  return `${prefix}${rest}`
}

// Helpers to normalize response shapes
function getData(res) {
	// prefer res.body.data but fall back to res.body
	if (!res || !res.body) return undefined
	return res.body.data !== undefined ? res.body.data : res.body
}

function bodySuccess(res) {
	// if API returns explicit success flag, use it, otherwise infer from status
	if (res && res.body && typeof res.body.success !== 'undefined') return res.body.success
	return res && res.status && res.status >= 200 && res.status < 300
}

async function getUserFromRegister(res) {
	// res is register response. Return user object with id if possible.
	if (!res || !res.body) return null
	if (res.body.user) return res.body.user
	if (res.body.id) return res.body
	// If register only returned token, call /api/auth/me
	const token = res.body.token || (res.body.data && res.body.data.token)
	if (token) {
		const meRes = await request(app)
			.get('/api/auth/me')
			.set('Authorization', `Bearer ${token}`)
		return getData(meRes) || (meRes.body && meRes.body.user) || null
	}
	return null
}

describe('Product API Endpoints', () => {
  let authToken
  let userId
  let categoryId
  let productId

  beforeEach(async () => {
    // Create a test user and get auth token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Seller',
        email: genEmail('seller'),
        password: 'password123',
        phone: genPhone('77'),
        role: 'seller'
      })

    // normalize token and user id
    authToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token))
    const createdUser = await getUserFromRegister(userRes)
    userId = createdUser && (createdUser.id || createdUser._id || createdUser.userId)

    // Create a test category
    const category = await Category.create({
      name: `Electronics ${uid()}`,
      description: 'Electronic items',
      icon: 'laptop',
      color: '#3B82F6'
    })
    categoryId = category.id
  })

  describe('POST /api/products', () => {
    it('should create a new product with valid data', async () => {
      const productData = {
        title: 'iPhone 12 Pro',
        description: 'Excellent condition, barely used',
        price: 500,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'like-new',
        isNegotiable: true,
        contactPhone: '+231777123456',
        tags: ['smartphone', 'apple', 'ios']
      }

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Product created successfully')
      expect(res.body.data.title).toBe(productData.title)
      expect(res.body.data.price).toBe(productData.price.toString())
      expect(res.body.data.seller_id).toBe(userId)
      expect(res.body.data.status).toBe('active')
      expect(res.body.data.slug).toBeDefined()

      productId = res.body.data.id
    })

    it('should not create product without authentication', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/products')
        .send(productData)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should validate price is positive', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: -100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should validate condition enum', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'invalid-condition',
        contactPhone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(400)

      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create({
        title: 'Laptop HP',
        description: 'Good laptop for sale',
        price: 300,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })

      await Product.create({
        title: 'Samsung Phone',
        description: 'Smartphone in excellent condition',
        price: 200,
        category_id: categoryId,
        location: 'Buchanan',
        condition: 'like-new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
    })

    it('should get all active products', async () => {
      const res = await request(app)
        .get('/api/products')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.count).toBeGreaterThan(0)
      expect(res.body.pagination).toBeDefined()
      expect(res.body.data[0].seller).toBeDefined()
      expect(res.body.data[0].category).toBeDefined()
    })

    it('should support pagination', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=1')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.count).toBe(1)
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(1)
    })

    it('should filter by price range', async () => {
      const res = await request(app)
        .get('/api/products?minPrice=250&maxPrice=350')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.price >= 250 && p.price <= 350)).toBe(true)
    })

    it('should filter by condition', async () => {
      const res = await request(app)
        .get('/api/products?condition=like-new')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.condition === 'like-new')).toBe(true)
    })

    it('should filter by location', async () => {
      const res = await request(app)
        .get('/api/products?location=Monrovia')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.location.includes('Monrovia'))).toBe(true)
    })

    it('should filter by category', async () => {
      const res = await request(app)
        .get(`/api/products?category=${categoryId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.category_id === categoryId)).toBe(true)
    })

    it('should support sorting', async () => {
      const res = await request(app)
        .get('/api/products?sortBy=price&sortOrder=ASC')
        .expect(200)

      expect(res.body.success).toBe(true)
      const prices = res.body.data.map(p => parseFloat(p.price))
      const sortedPrices = [...prices].sort((a, b) => a - b)
      expect(prices).toEqual(sortedPrices)
    })
  })

  describe('GET /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
      productId = product.id
    })

    it('should get a single product by ID', async () => {
      const res = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(productId)
      expect(res.body.data.title).toBe('Test Product')
      expect(res.body.data.seller).toBeDefined()
      expect(res.body.data.category).toBeDefined()
    })

    it('should increment view count', async () => {
      await request(app).get(`/api/products/${productId}`)
      await request(app).get(`/api/products/${productId}`)

      const product = await Product.findByPk(productId)
      expect(product.views).toBeGreaterThan(0)
    })

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(app)
        .get(`/api/products/${fakeId}`)
        .expect(404)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Product not found')
    })
  })

  describe('PUT /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        title: 'Original Product',
        description: 'Original description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
      productId = product.id
    })

    it('should update product with valid data', async () => {
      const updateData = {
        title: 'Updated Product',
        price: 150,
        description: 'Updated description'
      }

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Product updated successfully')
      expect(res.body.data.title).toBe(updateData.title)
      expect(res.body.data.price).toBe(updateData.price.toString())
    })

    it('should not update product without authentication', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({ title: 'Updated Title' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not update product owned by another user', async () => {
      // Create another user
      const anotherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
          phone: '+231777654321'
        })

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserRes.body.token}`)
        .send({ title: 'Hacked Title' })
        .expect(403)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Not authorized to update this product')
    })

    it('should return 404 for non-existent product', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ title: 'Updated' })
        .expect(404)

      expect(res.body.success).toBe(false)
    })
  })

  describe('DELETE /api/products/:id', () => {
    beforeEach(async () => {
      const product = await Product.create({
        title: 'Product to Delete',
        description: 'Will be deleted',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
      productId = product.id
    })

    it('should delete product successfully', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Product deleted successfully')

      const deletedProduct = await Product.findByPk(productId)
      expect(deletedProduct).toBeNull()
    })

    it('should not delete product without authentication', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not delete product owned by another user', async () => {
      const anotherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another User',
          email: 'another@example.com',
          password: 'password123',
          phone: '+231777654321'
        })

      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserRes.body.token}`)
        .expect(403)

      expect(res.body.success).toBe(false)
    })
  })

  describe('GET /api/products/search', () => {
    beforeEach(async () => {
      await Product.create({
        title: 'iPhone 12 Pro Max',
        description: 'Apple smartphone with excellent camera',
        price: 700,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })

      await Product.create({
        title: 'Samsung Galaxy S21',
        description: 'Android smartphone in good condition',
        price: 500,
        category_id: categoryId,
        location: 'Buchanan',
        condition: 'like-new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
    })

    it('should search products by title', async () => {
      const res = await request(app)
        .get('/api/products/search?q=iPhone')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].title).toContain('iPhone')
    })

    it('should search products by description', async () => {
      const res = await request(app)
        .get('/api/products/search?q=smartphone')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should search products by location', async () => {
      const res = await request(app)
        .get('/api/products/search?q=Monrovia')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.location.includes('Monrovia'))).toBe(true)
    })

    it('should return error when search keyword is missing', async () => {
      const res = await request(app)
        .get('/api/products/search')
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('keyword is required')
    })

    it('should support pagination in search', async () => {
      const res = await request(app)
        .get('/api/products/search?q=smartphone&page=1&limit=1')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.pagination).toBeDefined()
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(1)
    })

    it('should be case insensitive', async () => {
      const res = await request(app)
        .get('/api/products/search?q=IPHONE')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/products/category/:category', () => {
    beforeEach(async () => {
      await Product.create({
        title: 'Product 1',
        description: 'Description 1',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })

      await Product.create({
        title: 'Product 2',
        description: 'Description 2',
        price: 200,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
    })

    it('should get products by category', async () => {
      const res = await request(app)
        .get(`/api/products/category/${categoryId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data.every(p => p.category_id === categoryId)).toBe(true)
    })

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/api/products/category/${categoryId}?page=1&limit=1`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(1)
    })
  })

  describe('PATCH /api/products/:id/status', () => {
    beforeEach(async () => {
      const product = await Product.create({
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })
      productId = product.id
    })

    it('should update product status', async () => {
      const res = await request(app)
        .patch(`/api/products/${productId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'sold' })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.status).toBe('sold')
    })

    it('should validate status values', async () => {
      const res = await request(app)
        .patch(`/api/products/${productId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: 'invalid-status' })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Invalid status value')
    })

    it('should not update status without authentication', async () => {
      const res = await request(app)
        .patch(`/api/products/${productId}/status`)
        .send({ status: 'sold' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should accept valid status values', async () => {
      const validStatuses = ['active', 'sold', 'inactive', 'pending']

      for (const status of validStatuses) {
        const res = await request(app)
          .patch(`/api/products/${productId}/status`)
          .set('Authorization', `Bearer ${authToken}`)
          .send({ status })
          .expect(200)

        expect(res.body.success).toBe(true)
        expect(res.body.data.status).toBe(status)
      }
    })
  })

  describe('GET /api/products/user/:userId', () => {
    let otherUserId

    beforeEach(async () => {
      // Create products for the first user
      await Product.create({
        title: 'User1 Product 1',
        description: 'Description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      })

      await Product.create({
        title: 'User1 Product 2',
        description: 'Description',
        price: 200,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'inactive'
      })

      // Create another user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        password: 'password123',
        phone: '+231777654321'
      })
      otherUserId = otherUser.id
    })

    it('should get user products', async () => {
      const res = await request(app)
        .get(`/api/products/user/${userId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.seller_id === userId)).toBe(true)
    })

    it('should only show active products to non-owners', async () => {
      const res = await request(app)
        .get(`/api/products/user/${userId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(p => p.status === 'active')).toBe(true)
    })

    it('should show all products to owner', async () => {
      const res = await request(app)
        .get(`/api/products/user/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      const statuses = res.body.data.map(p => p.status)
      expect(statuses).toContain('inactive')
    })

    it('should support pagination', async () => {
      const res = await request(app)
        .get(`/api/products/user/${userId}?page=1&limit=1`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(1)
    })
  })
})
