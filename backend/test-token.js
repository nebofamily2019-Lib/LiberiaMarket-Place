const request = require('supertest');
const app = require('./src/server');
const { sequelize } = require('./src/config/database');

async function testToken() {
  console.log('NODE_ENV:', process.env.NODE_ENV);
  await sequelize.sync({ force: true });
  
  const userRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'SecureP@ssw0rd!',
      phone: '770123456',
      role: 'seller'
    });
  
  console.log('Status:', userRes.status);
  console.log('Response body:', JSON.stringify(userRes.body, null, 2));
  console.log('Token in body:', userRes.body.token);
  console.log('Cookies:', userRes.headers['set-cookie']);
  
  await sequelize.close();
  process.exit(0);
}

testToken().catch(err => {
  console.error(err);
  process.exit(1);
});
