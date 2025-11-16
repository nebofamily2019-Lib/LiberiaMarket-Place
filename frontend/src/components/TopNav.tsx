import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import '../styles/TopNav.css'

const TopNav = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (!user) return null

  return (
    <div className="top-nav">
      <div className="user-info-nav">
        <span className="user-name">
          Signed in as <strong>{user.name}</strong>
        </span>
        <button 
          className="logout-button-nav" 
          onClick={handleLogout}
          aria-label="Logout"
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default TopNav
