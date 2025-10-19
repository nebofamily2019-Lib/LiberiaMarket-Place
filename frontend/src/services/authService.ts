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
  token: string
  user: User
}

const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data)

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Logout user
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
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

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
    }

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

    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Get stored user from localStorage
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get stored token from localStorage
  getStoredToken: (): string | null => {
    return localStorage.getItem('token')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token')
  }
}

export default authService
