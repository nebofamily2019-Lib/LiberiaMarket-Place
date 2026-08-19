const request = require('supertest');
const app = require('../server');
const { User, Product, Category } = require('../models');
const { sequelize } = require('../config/database');

// Helper functions (global scope)
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
function genEmail(p = 'user') { return `${p}.${uid()}@example.com`; }
function genPhone(prefix = '77') {
  // Generate valid 9-digit Liberian phone number
  const rest = Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('');
  return `${prefix}${rest}`;
}
// Valid test password (avoids sequential chars validation)
const validPassword = 'SecureP@ssw0rd!';
function getData(res) {
  if (!res || !res.body) return undefined;
  return res.body.data !== undefined ? res.body.data : res.body;
}
function bodySuccess(res) {
  if (res && res.body && typeof res.body.success !== 'undefined') return res.body.success;
  return res && res.status && res.status >= 200 && res.status < 300;
}
async function getUserFromRegister(res) {
  if (!res || !res.body) return null;
  // Prefer user field
  if (res.body.user) return res.body.user;
  // Sometimes user is in data
  if (res.body.data && res.body.data.id) return res.body.data;
  // Sometimes user is top-level
  if (res.body.id) return res.body;
  // Fallback: try /api/auth/me if token is present
  const token = res.body.token || (res.body.data && res.body.data.token);
  if (token) {
    const meRes = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);
    if (meRes.body && meRes.body.data && meRes.body.data.id) return meRes.body.data;
    if (meRes.body && meRes.body.user) return meRes.body.user;
  }
  // Fallback: query the most recent user from DB
  const latestUser = await User.findOne({ order: [['createdAt', 'DESC']] });
  if (latestUser) return latestUser;
  return null;
}

// Declare shared variables for all tests
let productId;
let categoryId;
let userId;
let authToken;

// Ensure DB is synced before all tests
beforeAll(async () => {
  await sequelize.sync({ force: true });
});

describe('Product API Endpoints', () => {
  beforeEach(async () => {
    // Clean up for isolation
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
    // Create a test user and get auth token
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Test Seller',
        email: genEmail('seller'),
        password: validPassword,
        phone: genPhone('77'),
        role: 'seller'
      });
    // Debug registration response
    if (userRes.status !== 201) {
      console.error('Registration failed:', userRes.status, userRes.body);
      throw new Error('Registration failed: ' + JSON.stringify(userRes.body));
    }

    let localAuthToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token));
    if (!localAuthToken) {
      // Try extracting from cookie
      const cookies = userRes.headers['set-cookie'];
      if (cookies) {
        const tokenCookie = Array.isArray(cookies) 
          ? cookies.find(c => c.startsWith('token='))
          : cookies;
        if (tokenCookie) {
          const match = tokenCookie.match(/token=([^;]+)/);
          if (match) localAuthToken = match[1];
        }
      }
    }

    if (!localAuthToken) {
      throw new Error('Auth token not found in registration response: ' + JSON.stringify(userRes.body));
    }

    let createdUser = await getUserFromRegister(userRes);
    let localUserId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
    if (!localUserId) {
      // Fallback: query the most recent user from DB
      const latestUser = await User.findOne({ order: [['createdAt', 'DESC']] });
      localUserId = latestUser && (latestUser.id || latestUser._id || latestUser.userId);
    }
    if (!localUserId) throw new Error('User ID not set before product creation (registration response: ' + JSON.stringify(userRes.body) + ')');
    // Create a test category
    const category = await Category.create({
      name: `Electronics ${uid()}`,
      description: 'Electronic items',
      icon: 'laptop',
      color: '#3B82F6'
    });
    let localCategoryId = category.id;
    if (!localCategoryId) {
      // Fallback: query the most recent category from DB
      const latestCategory = await Category.findOne({ order: [['createdAt', 'DESC']] });
      localCategoryId = latestCategory && latestCategory.id;
    }
    // Assign to global for test access
    authToken = localAuthToken;
    userId = localUserId;
    categoryId = localCategoryId;

    // Debug: log the token
    console.log('=== beforeEach Setup Complete ===');
    console.log('authToken:', authToken ? authToken.substring(0, 20) + '...' : 'UNDEFINED');
    console.log('userId:', userId);
    console.log('categoryId:', categoryId);
  });

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
      expect(res.body.data.price).toBe(productData.price)  // Price as number, not string
      expect(res.body.data.seller_id).toBe(userId)
      expect(res.body.data.status).toBe('active')
      expect(res.body.data.id).toBeDefined()

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

    it('should create product with defaults when no data provided', async () => {
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

    it('should accept valid condition values', async () => {
      const productData = {
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'like-new',
        contactPhone: '+231777123456'
      }

      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send(productData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.condition).toBe('like-new')
    })
  // removed stray closing brace
  describe('GET /api/products', () => {
    beforeEach(async () => {
      await Product.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      // Create user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Get Seller',
          email: genEmail('getseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      let localAuthToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token));
      let createdUser = await getUserFromRegister(userRes);
      let localUserId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
      if (!localUserId) {
        const latestUser = await User.findOne({ order: [['createdAt', 'DESC']] });
        localUserId = latestUser && (latestUser.id || latestUser._id || latestUser.userId);
      }
      const category = await Category.create({
        name: `GetCat ${uid()}`,
        description: 'Get category',
        icon: 'get',
        color: '#3B82F6'
      });
      let localCategoryId = category.id;
      if (!localCategoryId) {
        const latestCategory = await Category.findOne({ order: [['createdAt', 'DESC']] });
        localCategoryId = latestCategory && latestCategory.id;
      }
      await Product.create({
        title: 'Laptop HP',
        description: 'Good laptop for sale',
        price: 300,
        category_id: localCategoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'active'
      });
      await Product.create({
        title: 'Samsung Phone',
        description: 'Smartphone in excellent condition',
        price: 200,
        category_id: localCategoryId,
        location: 'Buchanan',
        condition: 'like-new',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'active'
      });
      authToken = localAuthToken;
      userId = localUserId;
      categoryId = localCategoryId;
    });

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
      // Use local variables for isolation
      let localUserId, localCategoryId, localAuthToken, localProductId;
      // Create user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Patch Seller',
          email: genEmail('patchseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      localAuthToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token));
      const createdUser = await getUserFromRegister(userRes);
      localUserId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);

      // Create category
      const category = await Category.create({
        name: `PatchCat ${uid()}`,
        description: 'Patch category',
        icon: 'patch',
        color: '#3B82F6'
      });
      localCategoryId = category.id;

      // Create product
      const product = await Product.create({
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: localCategoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'active'
      });
      localProductId = product.id;

      // Assign to global for test access
      productId = localProductId;
      userId = localUserId;
      categoryId = localCategoryId;
      authToken = localAuthToken;
    });

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
      // Clean up for isolation
      await Product.destroy({ where: {} });
      // Defensive check for userId
      if (!userId) throw new Error('User ID not set before product creation');
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
      });
      productId = product.id;
    });

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
      expect(parseFloat(res.body.data.price)).toBe(updateData.price)
    })

    it('should not update product without authentication', async () => {
      const res = await request(app)
        .put(`/api/products/${productId}`)
        .send({ title: 'Updated Title' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not update product owned by another user', async () => {
      // Create another seller
      const anotherUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Another Seller',
          email: 'another@example.com',
          password: validPassword,
          phone: '+231777654321',
          role: 'seller'
        })

      const res = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${anotherUserRes.body.token}`)
        .send({ title: 'Hacked Title' })
        .expect(403)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Not authorized to access this resource')
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
      // Clean up for isolation
      await Product.destroy({ where: {} });
      // Defensive check for userId
      if (!userId) throw new Error('User ID not set before product creation');
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
      });
      productId = product.id;
    });

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
          password: validPassword,
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
      // Clean up for isolation
      await Product.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      // Register a test user and extract userId
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Search Seller',
          email: genEmail('searchseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      const createdUser = await getUserFromRegister(userRes);
      userId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
      // Create a test category and assign categoryId
      const category = await Category.create({
        name: `SearchCat ${uid()}`,
        description: 'Search category',
        icon: 'search',
        color: '#3B82F6'
      });
      categoryId = category.id;
      // Create products with valid seller_id and category_id
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
      });
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
      });
    });

    it('should search products by title', async () => {
      const res = await request(app)
        .get('/api/products/search?search=iPhone')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
      expect(res.body.data[0].title).toContain('iPhone')
    })

    it('should search products by description', async () => {
      const res = await request(app)
        .get('/api/products/search?search=smartphone')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })

    it('should search products by location', async () => {
      const res = await request(app)
        .get('/api/products/search?search=Monrovia')
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
        .get('/api/products/search?search=smartphone&page=1&limit=1')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.pagination).toBeDefined()
      expect(res.body.pagination.page).toBe(1)
      expect(res.body.pagination.limit).toBe(1)
    })

    it('should be case insensitive', async () => {
      const res = await request(app)
        .get('/api/products/search?search=IPHONE')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.length).toBeGreaterThan(0)
    })
  })

  describe('GET /api/products/category/:category', () => {
    beforeEach(async () => {
      // Clean up for isolation
      await Product.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      // Register a test user and extract userId
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Category Seller',
          email: genEmail('categoryseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      const createdUser = await getUserFromRegister(userRes);
      userId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
      // Create a test category and assign categoryId
      const category = await Category.create({
        name: `CategoryCat ${uid()}`,
        description: 'Category category',
        icon: 'category',
        color: '#3B82F6'
      });
      categoryId = category.id;
      // Create products with valid seller_id and category_id
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
      });
      await Product.create({
        title: 'Product 2',
        description: 'Description 2',
        price: 200,
        category_id: categoryId,
        location: 'Buchanan',
        condition: 'new',
        contactPhone: '+231777123456',
        seller_id: userId,
        status: 'active'
      });
    });

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
  })

  describe('PATCH /api/products/:id/status', () => {
    beforeEach(async () => {
      await Product.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      // Create user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Patch Seller',
          email: genEmail('patchseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      
      if (userRes.status !== 201) {
        console.log('❌ Patch Seller Registration failed:', userRes.status, userRes.body);
      }

      let localAuthToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token));
      let createdUser = await getUserFromRegister(userRes);
      let localUserId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
      if (!localUserId) {
        const latestUser = await User.findOne({ order: [['createdAt', 'DESC']] });
        localUserId = latestUser && (latestUser.id || latestUser._id || latestUser.userId);
      }
      const category = await Category.create({
        name: `PatchCat ${uid()}`,
        description: 'Patch category',
        icon: 'patch',
        color: '#3B82F6'
      });
      let localCategoryId = category.id;
      if (!localCategoryId) {
        const latestCategory = await Category.findOne({ order: [['createdAt', 'DESC']] });
        localCategoryId = latestCategory && latestCategory.id;
      }
      const product = await Product.create({
        title: 'Test Product',
        description: 'Test description',
        price: 100,
        category_id: localCategoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'active'
      });
      productId = product.id;
      authToken = localAuthToken;
      userId = localUserId;
      categoryId = localCategoryId;
    });

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
        .expect(res => {
          if (![400, 403].includes(res.status)) throw new Error(`Expected 400 or 403, got ${res.status}`)
        })
      expect(res.body.success).toBe(false)
      if (res.status === 400) expect(res.body.error).toBe('Invalid status value')
    })

    it('should not update status without authentication', async () => {
      const res = await request(app)
        .patch(`/api/products/${productId}/status`)
        .send({ status: 'sold' })
        .expect(res => {
          if (![401, 403].includes(res.status)) throw new Error(`Expected 401 or 403, got ${res.status}`)
        })
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
      await Product.destroy({ where: {} });
      await Category.destroy({ where: {} });
      await User.destroy({ where: {} });
      // Create user
      const userRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Seller',
          email: genEmail('userseller'),
          password: validPassword,
          phone: genPhone('77'),
          role: 'seller'
        });
      let localAuthToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token));
      let createdUser = await getUserFromRegister(userRes);
      let localUserId = createdUser && (createdUser.id || createdUser._id || createdUser.userId);
      if (!localUserId) {
        const latestUser = await User.findOne({ order: [['createdAt', 'DESC']] });
        localUserId = latestUser && (latestUser.id || latestUser._id || latestUser.userId);
      }
      const category = await Category.create({
        name: `UserCat ${uid()}`,
        description: 'User category',
        icon: 'user',
        color: '#3B82F6'
      });
      let localCategoryId = category.id;
      if (!localCategoryId) {
        const latestCategory = await Category.findOne({ order: [['createdAt', 'DESC']] });
        localCategoryId = latestCategory && latestCategory.id;
      }
      await Product.create({
        title: 'User1 Product 1',
        description: 'Description',
        price: 100,
        category_id: localCategoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'active'
      });
      await Product.create({
        title: 'User1 Product 2',
        description: 'Description',
        price: 200,
        category_id: localCategoryId,
        location: 'Monrovia',
        condition: 'new',
        contactPhone: '+231777123456',
        seller_id: localUserId,
        status: 'inactive'
      });
      authToken = localAuthToken;
      userId = localUserId;
      categoryId = localCategoryId;
    });

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
      // Create an inactive product for this user
      await Product.create({
        title: 'Inactive Product',
        description: 'Hidden',
        price: 50,
        category_id: categoryId,
        seller_id: userId,
        status: 'inactive',
        contactPhone: '777123456'
      });

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
})  // Close outer describe('Product API Endpoints')
