import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/Auth.css'

const Login = () => {
  const navigate = useNavigate()
  const { login, isAuthenticated } = useAuth()
  const toast = useToast()
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('⚠️ User already logged in, redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.phone, formData.password)
      toast.success('Welcome back! Logged in successfully.')
      navigate('/dashboard')
    } catch (err: any) {
      const errorMsg = err.message || 'Login failed. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Animated Background */}
      <div className="blob-container">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      {/* Auth Container */}
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-left">
          <div className="auth-branding bounce-in">
            <div className="logo-circle-large">
              <span className="logo-emoji-large">🇱🇷</span>
            </div>
            <h1 className="gradient-text">Welcome Back!</h1>
            <p className="auth-tagline">
              Login to continue buying and selling on Liberia's #1 marketplace
            </p>
            
            <div className="features-mini">
              <div className="feature-mini">
                <span>✅</span>
                <span>Secure Login</span>
              </div>
              <div className="feature-mini">
                <span>🛍️</span>
                <span>Easy Shopping</span>
              </div>
              <div className="feature-mini">
                <span>💰</span>
                <span>Best Deals</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-form-container glass-card scale-in">
            <div className="auth-form-header">
              <h2>Sign In</h2>
              <p>Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="error-message bounce-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">
                  <span className="label-icon">📱</span>
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g. 77012345"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  autoComplete="tel"
                />
                <span className="input-hint">Enter your Liberian phone number</span>
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  autoComplete="current-password"
                />
              </div>

              <button 
                type="submit" 
                className="btn-auth ripple-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Signing In...</span>
                  </>
                ) : (
                  <>
                    <span>🔐</span>
                    <span>Sign In</span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-links">
              <p className="auth-link-text">
                Don't have an account?{' '}
                <Link to="/register" className="link-primary">
                  Create Account →
                </Link>
              </p>
              <Link to="/" className="link-secondary">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
