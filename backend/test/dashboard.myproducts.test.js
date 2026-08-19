
const { describe, it, expect, beforeEach } = global;
const request = require('supertest');
const app = require('../src/server');
const { sequelize, Category, Product, User } = require('../src/models');

describe('Dashboard My Products Endpoint', () => {
  let agent;
  let cookie;
  let userId;

  beforeEach(async () => {
    agent = request.agent(app);
    await sequelize.sync({ force: true });
    
    // Create a test user (Seller)
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'Seller Dashboard Test', phone: '+231777111222', password: 'StrongPass!@#2025', role: 'seller' });
    
    const setCookie = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('token=')) : setCookie;
    
    const user = await User.findOne({ where: { phone: '777111222' } });
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

    // Create products
    await Product.create({
      title: 'Active Product',
      description: 'Active Desc',
      price: 100,
      category_id: category.id,
      seller_id: userId,
      status: 'active',
      location: 'Monrovia',
      contactPhone: '+231777111222'
    });

    await Product.create({
      title: 'Sold Product',
      description: 'Sold Desc',
      price: 200,
      category_id: category.id,
      seller_id: userId,
      status: 'sold',
      location: 'Monrovia',
      contactPhone: '+231777111222'
    });
  });

  it('should return active products', async () => {
    const res = await agent
      .get('/api/dashboard/my-products?status=active')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Active Product');
  });

  it('should return sold products', async () => {
    const res = await agent
      .get('/api/dashboard/my-products?status=sold')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Sold Product');
  });
});
