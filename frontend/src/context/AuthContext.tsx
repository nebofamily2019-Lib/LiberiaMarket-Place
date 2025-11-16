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
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me')
      
      if (response.data.success && response.data.data) {
        // Ensure roles is always an array
        const userData = response.data.data;
        if (!userData.roles) {
          userData.roles = [userData.role];
        }
        setUser(userData)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (err: any) {
      // Silent fail - 401 is expected when not logged in
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (phone: string, password: string) => {
    try {
      // Remove spaces from phone
      const cleanedPhone = phone.replace(/\s/g, '')
      
      const response = await api.post('/auth/login', { 
        phone: cleanedPhone, 
        password 
      })
      
      if (response.data.success && response.data.user) {
        setUser(response.data.user)
        setIsAuthenticated(true)
        console.log('✅ Login successful:', response.data.user.name)
        return response.data
      }
      
      throw new Error('Login failed')
    } catch (err: any) {
      console.error('❌ Login error:', err.response?.data?.error || err.message)
      setUser(null)
      setIsAuthenticated(false)
      throw err
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
