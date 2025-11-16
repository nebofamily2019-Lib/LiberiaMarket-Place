import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/HamburgerMenu.css'

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useAuth()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const handleNavigation = (path: string) => {
    navigate(path)
    setIsOpen(false)
  }

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles?.includes(role) || user.roles?.includes('admin');
  };

  const menuItems = [
    { path: '/dashboard', icon: '🏠', label: 'Dashboard', roles: ['buyer', 'seller', 'admin'] },
    { path: '/products', icon: '🛍️', label: 'Browse Products', roles: ['buyer', 'seller', 'admin'] },
    { path: '/my-purchases', icon: '🛒', label: 'My Purchases', roles: ['buyer', 'admin'] },
    { path: '/my-products', icon: '📦', label: 'My Listings', roles: ['seller', 'admin'] },
    { path: '/products/add', icon: '➕', label: 'Add Product', roles: ['seller', 'admin'] },
    { path: '/categories', icon: '📂', label: 'Categories', roles: ['buyer', 'seller', 'admin'] },
    { path: '/admin/dashboard', icon: '⚙️', label: 'Admin Panel', roles: ['admin'] },
  ]

  const filteredItems = menuItems.filter(item => 
    item.roles.some(role => hasRole(role))
  )

  return (
    <>
      {/* Hamburger Button */}
      <button
        className={`hamburger-button ${isOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="menu-overlay" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Menu */}
      <nav className={`hamburger-menu ${isOpen ? 'open' : ''}`}>
        <div className="menu-header">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <h3>{user?.name}</h3>
              <p className="user-role">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="menu-items">
          {filteredItems.map((item) => (
            <button
              key={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
              {location.pathname === item.path && (
                <span className="active-indicator" />
              )}
            </button>
          ))}
        </div>

        <div className="menu-footer">
          <button className="logout-button" onClick={handleLogout}>
            <span className="menu-icon">🚪</span>
            <span className="menu-label">Logout</span>
          </button>
        </div>
      </nav>
    </>
  )
}

export default HamburgerMenu
