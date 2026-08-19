// Clear require cache to get fresh server
delete require.cache[require.resolve('./src/server')];
delete require.cache[require.resolve('./src/routes/products')];

const request = require('supertest');
const app = require('./src/server');

request(app)
  .get('/api/products/category/test-id')
  .end((err, res) => {
    console.log('Status:', res.status);
    console.log('Body:', res.body);
    process.exit(0);
  });
