import axios from 'axios'

// API base URL - using localhost as placeholder
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.error || error.response.data?.message || 'An error occurred'

      // Handle 401 Unauthorized - clear token and redirect to login
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }

      return Promise.reject(new Error(message))
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject(new Error('Connection error. Please check your internet connection.'))
    } else {
      // Something else happened
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'))
    }
  }
)

export default api
