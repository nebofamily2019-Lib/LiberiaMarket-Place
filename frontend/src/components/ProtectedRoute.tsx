import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh'
      }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role permissions
  if (allowedRoles && allowedRoles.length > 0) {
    const hasPermission = allowedRoles.some(role => 
      user?.roles?.includes(role) || user?.role === role
    )

    if (!hasPermission) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h1>🔒 Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <button onClick={() => window.history.back()}>
            Go Back
          </button>
        </div>
      )
    }
  }

  return <>{children}</>
}

export default ProtectedRoute
