import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../utils/api'

interface User {
  id: string
  name: string
  phone: string
  email?: string
  role: string
  roles: string[] // Multiple roles
  isActive: boolean
  isPhoneVerified?: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  login: (phone: string, password: string) => Promise<any>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {

  const [user, setUser] = useState<User | null>(() => {
    // Try to restore user from localStorage on initial load
    try {
      const storedUser = localStorage.getItem('user')
      return storedUser ? JSON.parse(storedUser) : null
    } catch {
      return null
    }
  })
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('token')
  })
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      console.log('🔍 Checking authentication status...')
      console.log('🍪 Current cookies:', document.cookie)
      const response = await api.get('/auth/me')
      if (response.data.success) {
        console.log('✅ User authenticated:', response.data.data.name)
        setUser(response.data.data)
        setIsAuthenticated(true)
        // Sync localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data))
      } else {
        setUser(null)
        setIsAuthenticated(false)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
      }
    } catch (error: any) {
      // Silently handle auth check failure (user not logged in)
      if (error.status !== 401) {
        console.error('❌ Auth check error:', error.message)
      }
      // Clear any stale auth state
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (phone: string, password: string) => {
    try {
      console.log('📞 Attempting login with phone:', phone);
      const response = await api.post('/auth/login', { phone, password })
      console.log('✅ Login response:', response.data);
      console.log('🍪 Response headers:', response.headers);
      if (response.data.success) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        // Sync localStorage
        localStorage.setItem('user', JSON.stringify(response.data.user))
        if (response.data.token) {
          localStorage.setItem('token', response.data.token)
        }
        // Check if cookie was set
        console.log('🍪 Document cookies after login:', document.cookie);
        return response.data.user
      }
    } catch (error: any) {
      console.error('❌ Login failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (err) {
      console.error('Logout error:', err)
    } finally {
      setUser(null)
      setIsAuthenticated(false)
      localStorage.removeItem('user')
      localStorage.removeItem('token')
    }
  }

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    checkAuth
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
