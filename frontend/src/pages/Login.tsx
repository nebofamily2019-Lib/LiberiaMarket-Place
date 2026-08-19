import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { ShieldCheck, ShoppingBag, Banknote, AlertCircle, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
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
      const user = await login({ phone: formData.phone, password: formData.password })
      toast.success('Welcome back! Logged in successfully.')
      
      // Smart Redirect based on role
      if (user.roles && user.roles.includes('seller')) {
        navigate('/seller-dashboard');
      } else {
        navigate('/dashboard');
      }
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
      <div className="auth-container">
        {/* Left Side - Branding */}
        <div className="auth-left">
          <div className="auth-branding">
            <div className="brand-header">
              <div className="logo-circle">
                <span className="logo-text">LM</span>
              </div>
              <h1>Liberia Market</h1>
            </div>
            
            <h2 className="welcome-text">Welcome Back</h2>
            <p className="auth-tagline">
              The most trusted marketplace for buying and selling in Liberia.
            </p>
            
            <div className="features-list">
              <div className="feature-item">
                <div className="feature-icon">
                  <ShieldCheck size={20} />
                </div>
                <span>Secure & Verified Transactions</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <ShoppingBag size={20} />
                </div>
                <span>Easy Local Shopping</span>
              </div>
              <div className="feature-item">
                <div className="feature-icon">
                  <Banknote size={20} />
                </div>
                <span>Best Prices Guaranteed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right" style={{ position: 'relative' }}>
          <Link 
            to="/" 
            style={{ 
              position: 'absolute', 
              top: '2rem', 
              right: '2rem', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              color: '#6b7280', 
              textDecoration: 'none',
              fontWeight: 500
            }}
          >
            <ArrowLeft size={20} />
            <span>Back to Home</span>
          </Link>

          <div className="auth-card">
            <div className="auth-header">
              <h2>Sign In</h2>
              <p>Access your account</p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 0770123456"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="tel"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="current-password"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <div className="forgot-password">
                  <Link to="/forgot-password">Forgot password?</Link>
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Don't have an account? <Link to="/register">Create Account</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
