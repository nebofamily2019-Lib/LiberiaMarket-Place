import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Simple phone validation for Liberian 9-digit numbers
  const validatePhone = (phone: string): { isValid: boolean; message?: string } => {
    const cleaned = phone.replace(/\s/g, '')

    // Must be 9 or 10 digits (with or without leading 0)
    if (!/^\d{9,10}$/.test(cleaned)) {
      return { isValid: false, message: 'Phone must be 9-10 digits' }
    }

    // Remove leading 0 if present to normalize
    const normalized = cleaned.startsWith('0') ? cleaned.substring(1) : cleaned

    // After normalization, must be exactly 9 digits
    if (normalized.length !== 9) {
      return { isValid: false, message: 'Phone must be exactly 9 digits' }
    }

    // Must start with valid Liberian prefix (without leading 0)
    const validPrefixes = ['77', '76', '88', '86', '87', '55', '44', '33', '22']
    const prefix = normalized.substring(0, 2)

    if (!validPrefixes.includes(prefix)) {
      return { isValid: false, message: 'Invalid Liberian phone number' }
    }

    return { isValid: true }
  }

  const formatPhoneDisplay = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '')

    // Limit to 10 digits (to allow 0 prefix)
    const limited = cleaned.slice(0, 10)

    // Format as XXX XXX XXX or XXXX XXX XXX
    if (limited.length <= 3) return limited
    if (limited.length <= 6) return `${limited.slice(0, 3)} ${limited.slice(3)}`
    if (limited.length <= 9) return `${limited.slice(0, 3)} ${limited.slice(3, 6)} ${limited.slice(6)}`
    // For 10 digits: 0XXX XXX XXX
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

    // Validate phone
    const phoneValidation = validatePhone(formData.phone)
    if (!phoneValidation.isValid) {
      setError(phoneValidation.message || 'Please enter a valid phone number')
      return
    }

    // Validate password
    if (!formData.password) {
      setError('Please enter your password')
      return
    }

    setLoading(true)

    try {
      const cleanPhone = formData.phone.replace(/\s/g, '')

      await login({
        phone: cleanPhone,
        password: formData.password
      })

      navigate('/products')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your phone and password.')
    } finally {
      setLoading(false)
    }
  }

  const phoneDigits = formData.phone.replace(/\D/g, '').length
  const phoneValidation = validatePhone(formData.phone)
  const canSubmit = phoneValidation.isValid && formData.password.length >= 6

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
            Welcome Back
          </h1>
          <p style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-base)'
          }}>
            Login to continue to LibMarket
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
                placeholder="077 123 456"
                required
                disabled={loading}
                autoComplete="tel"
                autoFocus
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
                    <span style={{ color: 'var(--color-success)' }}>✓ Valid</span>
                  ) : (
                    <span>Example: 088 123 456 or 88 123 456 ({phoneDigits}/{phoneDigits === 9 ? '9' : '9-10'} digits)</span>
                  )
                ) : (
                  <span>Enter your registered mobile number (9-10 digits)</span>
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
                  placeholder="Enter your password"
                  required
                  disabled={loading}
                  minLength={6}
                  autoComplete="current-password"
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
                opacity: loading || !canSubmit ? 0.6 : 1,
                cursor: loading || !canSubmit ? 'not-allowed' : 'pointer'
              }}
              disabled={loading || !canSubmit}
            >
              {loading ? 'Logging in...' : 'Login'}
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
              New to LibMarket?
            </span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--color-border)' }} />
          </div>

          {/* Sign Up Link */}
          <Link
            to="/register"
            className="btn btn-secondary"
            style={{
              width: '100%',
              textAlign: 'center',
              padding: '14px',
              fontSize: 'var(--font-size-base)',
              fontWeight: '600',
              textDecoration: 'none',
              display: 'block',
              border: '2px solid var(--color-primary)',
              backgroundColor: 'transparent',
              color: 'var(--color-primary)',
              borderRadius: 'var(--border-radius-md)'
            }}
          >
            Create New Account
          </Link>
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: 'var(--space-xl)',
          textAlign: 'center',
          padding: 'var(--space-lg)',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--border-radius-md)',
          border: '1px solid var(--color-border-light)'
        }}>
          <p style={{
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-secondary)',
            margin: 0
          }}>
            <strong>Need help?</strong> Contact support at{' '}
            <a href="tel:+23188888888" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
              +231 88 888 8888
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
