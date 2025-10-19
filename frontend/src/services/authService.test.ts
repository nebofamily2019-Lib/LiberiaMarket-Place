import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import authService from './authService'
import api from './api'
import { mockUser, mockAuthResponse } from '../test/mockData'

// Mock the api module
vi.mock('./api')

describe('authService', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('register', () => {
    it('registers a new user and stores token', async () => {
      const registerData = {
        name: 'John Doe',
        phone: '881234567',
        password: 'password123',
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockAuthResponse,
      } as any)

      const result = await authService.register(registerData)

      expect(api.post).toHaveBeenCalledWith('/auth/register', registerData)
      expect(result).toEqual(mockAuthResponse)
      expect(localStorage.getItem('token')).toBe(mockAuthResponse.token)
      expect(localStorage.getItem('user')).toBe(
        JSON.stringify(mockAuthResponse.user)
      )
    })

    it('handles registration error', async () => {
      const error = new Error('Registration failed')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      await expect(
        authService.register({
          name: 'Test',
          phone: '881234567',
          password: 'pass',
        })
      ).rejects.toThrow('Registration failed')

      expect(localStorage.getItem('token')).toBeNull()
    })
  })

  describe('login', () => {
    it('logs in user and stores token', async () => {
      const credentials = {
        phone: '881234567',
        password: 'password123',
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        data: mockAuthResponse,
      } as any)

      const result = await authService.login(credentials)

      expect(api.post).toHaveBeenCalledWith('/auth/login', credentials)
      expect(result).toEqual(mockAuthResponse)
      expect(localStorage.getItem('token')).toBe(mockAuthResponse.token)
      expect(localStorage.getItem('user')).toBe(
        JSON.stringify(mockAuthResponse.user)
      )
    })

    it('handles login error', async () => {
      const error = new Error('Invalid credentials')
      vi.mocked(api.post).mockRejectedValueOnce(error)

      await expect(
        authService.login({ phone: '881234567', password: 'wrong' })
      ).rejects.toThrow('Invalid credentials')
    })
  })

  describe('logout', () => {
    it('clears token and user from localStorage', async () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      vi.mocked(api.post).mockResolvedValueOnce({ data: {} } as any)

      await authService.logout()

      expect(api.post).toHaveBeenCalledWith('/auth/logout')
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })

    it('clears localStorage even if API call fails', async () => {
      localStorage.setItem('token', 'test-token')
      localStorage.setItem('user', JSON.stringify(mockUser))

      vi.mocked(api.post).mockRejectedValueOnce(new Error('Network error'))

      await authService.logout()

      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('user')).toBeNull()
    })
  })

  describe('getCurrentUser', () => {
    it('fetches current user data', async () => {
      vi.mocked(api.get).mockResolvedValueOnce({
        data: { success: true, data: mockUser },
      } as any)

      const result = await authService.getCurrentUser()

      expect(api.get).toHaveBeenCalledWith('/auth/me')
      expect(result).toEqual(mockUser)
    })

    it('handles error when fetching current user', async () => {
      vi.mocked(api.get).mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(authService.getCurrentUser()).rejects.toThrow('Unauthorized')
    })
  })

  describe('updatePassword', () => {
    it('updates password and stores new token', async () => {
      const newAuthResponse = {
        ...mockAuthResponse,
        token: 'new-token-123',
      }

      vi.mocked(api.put).mockResolvedValueOnce({
        data: newAuthResponse,
      } as any)

      const result = await authService.updatePassword('oldpass', 'newpass')

      expect(api.put).toHaveBeenCalledWith('/auth/update-password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      })
      expect(result).toEqual(newAuthResponse)
      expect(localStorage.getItem('token')).toBe('new-token-123')
    })
  })

  describe('forgotPassword', () => {
    it('sends forgot password request', async () => {
      const response = {
        success: true,
        message: 'Reset email sent',
      }

      vi.mocked(api.post).mockResolvedValueOnce({
        data: response,
      } as any)

      const result = await authService.forgotPassword('test@example.com')

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      })
      expect(result).toEqual(response)
    })
  })

  describe('resetPassword', () => {
    it('resets password with token and stores new auth', async () => {
      vi.mocked(api.put).mockResolvedValueOnce({
        data: mockAuthResponse,
      } as any)

      const result = await authService.resetPassword('reset-token-123', 'newpass')

      expect(api.put).toHaveBeenCalledWith('/auth/reset-password/reset-token-123', {
        password: 'newpass',
      })
      expect(result).toEqual(mockAuthResponse)
      expect(localStorage.getItem('token')).toBe(mockAuthResponse.token)
      expect(localStorage.getItem('user')).toBe(
        JSON.stringify(mockAuthResponse.user)
      )
    })
  })

  describe('getStoredUser', () => {
    it('returns user from localStorage', () => {
      localStorage.setItem('user', JSON.stringify(mockUser))

      const result = authService.getStoredUser()

      expect(result).toEqual(mockUser)
    })

    it('returns null when no user in localStorage', () => {
      const result = authService.getStoredUser()

      expect(result).toBeNull()
    })

    it('handles invalid JSON in localStorage', () => {
      localStorage.setItem('user', 'invalid-json')

      expect(() => authService.getStoredUser()).toThrow()
    })
  })

  describe('getStoredToken', () => {
    it('returns token from localStorage', () => {
      localStorage.setItem('token', 'test-token')

      const result = authService.getStoredToken()

      expect(result).toBe('test-token')
    })

    it('returns null when no token in localStorage', () => {
      const result = authService.getStoredToken()

      expect(result).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('returns true when token exists', () => {
      localStorage.setItem('token', 'test-token')

      const result = authService.isAuthenticated()

      expect(result).toBe(true)
    })

    it('returns false when no token exists', () => {
      const result = authService.isAuthenticated()

      expect(result).toBe(false)
    })
  })
})
