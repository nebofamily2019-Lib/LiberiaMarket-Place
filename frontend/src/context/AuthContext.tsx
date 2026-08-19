import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import authService, { User, LoginCredentials, RegisterData } from '../services/authService'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  isLoading: boolean // Alias for loading (backwards compatibility)
  login: (credentials: LoginCredentials) => Promise<User>
  register: (data: RegisterData) => Promise<User>
  logout: () => Promise<void>
  logoutAll: () => Promise<void>
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [user, setUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on initial load
    return authService.getStoredUser()
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return authService.isAuthenticated()
  })
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    // Always try to verify with the server (cookie based)
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
      // Sync localStorage
      localStorage.setItem('user', JSON.stringify(currentUser))
    } catch (error: any) {
      // Token is invalid or missing, clear auth state
      // Only log if it's not a 401 (expected when not logged in)
      if (error.response?.status !== 401) {
        console.error('Auth check failed:', error.message)
      }
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    const response = await authService.login(credentials)
    setUser(response.user)
    setIsAuthenticated(true)
    return response.user
  }

  const register = async (data: RegisterData) => {
    const response = await authService.register(data)
    setUser(response.user)
    setIsAuthenticated(true)
    return response.user
  }

  const logout = async () => {
    try {
      await authService.logout()
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const logoutAll = async () => {
    try {
      await authService.logoutAll()
    } catch (err) {
      console.error('Logout all error:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
    }
  }

  const refreshUser = async () => {
    const currentUser = await authService.getCurrentUser()
    setUser(currentUser)
    localStorage.setItem('user', JSON.stringify(currentUser))
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    isLoading: loading, // Alias for backwards compatibility
    login,
    register,
    logout,
    logoutAll,
    checkAuth,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
