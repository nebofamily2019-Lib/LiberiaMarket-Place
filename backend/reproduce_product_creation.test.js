const request = require('supertest');
const app = require('./src/server');
const { sequelize, User, Category } = require('./src/models');

const fs = require('fs');

describe('Product Creation Reproduction', () => {
  let cookie;
  let token;
  let categoryId;

  beforeAll(async () => {
    // Sync DB
    await sequelize.sync({ force: false });
    
    // Create user
    const userData = {
      name: 'Test Seller',
      phone: '770000000', // 9 digits local
      password: 'Password!987',
      role: 'seller'
    };
    
    // Clean up if exists
    await User.destroy({ where: { phone: userData.phone } });

    const res = await request(app)
      .post('/api/auth/register')
      .send(userData);
      
    fs.writeFileSync('debug.log', `Register status: ${res.status}\n`);
    fs.writeFileSync('debug.log', `Register body: ${JSON.stringify(res.body, null, 2)}\n`, { flag: 'a' });
    fs.writeFileSync('debug.log', `Register headers: ${JSON.stringify(res.headers, null, 2)}\n`, { flag: 'a' });

    cookie = res.headers['set-cookie'];
    token = res.body.token;

    // Create category
    const category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test',
      icon: 'T',
      color: '#000000'
    });
    categoryId = category.id;
  });

  it('should create a product successfully', async () => {
    let req = request(app).post('/api/products');
      
    if (cookie) {
        req.set('Cookie', cookie);
    } else if (token) {
        req.set('Authorization', `Bearer ${token}`);
    }

    const res = await req
      .field('title', 'Test Product')
      .field('description', 'This is a test product')
      .field('price', '100')
      .field('currency', 'USD')
      .field('category_id', categoryId)
      .field('location', 'Monrovia')
      .field('condition', 'new');

    if (res.status !== 201) {
      console.error('Create Product Error:', JSON.stringify(res.body, null, 2));
    }
    
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
