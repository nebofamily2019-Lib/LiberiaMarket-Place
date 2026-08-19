import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { User, ShieldCheck, ShoppingBag, AlertCircle, ArrowRight, Loader2, Store, Rocket, CheckCircle2, BarChart3, CreditCard, Globe, ArrowLeft } from 'lucide-react'
import '../styles/Auth.css'
import PasswordStrengthMeter from '../components/PasswordStrengthMeter'

const Register = () => {
  console.log('Register component rendering')
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const roleFromUrl = searchParams.get('role')
  console.log('Role from URL:', roleFromUrl)
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: searchParams.get('role') || 'buyer', // Keep for backward compatibility/display logic
    roles: [searchParams.get('role') || 'buyer'], // New array for multiple roles
    gender: ''
  })
  
  useEffect(() => {
    console.log('Register mounted with role:', formData.role)
  }, [])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      console.log('User already logged in, redirecting to dashboard')
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

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

  const handleRoleChange = (role: string) => {
    const currentRoles = [...formData.roles];
    const index = currentRoles.indexOf(role);
    
    if (index === -1) {
      // Add role
      currentRoles.push(role);
    } else {
      // Remove role (prevent removing the last one)
      if (currentRoles.length > 1) {
        currentRoles.splice(index, 1);
      }
    }
    
    // Update primary role for display logic (prefer seller if selected)
    const primaryRole = currentRoles.includes('seller') ? 'seller' : currentRoles[0];
    
    setFormData({
      ...formData,
      roles: currentRoles,
      role: primaryRole
    });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    console.log('Submitting registration:', { ...formData, password: '[HIDDEN]' })

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
        role: formData.role as 'buyer' | 'seller',
        roles: formData.roles,
        gender: formData.gender as 'Male' | 'Female'
      })

      toast.success(`Welcome ${user.name}! Account created successfully.`)
      
      // Smart Redirect based on role
      if (user.roles && user.roles.includes('seller')) {
        navigate('/seller-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('❌ Registration failed:', JSON.stringify(err.response?.data || err.message, null, 2))
      const errorMsg = err.response?.data?.error || 'Registration failed. Please try again.'
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
            
            <h2 className="welcome-text">
              {formData.role === 'seller' ? 'Start Selling' : 'Join Us'}
            </h2>
            <p className="auth-tagline">
              {formData.role === 'seller'
                ? 'Transform your products into profit! Join Liberia\'s fastest-growing online marketplace.'
                : 'Start buying and selling today! Join thousands of Liberians trading online.'}
            </p>

            {formData.role === 'seller' ? (
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <Globe size={20} />
                  </div>
                  <span>Reach customers in all 15 counties</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Rocket size={20} />
                  </div>
                  <span>List products in under 5 minutes</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <CreditCard size={20} />
                  </div>
                  <span>Keep 100% of your sales profit</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <BarChart3 size={20} />
                  </div>
                  <span>Real-time analytics & tools</span>
                </div>
              </div>
            ) : (
              <div className="features-list">
                <div className="feature-item">
                  <div className="feature-icon">
                    <ShieldCheck size={20} />
                  </div>
                  <span>Secure & Verified Platform</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <Rocket size={20} />
                  </div>
                  <span>Quick & Easy Setup</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">
                    <ShoppingBag size={20} />
                  </div>
                  <span>Access to Best Deals</span>
                </div>
              </div>
            )}
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
              <h2>Create Account</h2>
              <p>
                {formData.role === 'seller' 
                  ? 'Set up your seller profile' 
                  : 'Enter your details to register'}
              </p>
            </div>

            {error && (
              <div className="error-alert">
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="name"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Gender</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className={`selection-card ${formData.gender === 'Male' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="gender"
                      value="Male"
                      checked={formData.gender === 'Male'} 
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <User size={18} />
                    <span>Male</span>
                    {formData.gender === 'Male' && <CheckCircle2 size={16} className="check-icon" />}
                  </label>
                  
                  <label className={`selection-card ${formData.gender === 'Female' ? 'active' : ''}`}>
                    <input 
                      type="radio" 
                      name="gender"
                      value="Female"
                      checked={formData.gender === 'Female'} 
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <User size={18} />
                    <span>Female</span>
                    {formData.gender === 'Female' && <CheckCircle2 size={16} className="check-icon" />}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    placeholder="e.g. 0770123456"
                    value={formData.phone}
                    onChange={handlePhoneChange}
                    required
                    className="form-input"
                    autoComplete="tel"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Format: 077XXXXXXX or 088XXXXXXX</p>
              </div>

              <div className="form-group">
                <label>I want to</label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <label className={`selection-card ${formData.roles.includes('buyer') ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.roles.includes('buyer')} 
                      onChange={() => handleRoleChange('buyer')}
                      className="sr-only"
                    />
                    <ShoppingBag size={18} />
                    <span>Buy</span>
                    {formData.roles.includes('buyer') && <CheckCircle2 size={16} className="check-icon" />}
                  </label>
                  
                  <label className={`selection-card ${formData.roles.includes('seller') ? 'active' : ''}`}>
                    <input 
                      type="checkbox" 
                      checked={formData.roles.includes('seller')} 
                      onChange={() => handleRoleChange('seller')}
                      className="sr-only"
                    />
                    <Store size={18} />
                    <span>Sell</span>
                    {formData.roles.includes('seller') && <CheckCircle2 size={16} className="check-icon" />}
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="password"
                    name="password"
                    placeholder="At least 6 characters"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="new-password"
                    minLength={6}
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
                <PasswordStrengthMeter password={formData.password} />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className="input-wrapper">
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="form-input"
                    autoComplete="new-password"
                    style={{ paddingLeft: '1rem' }}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>{formData.role === 'seller' ? 'Start Selling' : 'Create Account'}</span>
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="auth-footer">
              <p>Already have an account? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
