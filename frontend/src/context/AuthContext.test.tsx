import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { AuthProvider, useAuth } from './AuthContext'
import authService from '../services/authService'
import { mockUser, mockAuthResponse } from '../test/mockData'

// Mock authService
vi.mock('../services/authService')

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('throws error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')

    spy.mockRestore()
  })

  it('initializes with no user when localStorage is empty', async () => {
    vi.mocked(authService.getStoredUser).mockReturnValue(null)
    vi.mocked(authService.getStoredToken).mockReturnValue(null)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('initializes with user from localStorage if token is valid', async () => {
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(authService.getStoredToken).mockReturnValue('valid-token')
    vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('clears user if token is invalid on initialization', async () => {
    vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
    vi.mocked(authService.getStoredToken).mockReturnValue('invalid-token')
    vi.mocked(authService.getCurrentUser).mockRejectedValue(
      new Error('Unauthorized')
    )

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  describe('login', () => {
    it('updates user state on successful login', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(null)
      vi.mocked(authService.getStoredToken).mockReturnValue(null)
      vi.mocked(authService.login).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.login({
          phone: '881234567',
          password: 'password123',
        })
      })

      expect(result.current.user).toEqual(mockAuthResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('throws error on failed login', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(null)
      vi.mocked(authService.getStoredToken).mockReturnValue(null)
      vi.mocked(authService.login).mockRejectedValue(
        new Error('Invalid credentials')
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.login({
            phone: '881234567',
            password: 'wrong',
          })
        })
      ).rejects.toThrow('Invalid credentials')

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  describe('register', () => {
    it('updates user state on successful registration', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(null)
      vi.mocked(authService.getStoredToken).mockReturnValue(null)
      vi.mocked(authService.register).mockResolvedValue(mockAuthResponse)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await act(async () => {
        await result.current.register({
          name: 'John Doe',
          phone: '881234567',
          password: 'password123',
        })
      })

      expect(result.current.user).toEqual(mockAuthResponse.user)
      expect(result.current.isAuthenticated).toBe(true)
    })

    it('throws error on failed registration', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(null)
      vi.mocked(authService.getStoredToken).mockReturnValue(null)
      vi.mocked(authService.register).mockRejectedValue(
        new Error('Phone already exists')
      )

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false)
      })

      await expect(
        act(async () => {
          await result.current.register({
            name: 'Test',
            phone: '881234567',
            password: 'pass',
          })
        })
      ).rejects.toThrow('Phone already exists')

      expect(result.current.user).toBeNull()
    })
  })

  describe('logout', () => {
    it('clears user state on logout', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
      vi.mocked(authService.getStoredToken).mockReturnValue('token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.logout).mockResolvedValue()

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    it('clears user state even if API call fails', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
      vi.mocked(authService.getStoredToken).mockReturnValue('token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Suppress console.error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await act(async () => {
        await result.current.logout()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)

      spy.mockRestore()
    })
  })

  describe('refreshUser', () => {
    it('updates user data from API', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
      vi.mocked(authService.getStoredToken).mockReturnValue('token')
      vi.mocked(authService.getCurrentUser).mockResolvedValue(mockUser)

      const updatedUser = { ...mockUser, name: 'Updated Name' }
      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(mockUser)
      vi.mocked(authService.getCurrentUser).mockResolvedValueOnce(updatedUser)

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      await act(async () => {
        await result.current.refreshUser()
      })

      expect(result.current.user).toEqual(updatedUser)
      expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedUser))
    })

    it('throws error if refresh fails', async () => {
      vi.mocked(authService.getStoredUser).mockReturnValue(mockUser)
      vi.mocked(authService.getStoredToken).mockReturnValue('token')
      vi.mocked(authService.getCurrentUser)
        .mockResolvedValueOnce(mockUser)
        .mockRejectedValueOnce(new Error('Unauthorized'))

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      })

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser)
      })

      // Suppress console.error
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(
        act(async () => {
          await result.current.refreshUser()
        })
      ).rejects.toThrow('Unauthorized')

      spy.mockRestore()
    })
  })
})
