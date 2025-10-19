const request = require('supertest')
const app = require('../server')
const { User, Category, Product } = require('../models')

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

describe('Category API Endpoints', () => {
  let adminToken
  let adminUserId
  let userToken
  let categoryId

  beforeEach(async () => {
    // Create an admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        phone: '+231777123456',
        role: 'admin'
      })

    // normalize token and user id
    adminToken = adminRes.body && (adminRes.body.token || (adminRes.body.data && adminRes.body.data.token))
    const adminUser = await getUserFromRegister(adminRes)
    adminUserId = adminUser && (adminUser.id || adminUser.userId || adminUser._id) // tolerate shapes

    // Update user role to admin (if needed)
    if (adminUserId) {
      await User.update({ role: 'admin' }, { where: { id: adminUserId } })
    }

    // Create a regular user
    const userRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        phone: '+231777654321',
        role: 'buyer'
      })

    userToken = userRes.body && (userRes.body.token || (userRes.body.data && userRes.body.data.token))
  })

  describe('GET /api/categories', () => {
    beforeEach(async () => {
      // Create test categories
      await Category.create({
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        icon: 'laptop',
        color: '#3B82F6',
        sortOrder: 1,
        isActive: true
      })

      await Category.create({
        name: 'Fashion',
        description: 'Clothing and accessories',
        icon: 'shirt',
        color: '#EC4899',
        sortOrder: 2,
        isActive: true
      })

      await Category.create({
        name: 'Inactive Category',
        description: 'This category is inactive',
        icon: 'box',
        color: '#6B7280',
        sortOrder: 3,
        isActive: false
      })
    })

    it('should get all active categories', async () => {
      const res = await request(app)
        .get('/api/categories')
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data).toBeInstanceOf(Array)
      expect(res.body.count).toBeGreaterThan(0)
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
      const res = await request(app)
        .get('/api/categories?includeInactive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      const hasInactive = res.body.data.some(cat => cat.isActive === false)
      expect(hasInactive).toBe(true)
    })

    it('should not include inactive categories for regular users even when requested', async () => {
      const res = await request(app)
        .get('/api/categories?includeInactive=true')
        .set('Authorization', `Bearer ${userToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.isActive).toBe(false)
    })
  })

  describe('POST /api/categories', () => {
    it('should create a new category as admin', async () => {
      const categoryData = {
        name: 'Vehicles',
        description: 'Cars, motorcycles, and other vehicles',
        icon: 'car',
        color: '#10B981',
        sortOrder: 5
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Category created successfully')
      expect(res.body.data.name).toBe(categoryData.name)
      expect(res.body.data.slug).toBeDefined()
      expect(res.body.data.isActive).toBe(true)
    })

    it('should auto-generate slug from name', async () => {
      const categoryData = {
        name: 'Home & Garden',
        description: 'Home and garden items',
        icon: 'home',
        color: '#8B5CF6'
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.slug).toMatch(/^home-garden/)
    })

    it('should not create category without authentication', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        icon: 'box',
        color: '#3B82F6'
      }

      const res = await request(app)
        .post('/api/categories')
        .send(categoryData)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not create category as regular user', async () => {
      const categoryData = {
        name: 'Test Category',
        description: 'Test description',
        icon: 'box',
        color: '#3B82F6'
      }

      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${userToken}`)
        .send(categoryData)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)

      // Try to create duplicate
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('already exists')
    })

    it('should validate required fields', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
          .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send(categoryData)
        .expect(201)

      expect(res.body.success).toBe(true)
      expect(res.body.data.sortOrder).toBe(0)
    })
  })

  describe('PUT /api/categories/:id', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'Original Name',
        description: 'Original description',
        icon: 'box',
        color: '#3B82F6',
        sortOrder: 1,
        isActive: true
      })
      categoryId = category.id
    })

    it('should update category as admin', async () => {
      const updateData = {
        name: 'Updated Name',
        description: 'Updated description',
        color: '#EC4899'
      }

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Category updated successfully')
      expect(res.body.data.name).toBe(updateData.name)
      expect(res.body.data.description).toBe(updateData.description)
      expect(res.body.data.color).toBe(updateData.color)
    })

    it('should not update category without authentication', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .send({ name: 'Updated' })
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not update category as regular user', async () => {
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Another Category' })
        .expect(400)

      expect(res.body.success).toBe(false)
      expect(res.body.error).toContain('already exists')
    })

    it('should update isActive status', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.isActive).toBe(false)
    })

    it('should update sortOrder', async () => {
      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ sortOrder: 10 })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.sortOrder).toBe(10)
    })

    it('should allow updating same name (no change)', async () => {
      const category = await Category.findByPk(categoryId)

      const res = await request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: category.name, description: 'New description' })
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.data.description).toBe('New description')
    })
  })

  describe('DELETE /api/categories/:id', () => {
    beforeEach(async () => {
      const category = await Category.create({
        name: 'Category to Delete',
        description: 'Will be deleted',
        icon: 'box',
        color: '#3B82F6'
      })
      categoryId = category.id
    })

    it('should delete category as admin', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200)

      expect(res.body.success).toBe(true)
      expect(res.body.message).toBe('Category deleted successfully')

      const deletedCategory = await Category.findByPk(categoryId)
      expect(deletedCategory).toBeNull()
    })

    it('should not delete category without authentication', async () => {
      const res = await request(app)
        .delete(`/api/categories/${categoryId}`)
        .expect(401)

      expect(res.body.success).toBe(false)
    })

    it('should not delete category as regular user', async () => {
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
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
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Books',
          description: 'Books and magazines',
          icon: 'book',
          color: '#F59E0B'
        })

      const newCategory = getData(categoryRes)
      const newCategoryId = newCategory && (newCategory.id || newCategory._id)

      // Create product with this category
      const productRes = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Harry Potter Book',
          description: 'First edition',
          price: 25,
          category_id: newCategoryId,
          location: 'Monrovia',
          condition: 'good',
          contactPhone: '+231777123456'
        })

      // normalize assertions
      expect(bodySuccess(productRes)).toBe(true)
      const createdProduct = getData(productRes)
      expect(createdProduct).toBeDefined()
      expect(createdProduct.category_id === newCategoryId || createdProduct.category?.id === newCategoryId || createdProduct.category_id === String(newCategoryId)).toBe(true)
      // If category object returned on product, ensure name matches
      if (createdProduct.category) {
        const catName = createdProduct.category.name || createdProduct.category.title
        expect(catName).toBe('Books')
      }
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
