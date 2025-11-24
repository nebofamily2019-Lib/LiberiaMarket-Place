import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import '../styles/Auth.css'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

const Register = () => {
  console.log('✅ Register component rendering')
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')
  console.log('🎯 Role from URL:', roleFromUrl)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'buyer' // Pre-select role from URL or default to buyer
  })
  
  useEffect(() => {
    console.log('📝 Register mounted with role:', formData.role)
  }, [])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('⚠️ User already logged in, redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  // Simple phone validation for Liberian phone numbers
  const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
    const cleaned = phone.replace(/\s/g, '')

    // Must be exactly 9 or 10 digits
    if (!/^\d{9,10}$/.test(cleaned)) {
      return { isValid: false, message: 'Phone must be 9-10 digits' }
    }

    // Normalize: remove leading 0 if present
    const normalized = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned

    // After normalization, must be exactly 9 digits
    if (normalized.length !== 9) {
      return { isValid: false, message: 'Invalid phone number length' }
    }

    // Must start with valid Liberian 2-digit prefix
    const validPrefixes = ['77', '76', '88', '86', '87', '55', '44', '33', '22']
    const prefix = normalized.substring(0, 2)

    if (!validPrefixes.includes(prefix)) {
      return { isValid: false, message: 'Invalid prefix. Must start with 77, 88, etc.' }
    }

    return { isValid: true }
  }

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')

    // Limit to 10 digits (to support 0XXXXXXXXX format)
    const limited = cleaned.slice(0, 10)

    // Format as XXX XXX XXXX (or XXXX XXX XXX for 10 digits)
    if (limited.length <= 3) return limited
    if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`
    if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
    return `${limited.slice(0, 4)} ${limited.slice(4, 7)} ${limited.slice(7)}`
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneDisplay(e.target.value)
    setFormData({ ...formData, phone: formatted })
    if (error) setError('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('📝 Submitting registration:', { ...formData, password: '[HIDDEN]' })

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      const errorMsg = 'Passwords do not match';
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    // Validate password length
    if (formData.password.length < 6) {
      const errorMsg = 'Password must be at least 6 characters';
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }

    setLoading(true)

    try {
      const user = await register({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone,
        password: formData.password,
        role: formData.role as 'buyer' | 'seller'
      })

      toast.success(`Welcome ${user.name}! Account created successfully.`)
      navigate('/dashboard')
    } catch (err: any) {
      console.error('❌ Registration failed:', err)
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const phoneDigits = formData.phone.replace(/\D/g, '').length
  const phoneValidation = validatePhone(formData.phone)

  return (
    <div className="auth-page">
      {/* Debug info - remove after fixing */}
      <div style={{ 
        position: 'fixed', 
        top: 70, 
        right: 10, 
        background: 'black', 
        color: 'white', 
        padding: '10px', 
        fontSize: '12px',
        zIndex: 9999,
        borderRadius: '8px'
      }}>
        Register Page Loaded<br/>
        Role: {formData.role}
      </div>

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
              <span className="logo-emoji-large">
                {formData.role === 'seller' ? '💰' : '🚀'}
              </span>
            </div>
            <h1 className="gradient-text">
              {formData.role === 'seller' 
                ? 'Start Selling Today!' 
                : 'Join Liberia Marketplace'}
            </h1>
            <p className="auth-tagline">
              {formData.role === 'seller'
                ? 'List your products and reach thousands of buyers across Liberia!'
                : 'Start buying and selling today! Join thousands of Liberians trading online.'}
            </p>
            
            <div className="features-mini">
              <div className="feature-mini">
                <span>{formData.role === 'seller' ? '💰' : '🆓'}</span>
                <span>{formData.role === 'seller' ? 'Earn Money' : 'Free to Join'}</span>
              </div>
              <div className="feature-mini">
                <span>{formData.role === 'seller' ? '📦' : '⚡'}</span>
                <span>{formData.role === 'seller' ? 'List Products' : 'Quick Setup'}</span>
              </div>
              <div className="feature-mini">
                <span>🔒</span>
                <span>Secure Platform</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="auth-right">
          <div className="auth-form-container glass-card scale-in">
            <div className="auth-form-header">
              <h2>Create Account</h2>
              <p>
                {formData.role === 'seller'
                  ? 'Register as a seller and start earning today'
                  : 'Fill in your details to get started'}
              </p>
            </div>

            {error && (
              <div className="error-message bounce-in">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">
                  <span className="label-icon">👤</span>
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  autoComplete="name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">
                  <span className="label-icon">📱</span>
                  Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  placeholder="e.g. 77012345"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  required
                  className="input-modern"
                  autoComplete="tel"
                />
                <span className="input-hint">Your Liberian mobile number</span>
              </div>

              <div className="form-group">
                <label htmlFor="email">
                  <span className="label-icon">✉️</span>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-modern"
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="role">
                  <span className="label-icon">🎯</span>
                  I want to *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="input-modern select-modern"
                >
                  <option value="buyer">Buy Products 🛍️</option>
                  <option value="seller">Sell Products 💰</option>
                </select>
                {formData.role === 'seller' && (
                  <span className="input-hint" style={{ color: '#10b981', fontWeight: 600 }}>
                    ✨ Great choice! Start listing your products right away.
                  </span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="password">
                  <span className="label-icon">🔒</span>
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="At least 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  autoComplete="new-password"
                  minLength={8}
                />
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">
                  <span className="label-icon">🔐</span>
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="input-modern"
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                className="btn-auth ripple-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-small"></span>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>{formData.role === 'seller' ? '💰' : '🚀'}</span>
                    <span>
                      {formData.role === 'seller' 
                        ? 'Start Selling' 
                        : 'Create Account'}
                    </span>
                  </>
                )}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <div className="auth-links">
              <p className="auth-link-text">
                Already have an account?{' '}
                <Link to="/login" className="link-primary">
                  Sign In →
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

export default Register
