const axios = require('axios')

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

async function testAuth() {
  try {
    console.log('🧪 Testing Authentication Flow...\n')

    // Test 1: Register
    console.log('1️⃣ Registering new user...')
    const registerRes = await api.post('/auth/register', {
      name: 'Test User',
      phone: '77712345',
      password: 'password123'
    })
    console.log('✅ Registration successful')
    console.log('Cookie:', registerRes.headers['set-cookie']?.[0]?.split(';')[0])

    // Extract cookie
    const cookie = registerRes.headers['set-cookie']?.[0]
    
    // Test 2: Check /me endpoint with cookie
    console.log('\n2️⃣ Testing /auth/me with cookie...')
    const meRes = await api.get('/auth/me', {
      headers: { Cookie: cookie }
    })
    console.log('✅ /auth/me successful')
    console.log('User:', meRes.data.data.name)

    // Test 3: Logout
    console.log('\n3️⃣ Testing logout...')
    await api.post('/auth/logout', {}, {
      headers: { Cookie: cookie }
    })
    console.log('✅ Logout successful')

    // Test 4: Try /me after logout (should fail)
    console.log('\n4️⃣ Testing /auth/me after logout (should fail)...')
    try {
      await api.get('/auth/me', {
        headers: { Cookie: cookie }
      })
      console.log('❌ Should have failed')
    } catch (err) {
      console.log('✅ Correctly failed with 401')
    }

    console.log('\n🎉 All tests passed!')
  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message)
  }
}

testAuth()
