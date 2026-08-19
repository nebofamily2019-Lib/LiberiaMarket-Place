
const { describe, it, expect, beforeEach } = global;
const request = require('supertest');
const app = require('../src/server');
const { sequelize, Category, Product, User } = require('../src/models');

describe('Seller Features: Mark as Sold & Stats', () => {
  let agent;
  let cookie;
  let categoryId;
  let userId;
  let productId;

  // Helper to fetch fresh CSRF token before each mutating request
  async function getCsrfToken(agent) {
    try {
      const csrfRes = await agent.get('/api/csrf-token').set('Cookie', cookie);
      if (csrfRes.body && csrfRes.body.csrfToken) {
        return csrfRes.body.csrfToken;
      }
      throw new Error('No CSRF token in response');
    } catch (e) {
      console.error('CSRF token fetch failed:', e.message);
      return undefined;
    }
  }

  beforeEach(async () => {
    agent = request.agent(app);
    await sequelize.sync({ force: true });
    
    // Create a test user (Seller)
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'Seller Test', phone: '+231777000000', password: 'StrongPass!@#2025', role: 'seller' });
    
    const setCookie = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('token=')) : setCookie;
    
    const user = await User.findOne({ where: { phone: '777000000' } });
    userId = user.id;

    // Create a category
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test Desc',
      icon: 'box',
      color: '#000000',
      sortOrder: 1,
      isActive: true
    });
    categoryId = category.id;

    // Create a product
    const product = await Product.create({
      title: 'Product to Sell',
      description: 'This product will be sold',
      price: 500,
      category_id: categoryId,
      seller_id: userId,
      status: 'active',
      location: 'Monrovia',
      contactPhone: '+231777000000'
    });
    productId = product.id;
  });

  it('should mark a product as sold', async () => {
    const csrfToken = await getCsrfToken(agent);
    
    const res = await agent
      .post(`/api/products/${productId}/sold`)
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        soldPrice: 450,
        paymentMethod: 'cash'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('sold');
    expect(res.body.data.sold_price).toBe(450);
    expect(res.body.data.payment_method).toBe('cash');
    expect(res.body.data.sold_at).toBeDefined();
  });

  it('should get seller stats correctly', async () => {
    // First mark the product as sold
    const csrfToken = await getCsrfToken(agent);
    await agent
      .post(`/api/products/${productId}/sold`)
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        soldPrice: 450,
        paymentMethod: 'cash'
      });

    // Then fetch stats
    const res = await agent
      .get('/api/products/stats/seller')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalRevenue).toBe(450);
    expect(res.body.data.totalItemsSold).toBe(1);
    expect(res.body.data.recentSales).toHaveLength(1);
    expect(res.body.data.recentSales[0].title).toBe('Product to Sell');
  });

  it('should not allow non-owners to mark as sold', async () => {
    // Create another user
    const agent2 = request.agent(app);
    const res2 = await agent2
      .post('/api/auth/register')
      .send({ name: 'Other User', phone: '+231888000000', password: 'StrongPass!@#2025', role: 'seller' });
    
    const setCookie2 = res2.headers['set-cookie'];
    const cookie2 = Array.isArray(setCookie2) ? setCookie2.find(c => c.startsWith('token=')) : setCookie2;

    // Get CSRF for user 2
    const csrfRes = await agent2.get('/api/csrf-token').set('Cookie', cookie2);
    const csrfToken2 = csrfRes.body.csrfToken;

    const res = await agent2
      .post(`/api/products/${productId}/sold`)
      .set('Cookie', cookie2)
      .set('X-CSRF-Token', csrfToken2)
      .send({
        soldPrice: 450,
        paymentMethod: 'cash'
      });

    expect(res.status).toBe(403); // Forbidden
  });
});
