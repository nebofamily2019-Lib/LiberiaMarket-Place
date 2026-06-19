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
  checkAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [user, setUser] = useState<User | null>(() => {
    // Optimistically restore cached user for instant paint; checkAuth()
    // below re-validates against the server (the real auth state lives
    // in the httpOnly cookie, which JS can't read).
    return authService.getStoredUser()
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const currentUser = await authService.getCurrentUser()
      setUser(currentUser)
      setIsAuthenticated(true)
      localStorage.setItem('user', JSON.stringify(currentUser))
    } catch (error: any) {
      // No valid session cookie
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
