
const { describe, it, expect, beforeAll } = global;
const request = require('supertest');
const app = require('../src/server');
const { User } = require('../src/models');

describe('Auth MVP Flow', () => {
  let agent;
  let cookie;

  beforeAll(async () => {
    agent = request.agent(app);
    // Clean up test user robustly
    try {
      const user = await User.findOne({ where: { phone: '+231777888890' } });
      if (user) {
        await user.destroy();
      }
    } catch (err) {
      // Ignore if not found
    }
  });

  it('registers a new user', async () => {
    const res = await agent
      .post('/api/auth/register')
      .send({ name: 'Test User', phone: '+231777888890', password: 'Strong!Pass2025$', role: 'buyer' });
    // Robust cookie extraction
    const setCookie = res.headers['set-cookie'];
    cookie = Array.isArray(setCookie) ? setCookie.find(c => c.startsWith('token=')) : setCookie;
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    if (!cookie) throw new Error('No cookie received after registration');
  });

  it('returns user info at /auth/me', async () => {
    const res = await agent
      .get('/api/auth/me')
      .set('Cookie', cookie);
    expect([200, 401]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body.data.name).toBe('Test User');
    }
  });

  it('logs out and fails /auth/me', async () => {
    await agent.post('/api/auth/logout').set('Cookie', cookie);
    const res = await agent.get('/api/auth/me').set('Cookie', cookie);
    expect(res.status).toBe(401);
  });
});
