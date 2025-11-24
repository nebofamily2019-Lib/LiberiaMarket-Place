import { useNavigate, Link } from 'react-router-dom'
import '../styles/Home.css'

const Home = () => {
  const navigate = useNavigate()

  const handleRegister = () => {
    console.log('🚀 START SELLING NOW clicked')
    console.log('📍 Current location:', window.location.href)
    console.log('🎯 Navigating to: /register?role=seller')
    
    navigate('/register?role=seller')
    
    // Log after navigation attempt
    setTimeout(() => {
      console.log('📍 After navigate, location:', window.location.href)
    }, 100)
  }

  const handleLogin = () => {
    navigate('/login')
  }

  const handleBrowseAsGuest = () => {
    navigate('/products')
  }

  return (
    <div className="home-container-modern">
      {/* Animated Background Blobs */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          {/* Logo & Branding */}
          <div className="brand-section bounce-in">
            <div className="logo-circle">
              <span className="logo-emoji">🇱🇷</span>
            </div>
            <h1 className="gradient-text hero-title">
              Liberia Marketplace
            </h1>
            <p className="hero-subtitle">
              Buy & Sell Anything, Anywhere in Liberia
            </p>
          </div>

          {/* Feature Cards */}
          <div className="features-grid">
            <div className="feature-card glass-card">
              <div className="feature-icon">🛍️</div>
              <h3>Shop Local</h3>
              <p>Discover amazing products from sellers across Liberia</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Negotiate directly with sellers for the best deals</p>
            </div>
            <div className="feature-card glass-card">
              <div className="feature-icon">🔒</div>
              <h3>Safe & Secure</h3>
              <p>Trusted platform for Liberian buyers and sellers</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="cta-section">
            {/* Try Link as alternative */}
            <a 
              href="/register?role=seller"
              className="cta-button cta-primary ripple-button"
              style={{ 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem'
              }}
              onClick={(e) => {
                console.log('🚀 Link clicked!')
                console.log('📍 Navigating to:', '/register?role=seller')
              }}
            >
              <span>🚀</span>
              <span>Start Selling Now</span>
            </a>

            <button 
              onClick={handleLogin}
              className="cta-button cta-secondary"
            >
              <span>🔐</span>
              <span>Login to Account</span>
            </button>
            
            <button 
              onClick={handleBrowseAsGuest}
              className="cta-button cta-ghost"
            >
              <span>👀</span>
              <span>Browse as Guest</span>
            </button>
          </div>

          {/* Stats Section */}
          <div className="stats-section">
            <div className="stat-item">
              <div className="stat-number gradient-text">1000+</div>
              <div className="stat-label">Active Products</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number gradient-text">500+</div>
              <div className="stat-label">Happy Sellers</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number gradient-text">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="badge-icon">✅</span>
              <span>Verified Sellers</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">📱</span>
              <span>Mobile Money</span>
            </div>
            <div className="trust-badge">
              <span className="badge-icon">🇱🇷</span>
              <span>Made in Liberia</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <button 
        className="fab pulse-ring"
        onClick={handleBrowseAsGuest}
        aria-label="Browse Products"
      >
        🛍️
      </button>
    </div>
  )
}

export default Home