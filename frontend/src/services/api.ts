import axios from 'axios'

// API base URL - using localhost as placeholder
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Send cookies with every request
})

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data)

    const isAuthCheck = error.config?.url?.includes('/auth/me')
    const publicPages = ['/login', '/register', '/']

    if (error.response?.status === 401 && !isAuthCheck && !publicPages.includes(window.location.pathname)) {
      // Redirect to login on 401 from a protected request, but not from the
      // background auth-check (anonymous visitors hit /auth/me on every load)
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
