/**
 * User utility functions
 * Helper functions to get current user information from localStorage
 */

export interface User {
  id: string
  name: string
  email?: string
  phone: string
  role: 'buyer' | 'seller' | 'admin'
  isPhoneVerified?: boolean
  isEmailVerified?: boolean
  paymentMethods?: string[]
  createdAt?: string
}

/**
 * Get the current logged-in user from localStorage
 * @returns User object or null if not logged in
 */
export const getCurrentUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch (error) {
    console.error('Error parsing user from localStorage:', error)
    return null
  }
}

/**
 * Export user as a named export for backward compatibility
 */
export const user = getCurrentUser()

/**
 * Get user's role
 * @returns user role or null
 */
export const getUserRole = (): 'buyer' | 'seller' | 'admin' | null => {
  const currentUser = getCurrentUser()
  return currentUser?.role || null
}

/**
 * Check if user has a specific role
 * @param role - role to check
 * @returns boolean
 */
export const hasRole = (role: 'buyer' | 'seller' | 'admin'): boolean => {
  const currentUser = getCurrentUser()
  return currentUser?.role === role
}

/**
 * Get user ID
 * @returns user ID or null
 */
export const getUserId = (): string | null => {
  const currentUser = getCurrentUser()
  return currentUser?.id || null
}

export default {
  getCurrentUser,
  user,
  getUserRole,
  hasRole,
  getUserId
}
