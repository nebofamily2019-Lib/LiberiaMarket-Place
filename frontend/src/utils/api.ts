import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
})

// Store CSRF token
let csrfToken: string | null = null

// Fetch CSRF token on app load
export const fetchCsrfToken = async () => {
  try {
    const response = await api.get('/csrf-token')
    csrfToken = response.data.csrfToken
    console.log('🔒 CSRF token fetched')
  } catch (error) {
    console.error('❌ Failed to fetch CSRF token:', error)
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('📡 API Request:', config.method?.toUpperCase(), config.url)
    console.log('🍪 Cookies will be sent:', document.cookie ? 'Yes' : 'No')
    
    // Add CSRF token to non-GET requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
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
    // console.log('✅ API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const message = error.response?.data?.error || error.message

    // Only log non-401 errors (401 is expected when not logged in)
    if (status !== 401) {
      console.error('❌ API Error:', { status, message, url })
    }

    // Handle 401 specifically
    if (status === 401 && url !== '/auth/me') {
      console.warn('⚠️ Session expired or invalid. Redirecting to login...')
      window.location.href = '/login'
    }

    return Promise.reject({
      status,
      message,
      url
    })
  }
)

export default api
