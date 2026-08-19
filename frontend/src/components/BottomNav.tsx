import { Link, useLocation } from 'react-router-dom'
import { Home, PlusCircle, MessageCircle, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import useUnreadMessages from '../hooks/useUnreadMessages'

const BottomNav = () => {
  const location = useLocation()
  const { isAuthenticated } = useAuth()
  const unreadMessages = useUnreadMessages()

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path ? 'active' : ''
    return location.pathname.startsWith(path) ? 'active' : ''
  }

  const navItems = [
    {
      path: '/',
      icon: <Home size={22} />,
      label: 'Home',
      authRequired: false,
    },
    {
      path: '/products/add',
      icon: <PlusCircle size={22} />,
      label: 'Sell',
      authRequired: true,
    },
    {
      path: '/messages',
      icon: <MessageCircle size={22} />,
      label: 'Messages',
      authRequired: true,
      badge: unreadMessages > 0 ? (unreadMessages > 99 ? '99+' : String(unreadMessages)) : null,
    },
    {
      path: '/dashboard',
      icon: <LayoutDashboard size={22} />,
      label: 'Dashboard',
      authRequired: true,
    },
  ]

  const visibleItems = navItems.filter(
    item => !item.authRequired || isAuthenticated
  )

  return (
    <nav className="bottom-nav">
      {visibleItems.map(item => (
        <Link
          key={item.path}
          to={item.path}
          className={`bottom-nav-item ${isActive(item.path)}`}
        >
          <span className="bottom-nav-icon" style={{ position: 'relative' }}>
            {item.icon}
            {item.badge && (
              <span className="bottom-nav-badge">{item.badge}</span>
            )}
          </span>
          <span className="bottom-nav-label">{item.label}</span>
        </Link>
      ))}
    </nav>
  )
}

export default BottomNav
