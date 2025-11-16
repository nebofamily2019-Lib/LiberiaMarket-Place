import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'seller' | 'buyer'
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p>Loading...</p>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Preserve the attempted URL for redirect after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // Check role requirement
  if (requiredRole && user?.role !== requiredRole) {
    // Admin trying to access non-admin route - allow
    if (user?.role === 'admin') {
      return <>{children}</>
    }

    // Non-admin trying to access admin route - deny
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        maxWidth: '600px',
        margin: '2rem auto'
      }}>
        <h2 style={{ color: '#ef4444' }}>⛔ Access Denied</h2>
        <p style={{ color: '#6b7280', marginTop: '1rem' }}>
          You don't have permission to access this page.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af', marginTop: '0.5rem' }}>
          Required role: <strong>{requiredRole}</strong>
        </p>
        <p style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
          Your role: <strong>{user?.role || 'unknown'}</strong>
        </p>
        <button
          onClick={() => window.history.back()}
          style={{
            marginTop: '1.5rem',
            padding: '0.75rem 1.5rem',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          ← Go Back
        </button>
      </div>
    )
  }

  return <>{children}</>
}

export default ProtectedRoute
