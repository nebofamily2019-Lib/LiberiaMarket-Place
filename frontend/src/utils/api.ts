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
    console.log('CSRF token fetched')
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error)
  }
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url)
    console.log('Cookies will be sent:', document.cookie ? 'Yes' : 'No')

    // When sending FormData, delete Content-Type so the browser can set it
    // automatically with the correct multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }

    // Add CSRF token to non-GET requests
    if (config.method && !['get', 'head', 'options'].includes(config.method.toLowerCase())) {
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
        console.log('CSRF Token added to request:', csrfToken.substring(0, 10) + '...')
      } else {
        console.warn('No CSRF token available for', config.method, config.url)
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
    // console.log('API Response:', response.status, response.config.url);
    return response;
  },
  async (error) => {
    const status = error.response?.status
    const url = error.config?.url
    const message = error.response?.data?.error || error.message

    // Handle CSRF token errors - retry with fresh token
    if (status === 403 && message.includes('csrf')) {
      console.warn('CSRF token invalid, fetching new token...')
      await fetchCsrfToken()

      // Retry the original request with new token
      const originalRequest = error.config
      if (csrfToken) {
        originalRequest.headers['X-CSRF-Token'] = csrfToken
      }
      return api(originalRequest)
    }

    // Only log non-401 errors (401 is expected when not logged in)
    if (status !== 401) {
      console.error('API Error:', { status, message, url })
    }

    // Note: We don't automatically redirect to /login on 401 errors
    // Public pages like Home should work without authentication
    // Individual components can handle 401 errors as needed

    return Promise.reject({
      status,
      message,
      url,
      response: error.response
    })
  }
)

export default api
