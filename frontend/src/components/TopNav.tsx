import { useAuth } from '../context/AuthContext'
import '../styles/TopNav.css'

const TopNav = () => {
  const { user } = useAuth()

  if (!user) return null

  // Get current date
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  // Mock user rating (TODO: Implement actual rating system)
  const userRating = 4.5

  return (
    <div className="top-nav">
      <div className="user-info-nav">
        <div className="user-details">
          <span className="user-greeting">
            Signed in as <strong>{user.name}</strong>
          </span>
          <div className="user-meta">
            <span className="user-rating">
              ⭐ {userRating.toFixed(1)} Rating
            </span>
            <span className="date-display">
              📅 {today}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopNav
