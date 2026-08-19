/**
 * Enhanced Password Validation
 * Enforces strong password requirements for user security
 */

const validatePassword = (password) => {
  const errors = []
  
  // Minimum length
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }
  
  // Maximum length (prevent DoS)
  if (password.length > 128) {
    errors.push('Password must not exceed 128 characters')
  }
  
  // Uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }
  
  // Lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }
  
  // Number
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }
  
  // Special character
  if (!/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*...)')
  }
  
  // Check for common weak passwords (expanded list based on breach data)
  const weakPasswords = [
    'password', 'password123', '12345678', 'qwerty123',
    'abc123456', 'password1', 'welcome123', 'admin123',
    'letmein123', 'monkey123', 'dragon123', 'master123',
    '123456789', '1234567890', 'qwertyuiop', 'password!',
    'pass123456', 'admin1234', 'welcome1', 'liberia123',
    'marketplace', 'libmarket', 'libmarket123'
  ]

  if (weakPasswords.includes(password.toLowerCase())) {
    errors.push('This password is too common. Please choose a stronger password.')
  }

  // Check for sequential characters (e.g., "abcd", "1234")
  const hasSequential = /(?:abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz|012|123|234|345|456|567|678|789)/i.test(password)
  if (hasSequential) {
    errors.push('Password should not contain sequential characters (e.g., "abc" or "123")')
  }

  // Check for repeated characters (e.g., "aaa", "111")
  const hasRepeated = /(.)\1{2,}/.test(password)
  if (hasRepeated) {
    errors.push('Password should not contain 3+ repeated characters (e.g., "aaa" or "111")')
  }

  // Check for keyboard patterns (e.g., "qwerty", "asdf")
  const keyboardPatterns = ['qwerty', 'asdfgh', 'zxcvbn', 'qazwsx', '1qaz2wsx']
  const hasKeyboardPattern = keyboardPatterns.some(pattern =>
    password.toLowerCase().includes(pattern)
  )
  if (hasKeyboardPattern) {
    errors.push('Password should not contain keyboard patterns (e.g., "qwerty")')
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePasswordStrength(password)
  }
}

const calculatePasswordStrength = (password) => {
  let strength = 0
  
  // Length bonus
  if (password.length >= 8) strength += 1
  if (password.length >= 12) strength += 1
  if (password.length >= 16) strength += 1
  
  // Character variety
  if (/[a-z]/.test(password)) strength += 1
  if (/[A-Z]/.test(password)) strength += 1
  if (/\d/.test(password)) strength += 1
  if (/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password)) strength += 1
  
  // Determine strength level
  if (strength <= 3) return 'weak'
  if (strength <= 5) return 'medium'
  if (strength <= 7) return 'strong'
  return 'very-strong'
}

module.exports = {
  validatePassword,
  calculatePasswordStrength
}
