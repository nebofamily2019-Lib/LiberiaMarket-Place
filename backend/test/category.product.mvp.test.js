
const { describe, it, expect, beforeEach } = global;
const request = require('supertest');
const app = require('../src/server');
const { sequelize, Category, Product, User } = require('../src/models');

describe('Category/Product MVP Flow', () => {
  let agent;
  let cookie;
  let categoryId;
  let userId;

// Helper to fetch fresh CSRF token before each mutating request
async function getCsrfToken(agent) {
  try {
    // Always send the authentication cookie when requesting CSRF token
    const csrfRes = await agent.get('/api/csrf-token').set('Cookie', cookie);
    // Use the token from the response body only
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
    // Clean up test user, categories, and products
    await User.destroy({ where: { phone: '+231777123456' } });
    await Category.destroy({ where: {} });
    await Product.destroy({ where: {} });
    // Unique suffix for test run
    global.uniqueSuffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    // Register and login as seller
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'Seller', phone: '+231777123456', password: 'StrongPass!@#2025', role: 'seller' });
    // Robust cookie extraction
    const setCookie = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('token=')) : setCookie;
    if (!cookie) throw new Error('No cookie received after registration');
    // Fetch the user from DB to get the correct userId (normalized phone)
    const user = await User.findOne({ where: { phone: '777123456' } });
    userId = user ? user.id : undefined;
    if (!userId) throw new Error('No userId found after registration');
  });

  it('lists categories', async () => {
    // Seed categories with truly unique names for this test
    await Category.destroy({ where: {} });
    const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`;
    await Category.bulkCreate([
      { name: `Electronics-${uuid}-A`, slug: `electronics-${uuid}-a`, description: 'Electronic devices', icon: 'laptop', color: '#3B82F6', sortOrder: 1, isActive: true },
      { name: `Fashion-${uuid}-B`, slug: `fashion-${uuid}-b`, description: 'Clothing', icon: 'shirt', color: '#EC4899', sortOrder: 2, isActive: true }
    ]);
    const res = await agent.get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('posts a product as seller', async () => {
    // Seed categories with truly unique names for this test
    await Category.destroy({ where: {} });
    const uuid = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${Math.random().toString(36).slice(2, 6)}`;
    const categories = await Category.bulkCreate([
      { name: `Electronics-${uuid}-A`, slug: `electronics-${uuid}-a`, description: 'Electronic devices', icon: 'laptop', color: '#3B82F6', sortOrder: 1, isActive: true },
      { name: `Fashion-${uuid}-B`, slug: `fashion-${uuid}-b`, description: 'Clothing', icon: 'shirt', color: '#EC4899', sortOrder: 2, isActive: true }
    ]);
    const categoryId = categories[0]?.id;
    const csrfToken = await getCsrfToken(agent);
    if (!csrfToken) {
      throw new Error('CSRF token not available');
    }
    expect(csrfToken).toBeDefined();
    if (!userId) {
      throw new Error('userId not available for product creation');
    }
    const res = await agent
      .post('/api/products')
      .set('Cookie', cookie)
      .set('X-CSRF-Token', csrfToken)
      .send({
        title: 'Test Product',
        description: 'A product for testing',
        price: 100,
        category_id: categoryId,
        contactPhone: '+231777123456',
        seller_id: userId // Use freshly created userId
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
