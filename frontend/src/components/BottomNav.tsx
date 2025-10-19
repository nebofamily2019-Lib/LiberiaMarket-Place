import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * BottomNav - Always visible navigation component
 * - Fixed at bottom of screen on mobile and desktop
 * - Always on top during page navigation
 * - Icons represent key app sections
 */
const BottomNav = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path ? 'active' : ''
    }
    return location.pathname.startsWith(path) ? 'active' : ''
  }

  return (
    <nav className="bottom-nav">
      {/* Home / Marketplace */}
      <Link to="/" className={`bottom-nav-item ${isActive('/')}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span>Home</span>
      </Link>

      {/* Browse Products */}
      <Link to="/products" className={`bottom-nav-item ${isActive('/products')}`}>
        <span className="bottom-nav-icon">🔍</span>
        <span>Browse</span>
      </Link>

      {/* Sell / Add Product */}
      <Link
        to={isAuthenticated ? "/add-product" : "/login"}
        className={`bottom-nav-item ${isActive('/add-product')}`}
      >
        <span className="bottom-nav-icon">➕</span>
        <span>Sell</span>
      </Link>

      {/* Profile / Account */}
      <Link
        to={isAuthenticated ? "/profile" : "/login"}
        className={`bottom-nav-item ${isActive('/profile')}`}
      >
        <span className="bottom-nav-icon">👤</span>
        <span>{isAuthenticated ? 'Profile' : 'Login'}</span>
      </Link>
    </nav>
  )
}

export default BottomNav
