import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LanguageToggle from './LanguageToggle'
import useUnreadMessages from '../hooks/useUnreadMessages'
import '../styles/HamburgerMenu.css'
import {
  ShoppingBag,
  Folder,
  Package,
  BarChart3,
  Heart,
  Wallet,
  MessageSquare,
  LayoutDashboard,
  User,
  Lock,
  Store,
  ShoppingCart,
  LogOut,
  LogIn,
  UserPlus,
  Landmark,
  Flag,
  ListChecks
} from 'lucide-react'

const HamburgerMenu = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const unreadMessages = useUnreadMessages()

  const handleLogout = async () => {
    await logout()
    setIsMobileOpen(false)
    navigate('/login')
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsMobileOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileOpen(!isMobileOpen)
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
    // Dashboard — top of list
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, roles: ['buyer', 'seller', 'admin'] },

    { path: '/products', label: 'Browse Products', icon: <ShoppingBag size={20} />, roles: ['buyer', 'seller', 'admin'] },
    { path: '/categories', label: 'Categories', icon: <Folder size={20} />, roles: ['buyer', 'seller', 'admin'] },
    { path: '/messages', label: 'Messages', icon: <MessageSquare size={20} />, roles: ['buyer', 'seller', 'admin'], badge: true },
    { path: '/saved-items', label: 'Saved Items', icon: <Heart size={20} />, roles: ['buyer', 'seller', 'admin'] },
    { path: '/wallet', label: 'My Wallet', icon: <Wallet size={20} />, roles: ['buyer', 'seller', 'admin'] },

    // Seller Tools
    { path: '/my-products', label: 'My Products', icon: <Package size={20} />, roles: ['seller', 'admin'] },
    { path: '/seller/financials', label: 'Sales Dashboard', icon: <BarChart3 size={20} />, roles: ['seller', 'admin'] },

    // Admin Tools
    { path: '/admin/fees', label: 'Fee Collection', icon: <Landmark size={20} />, roles: ['admin'] },
    { path: '/admin/reports', label: 'Reports', icon: <Flag size={20} />, roles: ['admin'] },
    { path: '/admin/listings', label: 'Listings', icon: <ListChecks size={20} />, roles: ['admin'] },
  ]

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        className={`mobile-menu-toggle ${isMobileOpen ? 'open' : ''}`}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Mobile Overlay */}
      <div
        className={`mobile-overlay ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside 
        className={`sidebar-container ${isMobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        <div className="sidebar-panel">
        <div className="sidebar-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Link to="/" className="sidebar-logo">
              <div className="logo-icon"><Store size={24} /></div>
              <div className="logo-text">
                <h1>Liberia Marketplace</h1>
                <span>Buy & Sell Locally</span>
              </div>
            </Link>
            <LanguageToggle />
          </div>

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
                      {role === 'admin' && <Lock size={12} />}
                      {role === 'seller' && <Store size={12} />}
                      {role === 'buyer' && <ShoppingCart size={12} />}
                      {' '}{role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', marginTop: '1rem' }}>
              <div className="guest-icon"><User size={32} /></div>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.5rem' }}>Welcome!</h3>
              <p style={{ margin: 0, fontSize: '0.95rem', opacity: 0.9 }}>
                Sign in to buy and sell
              </p>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
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
                      <span className="menu-icon" style={{ position: 'relative' }}>
                        {item.icon}
                        {item.badge && unreadMessages > 0 && (
                          <span style={{
                            position: 'absolute',
                            top: '-6px',
                            right: '-8px',
                            background: '#EF4444',
                            color: '#fff',
                            borderRadius: '50%',
                            minWidth: '16px',
                            height: '16px',
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '0 3px',
                            lineHeight: 1,
                            border: '2px solid white',
                          }}>
                            {unreadMessages > 99 ? '99+' : unreadMessages}
                          </span>
                        )}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        {item.label}
                        {item.badge && unreadMessages > 0 && (
                          <span style={{
                            background: '#EF4444',
                            color: '#fff',
                            borderRadius: '10px',
                            padding: '0.1rem 0.45rem',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            lineHeight: 1.4,
                          }}>
                            {unreadMessages > 99 ? '99+' : unreadMessages}
                          </span>
                        )}
                      </span>
                    </button>
                  </li>
                ))
            ) : (
              <>
                <li className="menu-item">
                  <button onClick={() => handleNavigation('/products')} className="menu-link">
                    <span className="menu-icon"><ShoppingBag size={20} /></span>
                    <span>Browse Products</span>
                  </button>
                </li>
                <li className="menu-item">
                  <button onClick={() => handleNavigation('/categories')} className="menu-link">
                    <span className="menu-icon"><Folder size={20} /></span>
                    <span>Browse Categories</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="sidebar-footer">
          {isAuthenticated ? (
            <button onClick={handleLogout} className="logout-btn">
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login">
                <LogIn size={18} /> Login
              </Link>
              <Link to="/register" className="btn-register">
                <UserPlus size={18} /> Create Account
              </Link>
            </div>
          )}
        </div>
        </div>
      </aside>
    </>
  )
}

export default HamburgerMenu
