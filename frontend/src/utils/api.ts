import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Log requests in development (except auth checks)
    if (import.meta.env.DEV && config.url !== '/auth/me') {
      console.log('📡 API Request:', config.method?.toUpperCase(), config.url)
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (import.meta.env.DEV && response.config.url !== '/auth/me') {
      console.log('✅ API Response:', response.status, response.config.url)
    }
    return response
  },
  (error) => {
    // Completely suppress 401 errors from showing in console
    // These are expected when checking auth status
    if (error.response?.status === 401) {
      // Only log 401 if it's NOT from /auth/me (unexpected 401s)
      if (error.config?.url !== '/auth/me') {
        console.error('❌ 401 Unauthorized:', error.config?.url)
        console.error('Response:', error.response?.data)
      }
      // Create a clean error without console spam
      const cleanError = new Error('Unauthorized')
      Object.assign(cleanError, error)
      return Promise.reject(cleanError)
    }
    
    // Log other errors
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        message: error.response.data?.error || error.message,
        url: error.config?.url
      })
    }
    
    return Promise.reject(error)
  }
)

export default api
