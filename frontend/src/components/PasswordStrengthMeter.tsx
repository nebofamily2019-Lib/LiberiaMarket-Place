import React from 'react'

interface PasswordStrengthMeterProps {
  password: string
}

const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const calculateStrength = () => {
    let strength = 0
    
    if (password.length >= 8) strength += 1
    if (password.length >= 12) strength += 1
    if (/[a-z]/.test(password)) strength += 1
    if (/[A-Z]/.test(password)) strength += 1
    if (/\d/.test(password)) strength += 1
    if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) strength += 1
    
    return strength
  }

  const strength = calculateStrength()
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
    </div>
  )
}

export default PasswordStrengthMeter
