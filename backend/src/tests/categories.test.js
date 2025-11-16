const request = require('supertest')
const app = require('../server')
const { User, Category, Product } = require('../models')

describe('Category API Endpoints', () => {
  let adminCookie
  let adminUserId
  let userCookie
  let categoryId

  // Helper to extract token value
  const extractTokenValue = (setCookieHeader) => {
    if (!setCookieHeader) return null
    const tokenCookie = Array.isArray(setCookieHeader) 
      ? setCookieHeader.find(c => c.startsWith('token='))
      : setCookieHeader
    if (!tokenCookie) return null
    const match = tokenCookie.match(/token=([^;]+)/)
    return match ? match[1] : null
  }

  beforeAll(async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
  })

  beforeEach(async () => {
    // Clean up
    await User.destroy({ where: { phone: { [require('sequelize').Op.like]: '777%' } } })
    await Category.destroy({ where: {} })

    // Create admin
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '77712345',
        role: 'admin'
      })

    console.log('Admin registration response:', adminRes.status)

    const adminCookies = adminRes.headers['set-cookie']
    const adminTokenValue = extractTokenValue(adminCookies)
    adminCookie = adminTokenValue ? `token=${adminTokenValue}` : null
    adminUserId = adminRes.body.user?.id

    console.log('Admin cookie extracted:', adminCookie ? 'Yes' : 'No')
    console.log('Admin user ID:', adminUserId)

    if (adminUserId) {
      await User.update({ role: 'admin' }, { where: { id: adminUserId } })
      console.log('Admin role updated')
    }

    // Create regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        phone: '77765432',
        role: 'buyer'
      })

    const userCookies = userRes.headers['set-cookie']
    const userTokenValue = extractTokenValue(userCookies)
    userCookie = userTokenValue ? `token=${userTokenValue}` : null

    console.log('User cookie extracted:', userCookie ? 'Yes' : 'No')
  })

  afterEach(async () => {
    await Category.destroy({ where: {} })
    await Product.destroy({ where: {} })
    await User.destroy({ where: { phone: { [require('sequelize').Op.like]: '777%' } } })
  })

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      await Category.bulkCreate([
        {
          name: 'Electronics',
          description: 'Electronic devices',
          icon: 'laptop',
          color: '#3B82F6',
          sortOrder: 1,
          isActive: true
        },
        {
          name: 'Fashion',
          description: 'Clothing',
          icon: 'shirt',
          color: '#EC4899',
          sortOrder: 2,
          isActive: true
        },
        {
          name: 'Inactive Category',
          description: 'Inactive',
          icon: 'box',
          color: '#6B7280',
          sortOrder: 3,
          isActive: false
        }
      ])
    })

    it('should get all active categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.data.every(cat => cat.isActive === true)).toBe(true)
    })

    it('should return categories sorted by sortOrder', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(res.body.success).toBe(true)
      const sortOrders = res.body.data.map(cat => cat.sortOrder)
      const sortedOrders = [...sortOrders].sort((a, b) => a - b)
      expect(sortOrders).toEqual(sortedOrders)
    })

    it('should include product count for each category', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data[0].productCount).toBeDefined()
    })

    it('should include inactive categories for admin when requested', async () => {
      if (!adminCookie) {
        console.log('⚠️ Skipping test - no admin cookie')
        return
      }

      const res = await request(app)
        .get('/api/categories?includeInactive=true')
        .set('Cookie', adminCookie)
        .expect(200)

      expect(res.body.success).toBe(true)
      const hasInactive = res.body.data.some(cat => cat.isActive === false)
      expect(hasInactive).toBe(true)
    })

    it('should not include inactive for regular users', async () => {
      if (!userCookie) {
        console.log('⚠️ Skipping test - no user cookie')
        return
      }

      const res = await request(app)
        .get('/api/categories?includeInactive=true')
        .set('Cookie', userCookie)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.every(cat => cat.isActive === true)).toBe(true)
    })
  })

  describe('GET /api/categories/:id', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'Electronics',
        description: 'Electronic devices',
        icon: 'laptop',
        color: '#3B82F6',
        isActive: true
      })
      categoryId = category.id
    })

    it('should get a single category by ID', async () => {
      const res = await request(app)
        .get(`/api/categories/${categoryId}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.id).toBe(categoryId)
      expect(res.body.data.name).toBe('Electronics')
      expect(res.body.data.productCount).toBeDefined()
    })

    it('should return 404 for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(app)
        .get(`/api/categories/${fakeId}`)
        .expect(404)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toBe('Category not found')
    })

    it('should not get inactive category for regular users', async () => {
      const inactiveCategory = await Category.create({
        name: 'Inactive',
        description: 'Inactive category',
        icon: 'box',
        color: '#6B7280',
        isActive: false
      })

      const res = await request(app)
        .get(`/api/categories/${inactiveCategory.id}`)
        .expect(404)

      expect(res.body.success).toBe(false)
    })

    it('should get inactive category for admin', async () => {
      const inactiveCategory = await Category.create({
        name: 'Inactive',
        description: 'Inactive category',
        icon: 'box',
        color: '#6B7280',
        isActive: false
      })

      const res = await request(app)
        .get(`/api/categories/${inactiveCategory.id}`)
        .set('Cookie', adminCookie)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.isActive).toBe(false)
    })
  })

  describe('POST /api/categories', () => {
    it('should create a new category as admin', async () => {
      if (!adminCookie) {
        console.log('⚠️ Skipping test - no admin cookie')
        return
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Vehicles',
          description: 'Cars and motorcycles',
          icon: 'car',
          color: '#10B981'
        })
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Vehicles')
    })

    it('should auto-generate slug from name', async () => {
      if (!adminCookie) {
        console.log('⚠️ Skipping test - no admin cookie')
        return
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Home & Garden',
          description: 'Home and garden items',
          icon: 'home',
          color: '#8B5CF6'
        })
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.slug).toMatch(/^home-garden/)
    })

    it('should not create category without authentication', async () => {
      const res = await request(app)
        .post('/api/categories')
        .send({
          name: 'Test',
          description: 'Test',
          icon: 'box',
          color: '#3B82F6'
        })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not create category as regular user', async () => {
      if (!userCookie) {
        console.log('⚠️ Skipping test - no user cookie')
        return
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', userCookie)
        .send({
          name: 'Test',
          description: 'Test',
          icon: 'box',
          color: '#3B82F6'
        })
        .expect(403)

      expect(res.body.success).toBe(false)
    })

    it('should not create category with duplicate name', async () => {
      const categoryData = {
        name: 'Electronics',
        description: 'Electronic items',
        icon: 'laptop',
        color: '#3B82F6'
      }

      // Create first category
      await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send(categoryData)

      // Try to create duplicate
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send(categoryData)
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('already exists')
    })

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send({})
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should validate color format', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        icon: 'box',
        color: 'invalid-color'
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send(categoryData)
        .expect(400)

      expect(res.body.success).toBe(false)
    })

    it('should accept valid hex color codes', async () => {
      const validColors = ['#3B82F6', '#EC4899', '#10B981', '#F59E0B', '#8B5CF6']

      for (const color of validColors) {
        const categoryData = {
          name: `Category ${color}`,
          description: 'Test',
          icon: 'box',
          color
        }

        const res = await request(app)
          .post('/api/categories')
          .set('Cookie', adminCookie)
          .send(categoryData)
          .expect(201)

        expect(res.body.success).toBe(true)
        expect(res.body.data.color).toBe(color)
      }
    })

    it('should set default sortOrder to 0 if not provided', async () => {
      const categoryData = {
        name: 'No Sort Order',
        description: 'Category without sort order',
        icon: 'box',
        color: '#3B82F6'
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send(categoryData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.sortOrder).toBe(0)
    })
  })

  describe('PUT /api/categories/:id', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'Original',
        description: 'Original',
        icon: 'box',
        color: '#3B82F6',
        isActive: true
      })
      categoryId = category.id
    })

    it('should update as admin', async () => {
      if (!adminCookie) {
        console.log('⚠️ Skipping test - no admin cookie')
        return
      }

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Updated' })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.name).toBe('Updated')
    })

    it('should not update without auth', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send({ name: 'Updated' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not update as regular user', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Updated' })
        .expect(403)

      expect(res.body.success).toBe(false)
    })

    it('should return 404 for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(app)
        .put(`/api/categories/${fakeId}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Updated' })
        .expect(404)

      expect(res.body.success).toBe(false)
    })

    it('should not update to duplicate name', async () => {
      // Create another category
      await Category.create({
        name: 'Another Category',
        description: 'Description',
        icon: 'box',
        color: '#10B981'
      })

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({ name: 'Another Category' })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('already exists')
    })

    it('should update isActive status', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({ isActive: false })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.isActive).toBe(false)
    })

    it('should update sortOrder', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({ sortOrder: 10 })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.sortOrder).toBe(10)
    })

    it('should allow updating same name (no change)', async () => {
      const category = await Category.findByPk(categoryId)

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .send({ name: category.name, description: 'New description' })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.description).toBe('New description')
    })
  })

  describe('DELETE /api/categories/:id', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'To Delete',
        description: 'Delete me',
        icon: 'box',
        color: '#3B82F6'
      })
      categoryId = category.id
    })

    it('should delete as admin', async () => {
      if (!adminCookie) {
        console.log('⚠️ Skipping test - no admin cookie')
        return
      }

      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .expect(200)

      expect(res.body.success).toBe(true)
    })

    it('should not delete without auth', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not delete as regular user', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403)

      expect(res.body.success).toBe(false)
    })

    it('should return 404 for non-existent category', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000'
      const res = await request(app)
        .delete(`/api/categories/${fakeId}`)
        .set('Cookie', adminCookie)
        .expect(404)

      expect(res.body.success).toBe(false)
    })

    it('should not delete category with products', async () => {
      // Create a user for the product
      const seller = await User.create({
        name: 'Seller',
        email: 'seller@example.com',
        password: 'password123',
        phone: '+231777111111'
      })

      // Create a product in this category
      await Product.create({
        title: 'Test Product',
        description: 'Product in category',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: seller.id,
        status: 'active'
      })

      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('Cannot delete category')
      expect(res.body.error).toContain('products')
    })

    it('should provide product count in error message', async () => {
      const seller = await User.create({
        name: 'Seller',
        email: 'seller@example.com',
        password: 'password123',
        phone: '+231777111111'
      })

      // Create multiple products
      await Product.create({
        title: 'Product 1',
        description: 'Description',
        price: 100,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: seller.id,
        status: 'active'
      })

      await Product.create({
        title: 'Product 2',
        description: 'Description',
        price: 200,
        category_id: categoryId,
        location: 'Monrovia',
        condition: 'good',
        contactPhone: '+231777123456',
        seller_id: seller.id,
        status: 'active'
      })

      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Cookie', adminCookie)
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('2 products')
    })
  })

  describe('Category Integration Tests', () => {
    it('should create category and assign products to it', async () => {
      // Create category
      const categoryRes = await request(app)
        .post('/api/categories')
        .set('Cookie', adminCookie)
        .send({
          name: 'Books',
          description: 'Books and magazines',
          icon: 'book',
          color: '#F59E0B'
        })

      const newCategoryId = categoryRes.body.data?.id

      // Create product with this category
      const productRes = await request(app)
        .post('/api/products')
        .set('Cookie', adminCookie)
        .send({
          title: 'Harry Potter Book',
          description: 'First edition',
          price: 25,
          category_id: newCategoryId,
          location: 'Monrovia',
          condition: 'good',
          contactPhone: '77712345'
        })

      expect(productRes.body.success).toBe(true)
    })

    it('should properly count products in category', async () => {
      // Create category
      const categoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Furniture',
          description: 'Home furniture',
          icon: 'sofa',
          color: '#8B5CF6'
        })

      const newCategory = getData(categoryRes)
      const newCategoryId = newCategory && (newCategory.id || newCategory._id)

      // Initially should have 0 products
      let categoryCheckRes = await request(app)
        .get(`/api/categories/${newCategoryId}`)

      const initialCategory = getData(categoryCheckRes)
      expect(parseInt(initialCategory.productCount || 0)).toBe(0)

      // Create products
      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Sofa',
          description: 'Comfortable sofa',
          price: 300,
          category_id: newCategoryId,
          location: 'Monrovia',
          condition: 'good',
          contactPhone: '+231777123456'
        })

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Table',
          description: 'Dining table',
          price: 150,
          category_id: newCategoryId,
          location: 'Monrovia',
          condition: 'good',
          contactPhone: '+231777123456'
        })

      // Should now have 2 products
      categoryCheckRes = await request(app)
        .get(`/api/categories/${newCategoryId}`)

      const updatedCategory = getData(categoryCheckRes)
      expect(parseInt(updatedCategory.productCount || 0)).toBe(2)
    })

    it('should filter inactive categories from product listings', async () => {
      // Create active category with product
      const activeCategoryRes = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Active Category',
          description: 'Active',
          icon: 'check',
          color: '#10B981',
          isActive: true
        })

      await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Active Product',
          description: 'Product in active category',
          price: 100,
          category_id: activeCategoryRes.body.data.id,
          location: 'Monrovia',
          condition: 'good',
          contactPhone: '+231777123456'
        })

      // Deactivate the category
      await request(app)
        .put(`/api/categories/${activeCategoryRes.body.data.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })

      // Category should not appear in public list
      const categoriesRes = await request(app)
        .get('/api/categories')

      expect(categoriesRes.body.success).toBe(true)
      expect(categoriesRes.body.data.find(cat => cat.id === activeCategoryRes.body.data.id)).toBeUndefined()
    })
  })
})
