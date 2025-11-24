import React from 'react'

interface PasswordStrengthMeterProps {
  password: string
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0
    const issues: string[] = []

    // Length checks
    if (password.length >= 8) strength += 1
    else issues.push('At least 8 characters')

    if (password.length >= 12) strength += 1
    if (password.length > 128) {
      issues.push('Max 128 characters')
      return { strength: 0, issues }
    }

    // Character variety
    if (/[a-z]/.test(password)) strength += 1
    else issues.push('One lowercase letter')

    if (/[A-Z]/.test(password)) strength += 1
    else issues.push('One uppercase letter')

    if (/\d/.test(password)) strength += 1
    else issues.push('One number')

    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) strength += 1
    else issues.push('One special character')

    // Security checks (reduce strength for weak patterns)
    if (/(.)\1{2,}/.test(password)) {
      strength = Math.max(0, strength - 1)
      issues.push('No repeated characters')
    }

    const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)
    if (hasSequential) {
      strength = Math.max(0, strength - 1)
      issues.push('No sequential characters')
    }

    const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn']
    if (keyboardPatterns.some(p => password.toLowerCase().includes(p))) {
      strength = Math.max(0, strength - 1)
      issues.push('No keyboard patterns')
    }

    return { strength, issues }
  }

  const { strength, issues } = calculateStrength()
  const percentage = (strength / 6) * 100

  const getStrengthLabel = () => {
    if (strength <= 2) return { text: 'Weak', color: '#ef4444' }
    if (strength <= 4) return { text: 'Medium', color: '#f59e0b' }
    if (strength <= 5) return { text: 'Strong', color: '#10b981' }
    return { text: 'Very Strong', color: '#059669' }
  }

  const { text, color } = getStrengthLabel()

  if (!password) return null

  return (
    <div style={{ marginTop: '0.5rem' }}>
      {/* Strength bar */}
      <div style={{
        height: '6px',
        background: '#e5e7eb',
        borderRadius: '3px',
        overflow: 'hidden'
      }}>
        <div style={{
          height: '100%',
          width: `${percentage}%`,
          background: color,
          transition: 'all 0.3s ease',
          borderRadius: '3px'
        }} />
      </div>

      {/* Strength label */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '0.25rem',
        fontSize: '0.8rem'
      }}>
        <span style={{ color, fontWeight: 600 }}>{text}</span>
        <span style={{ color: '#6b7280' }}>
          {strength}/6 requirements met
        </span>
      </div>

      {/* Validation issues - only show if there are issues */}
      {issues.length > 0 && password.length > 0 && (
        <div style={{
          marginTop: '0.5rem',
          padding: '0.5rem',
          background: '#fef2f2',
          borderLeft: '3px solid #ef4444',
          borderRadius: '4px'
        }}>
          <div style={{ fontSize: '0.75rem', color: '#991b1b', fontWeight: 600, marginBottom: '0.25rem' }}>
            Missing requirements:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: '#991b1b' }}>
            {issues.map((issue, idx) => (
              <li key={idx}>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default PasswordStrengthMeter
