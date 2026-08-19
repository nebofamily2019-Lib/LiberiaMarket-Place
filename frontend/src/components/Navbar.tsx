import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'
import { notificationService } from '../services/notificationService'
import LanguageToggle from './LanguageToggle'

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifications = async () => {
        try {
          const res = await notificationService.getNotifications(1, 1);
          setUnreadCount(res.unreadCount);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      };
      fetchNotifications();
      // Poll every minute
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="logo">
            LibMarket
          </Link>

          <LanguageToggle />

          <ul className="nav-links">
            <li><Link to="/products">Browse</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/dashboard">Dashboard</Link></li>
                <li><Link to="/saved-items">Saved ❤️</Link></li>
                <li>
                  <Link to="/notifications" style={{ position: 'relative' }}>
                    🔔
                    {unreadCount > 0 && (
                      <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-10px',
                        background: 'red',
                        color: 'white',
                        borderRadius: '50%',
                        padding: '2px 6px',
                        fontSize: '10px'
                      }}>
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                </li>
                <li><Link to="/messages">Messages</Link></li>
                <li><Link to="/products/add">Sell</Link></li>
                <li>
                  <button
                    className="btn btn-secondary"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register" className="btn btn-primary">Sign Up</Link></li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default Navbar