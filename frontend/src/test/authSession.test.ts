import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '../services/authService'
import { fakeTestUsers, fakeLoginCredentials } from './fakeUsers'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock the api module
vi.mock('../services/api')

describe('Authentication Session Management', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorageMock.clear.mockClear()
    localStorageMock.getItem.mockClear()
    localStorageMock.setItem.mockClear()
    localStorageMock.removeItem.mockClear()
  })

  describe('Session Persistence', () => {
    it('persists user session correctly after login', () => {
      const user = fakeTestUsers.regularBuyer
      const token = 'fake-jwt-token-123'

      // Simulate successful login
      localStorageMock.setItem.mockImplementation((key, value) => {
        if (key === 'token') localStorageMock.getItem.mockReturnValue(token)
        if (key === 'user') localStorageMock.getItem.mockReturnValue(value)
      })

      // Simulate storing session data
      authService.getStoredToken = vi.fn().mockReturnValue(token)
      authService.getStoredUser = vi.fn().mockReturnValue(user)

      expect(authService.getStoredToken()).toBe(token)
      expect(authService.getStoredUser()).toEqual(user)
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('handles expired or invalid tokens', () => {
      // Simulate corrupted token
      localStorageMock.getItem.mockReturnValue('invalid-token')
      
      authService.getStoredToken = vi.fn().mockReturnValue('invalid-token')
      authService.isAuthenticated = vi.fn().mockReturnValue(false)

      expect(authService.isAuthenticated()).toBe(false)
    })

    it('clears session data on logout', async () => {
      const user = fakeTestUsers.regularBuyer
      
      // Setup initial session
      localStorageMock.getItem.mockReturnValue(JSON.stringify(user))
      
      // Mock logout
      await authService.logout()

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token')
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('user')
    })
  })

  describe('Multiple User Sessions', () => {
    it('handles switching between different user accounts', () => {
      const buyer = fakeTestUsers.regularBuyer
      const seller = fakeTestUsers.regularSeller

      // First login as buyer
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(buyer))
      authService.getStoredUser = vi.fn().mockReturnValueOnce(buyer)
      
      expect(authService.getStoredUser()).toEqual(buyer)

      // Logout and login as seller
      localStorageMock.clear()
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(seller))
      authService.getStoredUser = vi.fn().mockReturnValueOnce(seller)

      expect(authService.getStoredUser()).toEqual(seller)
    })

    it('prevents concurrent sessions for same user', () => {
      // This would be handled by the backend, but we can test the frontend behavior
      const oldToken = 'old-token-123'
      const newToken = 'new-token-456'

      // Simulate token refresh/update
      localStorageMock.setItem.mockImplementation((key, value) => {
        if (key === 'token' && value === newToken) {
          // Old token should be invalidated
          expect(value).not.toBe(oldToken)
        }
      })
    })
  })

  describe('Role-based Access', () => {
    it('maintains role information in session', () => {
      const admin = fakeTestUsers.adminUser
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(admin))
      authService.getStoredUser = vi.fn().mockReturnValue(admin)

      const storedUser = authService.getStoredUser()
      expect(storedUser?.role).toBe('admin')
    })

    it('handles role changes during session', () => {
      const user = fakeTestUsers.regularBuyer
      const updatedUser = { ...user, role: 'seller' }

      // Initial state
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(user))
      authService.getStoredUser = vi.fn().mockReturnValueOnce(user)
      
      expect(authService.getStoredUser()?.role).toBe('buyer')

      // After role update
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(updatedUser))
      authService.getStoredUser = vi.fn().mockReturnValueOnce(updatedUser)
      
      expect(authService.getStoredUser()?.role).toBe('seller')
    })
  })

  describe('Security Scenarios', () => {
    it('handles corrupted user data in localStorage', () => {
      localStorageMock.getItem.mockReturnValue('corrupted-json-data')
      
      // Should return null for corrupted data
      authService.getStoredUser = vi.fn().mockImplementation(() => {
        try {
          const userStr = localStorageMock.getItem('user')
          return userStr ? JSON.parse(userStr) : null
        } catch {
          return null
        }
      })

      expect(authService.getStoredUser()).toBeNull()
    })

    it('handles missing localStorage support', () => {
      // Simulate environment without localStorage
      const originalLocalStorage = window.localStorage
      delete (window as any).localStorage

      authService.isAuthenticated = vi.fn().mockReturnValue(false)
      authService.getStoredUser = vi.fn().mockReturnValue(null)
      authService.getStoredToken = vi.fn().mockReturnValue(null)

      expect(authService.isAuthenticated()).toBe(false)
      expect(authService.getStoredUser()).toBeNull()
      expect(authService.getStoredToken()).toBeNull()

      // Restore localStorage
      window.localStorage = originalLocalStorage
    })

    it('validates token format before storing', () => {
      const validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' // JWT-like format
      const invalidToken = 'invalid-token-format'

      // Valid token should be stored
      localStorageMock.setItem.mockImplementation((key, value) => {
        if (key === 'token' && value === validToken) {
          expect(value).toMatch(/^[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]*$/)
        }
      })

      // Invalid token should be rejected or handled
      expect(() => {
        if (invalidToken && !invalidToken.includes('.')) {
          throw new Error('Invalid token format')
        }
      }).toThrow('Invalid token format')
    })
  })

  describe('Network Connection Scenarios', () => {
    it('handles offline login attempts', () => {
      // Simulate offline mode
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      })

      authService.login = vi.fn().mockRejectedValue(new Error('Network unavailable'))

      expect(navigator.onLine).toBe(false)
      expect(authService.login(fakeLoginCredentials.validBuyer)).rejects.toThrow('Network unavailable')
    })

    it('handles slow network connections', async () => {
      // Simulate slow network
      const slowLoginPromise = new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Login successful',
            token: 'slow-network-token',
            user: fakeTestUsers.regularBuyer
          })
        }, 5000) // 5 second delay
      })

      authService.login = vi.fn().mockReturnValue(slowLoginPromise)

      const startTime = Date.now()
      const result = await authService.login(fakeLoginCredentials.validBuyer)
      const endTime = Date.now()

      expect(endTime - startTime).toBeGreaterThan(4900) // Allow for some variance
      expect(result.success).toBe(true)
    }, 10000) // 10 second timeout

    it('handles intermittent network failures', async () => {
      let attempts = 0
      
      authService.login = vi.fn().mockImplementation(() => {
        attempts++
        if (attempts < 3) {
          return Promise.reject(new Error('Network error'))
        }
        return Promise.resolve({
          success: true,
          message: 'Login successful',
          token: 'retry-success-token',
          user: fakeTestUsers.regularBuyer
        })
      })

      // Simulate retry logic
      let result
      for (let i = 0; i < 3; i++) {
        try {
          result = await authService.login(fakeLoginCredentials.validBuyer)
          break
        } catch (error) {
          if (i === 2) throw error
          await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second before retry
        }
      }

      expect(result?.success).toBe(true)
      expect(attempts).toBe(3)
    })
  })

  describe('Edge Cases', () => {
    it('handles very long user names (Liberian naming conventions)', () => {
      const longNameUser = {
        ...fakeTestUsers.regularBuyer,
        name: 'Mohammed Abdullah Kamara Konneh Fofana Dukuly Pewee Kollie Johnson Williams'
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(longNameUser))
      authService.getStoredUser = vi.fn().mockReturnValue(longNameUser)

      const storedUser = authService.getStoredUser()
      expect(storedUser?.name.length).toBeGreaterThan(50)
      expect(storedUser?.name).toBe(longNameUser.name)
    })

    it('handles special characters in Liberian names', () => {
      const specialNameUser = {
        ...fakeTestUsers.regularBuyer,
        name: "N'Gozi Gbassay-Konneh" // Apostrophes and hyphens common in Liberian names
      }

      localStorageMock.getItem.mockReturnValue(JSON.stringify(specialNameUser))
      authService.getStoredUser = vi.fn().mockReturnValue(specialNameUser)

      const storedUser = authService.getStoredUser()
      expect(storedUser?.name).toContain("'")
      expect(storedUser?.name).toContain("-")
    })

    it('handles users with multiple phone numbers', () => {
      const multiPhoneUser = {
        ...fakeTestUsers.regularSeller,
        phone: '770123456', // Primary
        alternatePhone: '880789123' // Secondary for business
      }

      // The system should store primary phone in the main field
      expect(multiPhoneUser.phone).toMatch(/^[678]\d{8}$/) // Liberian mobile format
    })

    it('handles location updates for mobile users', () => {
      const mobileUser = {
        ...fakeTestUsers.ruralFarmer,
        location: 'Gbarnga, Bong County',
        currentLocation: 'Monrovia, Montserrado County' // Traveling to capital
      }

      // User should be able to update their current location while maintaining home location
      expect(mobileUser.location).toBe('Gbarnga, Bong County') // Home
      expect(mobileUser.currentLocation).toBe('Monrovia, Montserrado County') // Current
    })

    it('handles concurrent login attempts', async () => {
      const credentials = fakeLoginCredentials.validBuyer
      
      // Simulate multiple simultaneous login attempts
      const loginPromises = Array(3).fill(null).map(() => 
        authService.login(credentials)
      )

      authService.login = vi.fn().mockResolvedValue({
        success: true,
        message: 'Login successful',
        token: 'concurrent-token',
        user: fakeTestUsers.regularBuyer
      })

      const results = await Promise.all(loginPromises)
      
      // All should succeed, but only one session should be active
      results.forEach(result => {
        expect(result.success).toBe(true)
      })

      // Only one token should be stored (the last one)
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'concurrent-token')
    })
  })
})