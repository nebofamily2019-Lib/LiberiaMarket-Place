import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validate name
    if (!formData.name.trim() || formData.name.trim().length < 2) {
      setError('Please enter your full name')
      return
    }

    // Validate phone
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'Invalid phone number')
      return
    }

    // Validate password
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const cleanPhone = formData.phone.replace(/\s/g, '')

      await register({
        name: formData.name.trim(),
        phone: cleanPhone,
        password: formData.password,
        role: 'user'
      })

      navigate('/products')
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const phoneDigits = formData.phone.replace(/\D/g, '').length
  const phoneValidation = validatePhone(formData.phone)

  return (
    <div className="container" style={{
      paddingTop: '40px',
      paddingBottom: '40px',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        padding: '0 var(--space-lg)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
          <h1 style={{
            fontSize: 'var(--font-size-3xl)',
            marginBottom: 'var(--space-sm)',
            color: 'var(--color-primary)',
            fontWeight: '700'
          }}>
            Create Account
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)'
          }}>
            Join LibMarket to buy and sell
          </p>
        </div>

        <div className="card" style={{
          padding: 'var(--space-xl)',
          boxShadow: 'var(--shadow-md)'
        }}>
          {/* Error Alert */}
          {error && (
            <div style={{
              padding: 'var(--space-md)',
              marginBottom: 'var(--space-lg)',
              backgroundColor: '#fee',
              color: 'var(--color-error)',
              borderRadius: 'var(--border-radius-md)',
              border: '1px solid var(--color-error)',
              fontSize: 'var(--font-size-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-sm)'
            }}>
              <span style={{ fontSize: '1.2rem' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (error) setError('')
                }}
                placeholder="John Doe"
                required
                disabled={loading}
                autoComplete="name"
                style={{ fontSize: 'var(--font-size-base)' }}
              />
            </div>

            {/* Phone Number */}
            <div className="form-group">
              <label className="form-label">
                Phone Number
                <span style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'normal',
                  color: 'var(--color-text-secondary)',
                  marginLeft: 'var(--space-sm)'
                }}>
                  (9-10 digits)
                </span>
              </label>
              <input
                type="tel"
                className="form-input"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="088 123 4567"
                required
                disabled={loading}
                autoComplete="tel"
                style={{
                  fontSize: 'var(--font-size-lg)',
                  letterSpacing: '0.5px',
                  fontFamily: 'monospace',
                  borderColor: formData.phone && !phoneValidation.isValid ? 'var(--color-error)' : undefined
                }}
              />

              {/* Phone Helper Text */}
              <div style={{
                marginTop: 'var(--space-xs)',
                fontSize: 'var(--font-size-xs)',
                color: formData.phone && !phoneValidation.isValid ? 'var(--color-error)' : 'var(--color-text-secondary)'
              }}>
                {formData.phone ? (
                  phoneValidation.isValid ? (
                    <span style={{ color: 'var(--color-success)' }}>✓ Valid phone number</span>
                  ) : (
                    <span>Examples: 881234567 or 0881234567 ({phoneDigits}/9-10 digits)</span>
                  )
                ) : (
                  <span>Enter your mobile number (MTN, Orange, Lonestar, etc.)</span>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value })
                    if (error) setError('')
                  }}
                  placeholder="Minimum 6 characters"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="new-password"
                  style={{
                    paddingRight: '45px',
                    fontSize: 'var(--font-size-base)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  style={{
                    position: 'absolute',
                    right: 'var(--space-sm)',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 'var(--space-xs)',
                    fontSize: '1.2rem',
                    opacity: loading ? 0.5 : 1
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value })
                  if (error) setError('')
                }}
                placeholder="Re-enter password"
                required
                disabled={loading}
                autoComplete="new-password"
                style={{ fontSize: 'var(--font-size-base)' }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary"
              style={{
                width: '100%',
                marginTop: 'var(--space-md)',
                padding: '14px',
                fontSize: 'var(--font-size-base)',
                fontWeight: '600',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            margin: 'var(--space-xl) 0',
            gap: 'var(--space-md)'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
            <span style={{ color: 'var(--color-text-tertiary)', fontSize: 'var(--font-size-sm)' }}>
              Already have an account?
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Login Link */}
          <Link
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              color: 'var(--color-primary)',
              fontWeight: '600',
              textDecoration: 'none',
              fontSize: 'var(--font-size-base)'
            }}
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Register
