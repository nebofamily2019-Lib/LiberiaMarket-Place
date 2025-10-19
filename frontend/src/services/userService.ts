import api from './api'
import { User } from './authService'

export interface UpdateUserProfileData {
  name?: string
  phone?: string
  location?: string
}

export interface UserResponse {
  success: boolean
  data: User
  message?: string
}

export interface UsersListResponse {
  success: boolean
  count: number
  data: User[]
}

const userService = {
  // Get user profile (current user)
  getUserProfile: async (): Promise<User> => {
    const response = await api.get<UserResponse>('/users/profile')
    return response.data.data
  },

  // Update user profile
  updateUserProfile: async (data: UpdateUserProfileData): Promise<User> => {
    const response = await api.put<UserResponse>('/users/profile', data)

    // Update localStorage with new user data
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const currentUser = JSON.parse(userStr)
      const updatedUser = { ...currentUser, ...response.data.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return response.data.data
  },

  // Upload user avatar
  uploadAvatar: async (avatarFile: File): Promise<User> => {
    const formData = new FormData()
    formData.append('avatar', avatarFile)

    const response = await api.post<UserResponse>('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    // Update localStorage with new user data
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const currentUser = JSON.parse(userStr)
      const updatedUser = { ...currentUser, ...response.data.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return response.data.data
  },

  // Get specific user by ID (public)
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get<UserResponse>(`/users/${userId}`)
    return response.data.data
  },

  // Admin: Get all users
  getAllUsers: async (): Promise<User[]> => {
    const response = await api.get<UsersListResponse>('/users')
    return response.data.data
  },

  // Admin: Update user
  updateUser: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await api.put<UserResponse>(`/users/${userId}`, data)
    return response.data.data
  },

  // Admin: Delete user
  deleteUser: async (userId: string): Promise<void> => {
    await api.delete(`/users/${userId}`)
  },

  // Update payment preferences
  updatePaymentPreferences: async (preferredPaymentMethods: string[]): Promise<User> => {
    const response = await api.put<UserResponse>('/users/payment-preferences', {
      preferredPaymentMethods
    })

    // Update localStorage with new user data
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const currentUser = JSON.parse(userStr)
      const updatedUser = { ...currentUser, ...response.data.data }
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }

    return response.data.data
  }
}

export default userService
