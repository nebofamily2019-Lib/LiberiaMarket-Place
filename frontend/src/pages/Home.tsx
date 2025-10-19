import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * Home Page - Simplified Landing
 * - Simple welcome message for non-authenticated users
 * - Only shows Login and Browse All options
 * - All other features require authentication
 */
const Home = () => {
  const { isAuthenticated } = useAuth()

  // Get current time for greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div className="container-fluid">
      {/* Welcome Section */}
      <div className="card mt-lg mb-lg">
        <div className="card-body text-center">
          {/* Action Buttons */}
          <div className="flex gap-md justify-center" style={{ flexWrap: 'wrap' }}>
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="btn btn-primary" style={{ minWidth: '140px' }}>
                  Login
                </Link>
                <Link to="/products" className="btn btn-secondary" style={{ minWidth: '140px' }}>
                  Browse All
                </Link>
              </>
            ) : (
              <>
                <Link to="/products" className="btn btn-primary" style={{ minWidth: '140px' }}>
                  Browse All
                </Link>
                <Link to="/add-product" className="btn btn-secondary" style={{ minWidth: '140px' }}>
                  Start Selling
                </Link>
              </>
            )}
          </div>

          {/* Sign Up Prompt */}
          {!isAuthenticated && (
            <div className="mt-lg">
              <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                  Create Account
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Spacing for mobile nav */}
      <div className="mb-xl"></div>
    </div>
  )
}

export default Home