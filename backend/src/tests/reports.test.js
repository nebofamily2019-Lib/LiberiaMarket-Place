const request = require('supertest');
const app = require('../server');
const { User, Product, Category, Report } = require('../models');
const { sequelize } = require('../config/database');

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const genEmail = (p = 'user') => `${p}.${uid()}@example.com`;
const genPhone = (prefix = '77') => `${prefix}${Array.from({ length: 7 }, () => Math.floor(Math.random() * 10)).join('')}`;
const testFixturePwd = 'SecureP@ssw0rd!';

async function registerAndLogin(role, name) {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ name, email: genEmail(role), password: testFixturePwd, phone: genPhone(), role });
  if (res.status !== 201) {
    throw new Error(`Registration failed for ${role}: ${JSON.stringify(res.body)}`);
  }
  const token = res.body.token || (res.body.data && res.body.data.token);
  const user = res.body.user || res.body.data;
  return { token, user };
}

describe('POST /api/reports', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Report.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test('requires authentication', async () => {
    const res = await request(app).post('/api/reports').send({ reason: 'scam', description: 'x' });
    expect(res.status).toBe(401);
  });

  test('rejects a report with no target and no description', async () => {
    const reporter = await registerAndLogin('buyer', 'Reporter');
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ reason: 'other' });
    expect(res.status).toBe(400);
  });

  test('accepts a general platform report with only a description', async () => {
    const reporter = await registerAndLogin('buyer', 'Reporter');
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ reason: 'other', description: 'General complaint not tied to a listing or user' });
    expect(res.status).toBe(201);
    expect(res.body.data.reported_user_id).toBeFalsy();
    expect(res.body.data.product_id).toBeFalsy();

    const listRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Admin', email: genEmail('admin'), password: testFixturePwd, phone: genPhone(), role: 'buyer' });
    await User.update({ role: 'admin', roles: ['admin'] }, { where: { id: listRes.body.user.id } });
    const adminToken = listRes.body.token;

    const reportsRes = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(reportsRes.status).toBe(200);
    expect(reportsRes.body.count).toBe(1);
    expect(reportsRes.body.data[0].reportedUser).toBeNull();
    expect(reportsRes.body.data[0].product).toBeNull();
  });

  test('accepts a report tied to a specific product', async () => {
    const seller = await registerAndLogin('seller', 'Seller');
    const reporter = await registerAndLogin('buyer', 'Reporter');

    const category = await Category.create({
      name: `Cat ${uid()}`,
      description: 'test category',
      icon: 'box',
      color: '#3B82F6'
    });
    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({ title: 'Item', description: 'desc', price: 10, category_id: category.id, condition: 'good', location: 'Monrovia' });

    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ product_id: productRes.body.data.id, reason: 'counterfeit', description: 'Fake item' });
    expect(res.status).toBe(201);
    expect(res.body.data.product_id).toBe(productRes.body.data.id);
  });

  test('404s when the reported product does not exist', async () => {
    const reporter = await registerAndLogin('buyer', 'Reporter');
    const res = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ product_id: '00000000-0000-0000-0000-000000000000', reason: 'other', description: 'x' });
    expect(res.status).toBe(404);
  });
});
