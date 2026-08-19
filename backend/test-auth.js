
// Test setup: Ensure models are initialized and test database is seeded
const { sequelize, User } = require('./src/models');
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
});

async function setupTestUser() {
  // Defensive: Remove any existing test user
  await User.destroy({ where: { phone: '77712345' }, force: true });
}

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n');

    // Ensure test user does not exist
    await setupTestUser();

    // Test 1: Register
    console.log('1️⃣ Registering new user...');
    const registerRes = await api.post('/auth/register', {
      name: 'Test User',
      phone: '77712345',
      password: 'password123',
      role: 'buyer' // Ensure required field
    });
    if (!registerRes.headers['set-cookie']) {
      throw new Error('No cookie set on registration response');
    }
    console.log('✅ Registration successful');
    console.log('Cookie:', registerRes.headers['set-cookie'][0].split(';')[0]);

    // Extract cookie
    const cookie = registerRes.headers['set-cookie'][0];
    if (!cookie) throw new Error('No cookie received after registration');

    // Test 2: Check /me endpoint with cookie
    console.log('\n2️⃣ Testing /auth/me with cookie...');
    const meRes = await api.get('/auth/me', {
      headers: { Cookie: cookie }
    });
    if (!meRes.data || !meRes.data.data || !meRes.data.data.name) {
      throw new Error('No user data returned from /auth/me');
    }
    console.log('✅ /auth/me successful');
    console.log('User:', meRes.data.data.name);

    // Test 3: Logout
    console.log('\n3️⃣ Testing logout...');
    await api.post('/auth/logout', {}, {
      headers: { Cookie: cookie }
    });
    console.log('✅ Logout successful');

    // Test 4: Try /me after logout (should fail)
    console.log('\n4️⃣ Testing /auth/me after logout (should fail)...');
    try {
      await api.get('/auth/me', {
        headers: { Cookie: cookie }
      });
      console.log('❌ Should have failed');
    } catch (err) {
      if (err.response && err.response.status === 401) {
        console.log('✅ Correctly failed with 401');
      } else {
        throw err;
      }
    }

    console.log('\n🎉 All tests passed!');
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    process.exit(1);
  } finally {
    // Clean up test user
    await setupTestUser();
    process.exit(0);
  }
}

// Ensure models are initialized before running tests
sequelize.authenticate().then(() => {
  testAuth();
}).catch(err => {
  console.error('❌ Could not authenticate database:', err.message);
  process.exit(1);
});
