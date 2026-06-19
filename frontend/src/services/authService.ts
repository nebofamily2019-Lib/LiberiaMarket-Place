import api from './api'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  isActive: boolean
  avatar?: string
  location?: string
  preferredPaymentMethods?: string[]
}

export interface LoginCredentials {
  phone: string
  password: string
}

export interface RegisterData {
  name: string
  email?: string
  phone: string
  password: string
  role?: 'buyer' | 'seller'
}

export interface AuthResponse {
  success: boolean
  message: string
  user: User
}

// The auth token itself lives only in the backend's httpOnly cookie
// (sent automatically via withCredentials) - it's never readable from JS.
// We cache the user object in localStorage purely so the UI can paint
// instantly on reload; checkAuth() always re-validates against the server.
const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('user')
    }
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me')
    return response.data.data
  },

  // Update password
  updatePassword: async (currentPassword: string, newPassword: string): Promise<AuthResponse> => {
    const response = await api.put<AuthResponse>('/auth/update-password', {
      currentPassword,
      newPassword
    })
    return response.data
  },

  // Forgot password
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post('/auth/forgot-password', { email })
    return response.data
  },

  // Reset password
  resetPassword: async (resetToken: string, password: string): Promise<AuthResponse> => {
    const response = await api.put<AuthResponse>(`/auth/reset-password/${resetToken}`, {
      password
    })
    localStorage.setItem('user', JSON.stringify(response.data.user))
    return response.data
  },

  // Get cached user from localStorage (for instant UI hydration only)
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  }
}

export default authService
