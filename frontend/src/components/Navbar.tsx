import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { isAuthenticated, logout } = useAuth()

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

          <ul className="nav-links">
            <li><Link to="/products">Browse</Link></li>
            {isAuthenticated ? (
              <>
                <li><Link to="/add-product">Sell</Link></li>
                <li><Link to="/profile">Profile</Link></li>
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