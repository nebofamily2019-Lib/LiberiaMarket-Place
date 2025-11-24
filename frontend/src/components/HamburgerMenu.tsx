import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import '../styles/HamburgerMenu.css'

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (isAuthenticated) {
      fetchUnreadCount()
      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get('/conversations/unread-count')
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount)
      }
    } catch (err) {
      console.error('Failed to fetch unread count')
    }
  }

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    closeMenu()
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    closeMenu()
  }

  const isActive = (path: string) => {
    return location.pathname === path
  }

  // Check if user has role
  const hasRole = (role: string) => {
    if (!user) return false
    return user.roles?.includes(role) || user.role === role
  }

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠', roles: ['buyer', 'seller', 'admin'] },
    { path: '/products', label: 'Browse Products', icon: '🛍️', roles: ['buyer', 'seller', 'admin'] },
    { path: '/categories', label: 'Browse by Category', icon: '📂', roles: ['buyer', 'seller', 'admin'] },
    { path: '/buyer/inbox', label: 'My Offers', icon: '📬', roles: ['buyer', 'admin'] },
    { path: '/my-products', label: 'My Products', icon: '📦', roles: ['seller', 'admin'] },
    { path: '/seller/inbox', label: 'Received Offers', icon: '💰', roles: ['seller', 'admin'] },
    { path: '/products/add', label: 'Add Product', icon: '➕', roles: ['seller', 'admin'] },
    { 
      path: '/messages', 
      label: 'Messages', 
      icon: '💬', 
      roles: ['buyer', 'seller', 'admin'],
      badge: unreadCount 
    },
  ]

  return (
    <>
      <div className="hamburger-menu">
        <div className="menu-bar">
          <Link to="/" className="menu-logo" onClick={closeMenu}>
            <div className="logo-icon">🇱🇷</div>
            <div className="logo-text">
              <h1>Liberia Marketplace</h1>
              <span>Buy & Sell Locally</span>
            </div>
          </Link>

          <button
            className={`menu-toggle ${isOpen ? 'open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Overlay */}
      <div
        className={`menu-overlay ${isOpen ? 'open' : ''}`}
        onClick={closeMenu}
      />

      {/* Menu Panel */}
      <div className={`menu-panel ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <button className="menu-close" onClick={closeMenu}>
            ✕
          </button>

          {isAuthenticated && user ? (
            <div className="user-info">
              <div className="user-avatar">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <h3>{user.name}</h3>
                <p>+231 {user.phone}</p>
                <div className="user-role-badges">
                  {user.roles?.map((role) => (
                    <span key={role} className="role-badge-small">
                      {role === 'admin' && '🔐'}
                      {role === 'seller' && '🛍️'}
                      {role === 'buyer' && '🛒'}
                      {' '}{role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div className="guest-icon">👤</div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Welcome!</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
                Sign in to buy and sell
              </p>
            </div>
          )}
        </div>

        <nav className="menu-nav">
          <ul className="menu-items">
            {isAuthenticated ? (
              menuItems
                .filter(item => item.roles.some(role => hasRole(role)))
                .map((item) => (
                  <li key={item.path} className="menu-item">
                    <button
                      onClick={() => handleNavigation(item.path)}
                      className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <span className="menu-icon">{item.icon}</span>
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="notification-badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                ))
            ) : (
              <>
                <li className="menu-item">
                  <button onClick={() => handleNavigation('/products')} className="menu-link">
                    <span className="menu-icon">🛍️</span>
                    <span>Browse Products</span>
                  </button>
                </li>
                <li className="menu-item">
                  <button onClick={() => handleNavigation('/categories')} className="menu-link">
                    <span className="menu-icon">📂</span>
                    <span>Browse Categories</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="menu-footer">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">
              <span>🚪</span>
              <span>Logout</span>
            </button>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" onClick={closeMenu}>
                🔐 Login
              </Link>
              <Link to="/register" className="btn-register" onClick={closeMenu}>
                📝 Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default HamburgerMenu
