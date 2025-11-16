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

  const navItems = [
    {
      path: '/',
      icon: '🏠',
      label: 'Home',
      authRequired: false
    },
    {
      path: '/add-product',
      icon: '➕',
      label: 'Sell',
      authRequired: true
    },
    {
      path: '/profile',
      icon: '👤',
      label: 'Profile',
      authRequired: true
    }
  ]

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path)}`}
        >
          <span className="bottom-nav-icon">{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNav
