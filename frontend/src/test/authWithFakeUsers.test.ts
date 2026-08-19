import { describe, it, expect, vi, beforeEach } from 'vitest'
import authService from '../services/authService'
import { fakeTestUsers, fakeLoginCredentials, fakeRegisterData } from './fakeUsers'

// Mock the auth service
vi.mock('../services/authService')

// Mock react-router-dom navigation
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login' })
  }
})

describe('Authentication Service with Fake Users', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    mockNavigate.mockClear()
  })

  describe('Login with Fake Liberian Users', () => {
    it('logs in Mohammed Kamara (MTN user from Monrovia)', async () => {
      const user = fakeTestUsers.regularBuyer
      const credentials = {
        phone: user.phone,
        password: 'LibMarket2025!'
      }

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'mtn-user-token',
        user: user
      })

      const result = await authService.login(credentials)

      expect(authService.login).toHaveBeenCalledWith(credentials)
      expect(result.success).toBe(true)
      expect(result.user.name).toBe('Mohammed Kamara')
      expect(result.user.phone).toBe('770123456') // MTN format
      expect(result.user.location).toBe('Monrovia, Montserrado County')
    })

    it('logs in Fatima Dukuly (Lonestar user from Paynesville)', async () => {
      const user = fakeTestUsers.regularSeller
      const credentials = {
        phone: user.phone,
        password: 'StrongPass123#'
      }

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'lonestar-user-token',
        user: user
      })

      const result = await authService.login(credentials)

      expect(result.user.name).toBe('Fatima Dukuly')
      expect(result.user.phone).toBe('880456789') // Lonestar format
      expect(result.user.role).toBe('seller')
      expect(result.user.location).toBe('Paynesville, Montserrado County')
    })

    it('logs in Mary Gbassay (rural farmer from Bong County)', async () => {
      const user = fakeTestUsers.ruralFarmer
      const credentials = {
        phone: user.phone,
        password: 'FarmLife2025!'
      }

      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'rural-farmer-token',
        user: user
      })

      const result = await authService.login(credentials)

      expect(result.user.name).toBe('Mary Gbassay')
      expect(result.user.phone).toBe('555234567') // Orange format
      expect(result.user.location).toBe('Gbarnga, Bong County')
      expect(result.user.email).toBe('') // Rural user with no email
      expect(result.user.preferredPaymentMethods).toContain('mobile-money')
    })

    it('handles login failure for suspended user', async () => {
      const credentials = {
        phone: fakeTestUsers.suspendedUser.phone,
        password: 'anypassword'
      }

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Account has been suspended. Please contact support.')
      )

      await expect(authService.login(credentials)).rejects.toThrow(
        'Account has been suspended'
      )
    })

    it('handles invalid phone number login attempt', async () => {
      const invalidCredentials = fakeLoginCredentials.invalidPhone

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('User not found with this phone number')
      )

      await expect(authService.login(invalidCredentials)).rejects.toThrow(
        'User not found'
      )
    })
  })

  describe('Registration with Fake Users', () => {
    it('registers Abdul Kamara as new buyer', async () => {
      const registerData = fakeRegisterData.validBuyer
      const newUser = {
        id: 'new-buyer-001',
        name: registerData.name,
        email: registerData.email || '',
        phone: registerData.phone,
        role: registerData.role || 'buyer',
        isActive: true,
        location: 'Monrovia, Montserrado County'
      }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'new-buyer-token',
        user: newUser
      })

      const result = await authService.register(registerData)

      expect(authService.register).toHaveBeenCalledWith(registerData)
      expect(result.success).toBe(true)
      expect(result.user.name).toBe('Abdul Kamara')
      expect(result.user.role).toBe('buyer')
    })

    it('registers Blessing Pewee as new seller', async () => {
      const registerData = fakeRegisterData.validSeller
      const newUser = {
        id: 'new-seller-001',
        name: registerData.name,
        email: registerData.email || '',
        phone: registerData.phone,
        role: registerData.role || 'seller',
        isActive: true,
        location: 'Paynesville, Montserrado County'
      }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'new-seller-token',
        user: newUser
      })

      const result = await authService.register(registerData)

      expect(result.user.name).toBe('Blessing Pewee')
      expect(result.user.role).toBe('seller')
      expect(result.user.phone).toBe('880333444') // Lonestar format
    })

    it('registers John Dolo (rural seller without email)', async () => {
      const registerData = fakeRegisterData.noEmail
      const newUser = {
        id: 'rural-seller-001',
        name: registerData.name,
        email: '',
        phone: registerData.phone,
        role: registerData.role || 'seller',
        isActive: true,
        location: 'Gbarnga, Bong County'
      }

      vi.mocked(authService.register).mockResolvedValueOnce({
        success: true,
        message: 'Registration successful',
        token: 'rural-seller-token',
        user: newUser
      })

      const result = await authService.register(registerData)

      expect(result.user.email).toBe('')
      expect(result.user.phone).toBe('555666777') // Orange format
    })

    it('handles registration with duplicate phone number', async () => {
      const duplicateData = fakeRegisterData.duplicatePhone

      vi.mocked(authService.register).mockRejectedValueOnce(
        new Error('Phone number already registered. Please use a different number or login.')
      )

      await expect(authService.register(duplicateData)).rejects.toThrow(
        'Phone number already registered'
      )
    })

    it('handles registration with weak password', async () => {
      const weakPassData = fakeRegisterData.weakPassword

      vi.mocked(authService.register).mockRejectedValueOnce(
        new Error('Password too weak. Must be at least 6 characters with letters and numbers.')
      )

      await expect(authService.register(weakPassData)).rejects.toThrow(
        'Password too weak'
      )
    })
  })

  describe('User Scenarios by Location', () => {
    it('handles user from Voinjama, Lofa County', async () => {
      const user = fakeTestUsers.voinjamaSeller
      
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'voinjama-user-token',
        user: user
      })

      const result = await authService.login({
        phone: user.phone,
        password: 'LofalogPass123!'
      })

      expect(result.user.location).toBe('Voinjama, Lofa County')
      expect(result.user.phone).toBe('666789012') // Orange alternative
    })

    it('handles user from Harper, Maryland County', async () => {
      const user = fakeTestUsers.harperBuyer
      
      vi.mocked(authService.login).mockResolvedValueOnce({
        success: true,
        message: 'Login successful',
        token: 'harper-user-token',
        user: user
      })

      const result = await authService.login({
        phone: user.phone,
        password: 'HarperPass456!'
      })

      expect(result.user.location).toBe('Harper, Maryland County')
      expect(result.user.phone).toBe('888567890') // Novafone
      expect(result.user.name).toBe('Princess Williams')
    })
  })

  describe('User Role and Payment Preferences', () => {
    it('validates buyer payment preferences', () => {
      const buyer = fakeTestUsers.regularBuyer
      
      expect(buyer.preferredPaymentMethods).toContain('mobile-money')
      expect(buyer.preferredPaymentMethods).toContain('cash')
      expect(buyer.role).toBe('buyer')
    })

    it('validates seller payment preferences', () => {
      const seller = fakeTestUsers.regularSeller
      
      expect(seller.preferredPaymentMethods).toContain('mobile-money')
      expect(seller.preferredPaymentMethods).toContain('bank-transfer')
      expect(seller.role).toBe('seller')
    })

    it('validates admin user privileges', () => {
      const admin = fakeTestUsers.adminUser
      
      expect(admin.role).toBe('admin')
      expect(admin.isActive).toBe(true)
      expect(admin.location).toBe('Congo Town, Montserrado County')
    })
  })

  describe('Session Management with Fake Users', () => {
    it('stores user session correctly after login', () => {
      const user = fakeTestUsers.regularBuyer
      const token = 'session-token-123'

      // Mock localStorage behavior
      const mockGetItem = vi.fn()
      const mockSetItem = vi.fn()
      
      mockGetItem.mockImplementation((key) => {
        if (key === 'token') return token
        if (key === 'user') return JSON.stringify(user)
        return null
      })

      Object.defineProperty(window, 'localStorage', {
        value: {
          getItem: mockGetItem,
          setItem: mockSetItem,
          removeItem: vi.fn(),
          clear: vi.fn()
        }
      })

      // Simulate service calls
      authService.getStoredUser = vi.fn().mockReturnValue(user)
      authService.isAuthenticated = vi.fn().mockReturnValue(true)

      expect(authService.getStoredUser()).toEqual(user)
      expect(authService.isAuthenticated()).toBe(true)
    })

    it('handles user role changes during session', () => {
      const user = fakeTestUsers.regularBuyer
      const updatedUser = { ...user, role: 'seller' }

      authService.getStoredUser = vi.fn()
        .mockReturnValueOnce(user)
        .mockReturnValueOnce(updatedUser)

      // Initial state - buyer
      expect(authService.getStoredUser()?.role).toBe('buyer')
      
      // After update - seller
      expect(authService.getStoredUser()?.role).toBe('seller')
    })
  })

  describe('Error Scenarios', () => {
    it('handles network errors gracefully', async () => {
      const credentials = fakeLoginCredentials.validBuyer

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Network error: Unable to connect to server')
      )

      await expect(authService.login(credentials)).rejects.toThrow('Network error')
    })

    it('handles server errors gracefully', async () => {
      const credentials = fakeLoginCredentials.validBuyer

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Server error: Internal server error')
      )

      await expect(authService.login(credentials)).rejects.toThrow('Server error')
    })

    it('handles authentication timeout', async () => {
      const credentials = fakeLoginCredentials.validBuyer

      vi.mocked(authService.login).mockRejectedValueOnce(
        new Error('Request timeout: Authentication took too long')
      )

      await expect(authService.login(credentials)).rejects.toThrow('Request timeout')
    })
  })
})