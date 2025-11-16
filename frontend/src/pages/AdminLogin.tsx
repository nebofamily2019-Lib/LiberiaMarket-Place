import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/AdminLogin.css'

const AdminLogin = () => {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { login } = useAuth()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await login(phone, password)
      
      // Verify user is admin
      if (response.user.role !== 'admin') {
        setError('Access denied. Admin credentials required.')
        setLoading(false)
        return
      }

      console.log('✅ Admin login successful:', response.user.name)
      navigate('/admin/dashboard')
    } catch (err: any) {
      console.error('❌ Admin login failed:', err)
      setError(err.response?.data?.error || 'Invalid admin credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <div className="admin-icon">🔐</div>
          <h1>LibMarket Admin</h1>
          <p>Secure Dashboard Access</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <div className="error-message">
              <span>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="phone">
              📱 Admin Phone Number
            </label>
            <input
              type="tel"
              id="phone"
              placeholder="77712345"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
              disabled={loading}
            />
            <small>Liberian format (8-9 digits)</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              🔒 Admin Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              minLength={6}
            />
          </div>

          <button
            type="submit"
            className="admin-login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner">⏳</span>
                Verifying...
              </>
            ) : (
              <>
                <span>🚀</span>
                Access Admin Dashboard
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <p className="security-notice">
            🛡️ This is a secure admin portal. All access attempts are logged.
          </p>
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="back-button"
          >
            ← Back to User Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminLogin
