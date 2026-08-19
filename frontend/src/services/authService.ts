import api from '../utils/api'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: string
  roles?: string[]
  isActive: boolean
  avatar?: string
  location?: string
  preferredPaymentMethods?: string[]
  gender?: 'Male' | 'Female'
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
  roles?: string[]
  gender?: 'Male' | 'Female'
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

    // Store user data only (token is in httpOnly cookie)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Login user
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', credentials)

    // Store user data only (token is in httpOnly cookie)
    if (response.data.user) {
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
      // Remove user data (token is cleared by backend via cookie)
      localStorage.removeItem('user')
    }
  },

  // Logout from all devices
  logoutAll: async (): Promise<void> => {
    try {
      await api.post('/auth/logout-all')
    } catch (error) {
      console.error('Logout all error:', error)
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

    // Token is automatically updated in httpOnly cookie by backend

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

    // Store user data only (token is in httpOnly cookie)
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }

    return response.data
  },

  // Get stored user from localStorage
  getStoredUser: (): User | null => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Check if user is authenticated (weak check, verified by backend on load)
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('user')
  }
}

export default authService
