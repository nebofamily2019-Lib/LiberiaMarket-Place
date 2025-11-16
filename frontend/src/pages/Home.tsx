import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  // Redirect authenticated users to dashboard
  if (isAuthenticated) {
    navigate('/dashboard')
    return null
  }

  return (
    <div className="home-container">
      {/* Left Panel - Branding & Info */}
      <div className="home-left">
        <div className="home-brand">
          <h1 className="brand-logo">🛍️ LibMarket</h1>
          <p className="brand-tagline">Liberia's Voice-Powered Marketplace</p>
        </div>

        <div className="home-features">
          <div className="feature-item">
            <span className="feature-icon">🎤</span>
            <div>
              <h3>Voice Search</h3>
              <p>Search products by speaking in any language</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <div>
              <h3>SMS Notifications</h3>
              <p>Get updates via text message</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <div>
              <h3>Mobile Money</h3>
              <p>Pay with Orange Money or MTN Mobile Money</p>
            </div>
          </div>

          <div className="feature-item">
            <span className="feature-icon">🇱🇷</span>
            <div>
              <h3>Made for Liberia</h3>
              <p>Buy and sell locally with ease</p>
            </div>
          </div>
        </div>

        <div className="home-footer">
          <p>Join thousands of Liberians buying & selling</p>
        </div>
      </div>

      {/* Right Panel - Auth Actions */}
      <div className="home-right">
        <div className="auth-card">
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Login or create an account to get started</p>

          <div className="auth-buttons">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => navigate('/login')}
            >
              Login
            </button>

            <button 
              className="btn btn-secondary btn-large"
              onClick={() => navigate('/register')}
            >
              Create Account
            </button>
          </div>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            className="btn btn-outline btn-large"
            onClick={() => navigate('/browse-products')}
          >
            Browse as Guest
          </button>

          <div className="auth-admin">
            <a href="/admin/login">Admin Login →</a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home