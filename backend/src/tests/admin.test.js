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


describe('Admin moderation (reports, suspend/reactivate)', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Report.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  async function setupReportOnUser() {
    const reporter = await registerAndLogin('buyer', 'Reporter Person');
    const badActor = await registerAndLogin('seller', 'Sketchy Seller');
    const admin = await registerAndLogin('buyer', 'Admin Person');
    await User.update({ role: 'admin', roles: ['admin'] }, { where: { id: admin.user.id } });

    const reportRes = await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ reported_user_id: badActor.user.id, reason: 'scam', description: 'Took my money, sent nothing' });
    expect(reportRes.status).toBe(201);

    return { reporter, badActor, admin, reportId: reportRes.body.data.id };
  }

  test('non-admin is forbidden from the reports and moderation endpoints', async () => {
    const { reporter, badActor } = await setupReportOnUser();

    const listRes = await request(app)
      .get('/api/admin/reports')
      .set('Authorization', `Bearer ${reporter.token}`);
    expect(listRes.status).toBe(403);

    const suspendRes = await request(app)
      .post(`/api/admin/users/${badActor.user.id}/suspend`)
      .set('Authorization', `Bearer ${reporter.token}`);
    expect(suspendRes.status).toBe(403);
  });

  test('admin lists a report with reporter/reportedUser attached, then resolves it', async () => {
    const { badActor, admin, reportId } = await setupReportOnUser();

    const listRes = await request(app)
      .get('/api/admin/reports?status=pending')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(listRes.status).toBe(200);
    expect(listRes.body.count).toBe(1);
    expect(listRes.body.data[0].reportedUser.id).toBe(badActor.user.id);
    expect(listRes.body.data[0].reason).toBe('scam');

    const updateRes = await request(app)
      .patch(`/api/admin/reports/${reportId}`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'resolved', admin_notes: 'Suspended the account' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('resolved');
  });

  test('admin suspending a user blocks their login and existing session immediately', async () => {
    const { badActor, admin } = await setupReportOnUser();

    const meBefore = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${badActor.token}`);
    expect(meBefore.status).toBe(200);

    const suspendRes = await request(app)
      .post(`/api/admin/users/${badActor.user.id}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(suspendRes.status).toBe(200);

    // Existing session (same token) should be rejected immediately
    const meAfter = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${badActor.token}`);
    expect(meAfter.status).toBe(401);

    // Fresh login attempt should also be rejected
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ phone: badActor.user.phone, password: testFixturePwd });
    expect(loginRes.status).toBe(401);

    // Reactivating restores access
    const reactivateRes = await request(app)
      .post(`/api/admin/users/${badActor.user.id}/reactivate`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(reactivateRes.status).toBe(200);

    const loginAfterReactivate = await request(app)
      .post('/api/auth/login')
      .send({ phone: badActor.user.phone, password: testFixturePwd });
    expect(loginAfterReactivate.status).toBe(200);
  });

  test('admin cannot suspend another admin', async () => {
    const admin = await registerAndLogin('buyer', 'Admin One');
    const otherAdmin = await registerAndLogin('buyer', 'Admin Two');
    await User.update({ role: 'admin', roles: ['admin'] }, { where: { id: [admin.user.id, otherAdmin.user.id] } });

    const res = await request(app)
      .post(`/api/admin/users/${otherAdmin.user.id}/suspend`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(res.status).toBe(400);
  });

  test('admin can deactivate a reported listing', async () => {
    const seller = await registerAndLogin('seller', 'Listing Seller');
    const reporter = await registerAndLogin('buyer', 'Reporter Two');
    const admin = await registerAndLogin('buyer', 'Admin Three');
    await User.update({ role: 'admin', roles: ['admin'] }, { where: { id: admin.user.id } });

    const category = await Category.create({
      name: `Home ${uid()}`,
      description: 'Home items',
      icon: 'home',
      color: '#3B82F6'
    });

    const productRes = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${seller.token}`)
      .send({
        title: 'Counterfeit Watch',
        description: 'Definitely not real',
        price: 20,
        category_id: category.id,
        condition: 'new',
        location: 'Monrovia'
      });
    expect(productRes.status).toBe(201);
    const productId = productRes.body.data.id;

    await request(app)
      .post('/api/reports')
      .set('Authorization', `Bearer ${reporter.token}`)
      .send({ product_id: productId, reason: 'counterfeit', description: 'Fake brand' });

    const statusRes = await request(app)
      .patch(`/api/products/${productId}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'inactive' });
    expect(statusRes.status).toBe(200);
    expect(statusRes.body.data.status).toBe('inactive');
  });
});

describe('Admin listings browser', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  beforeEach(async () => {
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  test('non-admin is forbidden from the listings endpoint', async () => {
    const { token } = await registerAndLogin('seller', 'Plain Seller');
    const res = await request(app)
      .get('/api/admin/listings')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(403);
  });

  test('admin sees listings across all sellers and statuses, filterable by status and seller', async () => {
    const sellerA = await registerAndLogin('seller', 'Alpha Seller');
    const sellerB = await registerAndLogin('seller', 'Beta Seller');
    const admin = await registerAndLogin('buyer', 'Admin Four');
    await User.update({ role: 'admin', roles: ['admin'] }, { where: { id: admin.user.id } });

    const category = await Category.create({
      name: `Misc ${uid()}`,
      description: 'Misc items',
      icon: 'box',
      color: '#3B82F6'
    });

    const productA = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerA.token}`)
      .send({ title: 'Alpha Item', description: 'From seller A', price: 10, category_id: category.id, condition: 'good', location: 'Monrovia' });
    expect(productA.status).toBe(201);

    const productB = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerB.token}`)
      .send({ title: 'Beta Item', description: 'From seller B', price: 15, category_id: category.id, condition: 'good', location: 'Monrovia' });
    expect(productB.status).toBe(201);

    await request(app)
      .patch(`/api/products/${productB.body.data.id}/status`)
      .set('Authorization', `Bearer ${admin.token}`)
      .send({ status: 'inactive' });

    const allRes = await request(app)
      .get('/api/admin/listings')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(allRes.status).toBe(200);
    expect(allRes.body.count).toBe(2);

    const activeOnly = await request(app)
      .get('/api/admin/listings?status=active')
      .set('Authorization', `Bearer ${admin.token}`);
    expect(activeOnly.body.count).toBe(1);
    expect(activeOnly.body.data[0].title).toBe('Alpha Item');

    const bySeller = await request(app)
      .get(`/api/admin/listings?sellerSearch=${encodeURIComponent(sellerB.user.name)}`)
      .set('Authorization', `Bearer ${admin.token}`);
    expect(bySeller.body.count).toBe(1);
    expect(bySeller.body.data[0].title).toBe('Beta Item');
    expect(bySeller.body.data[0].seller.id).toBe(sellerB.user.id);
  });
});
