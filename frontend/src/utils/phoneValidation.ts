/**
 * Liberian Phone Number Validation Utility
 *
 * Liberia Country Code: +231
 * Phone Number Format: +231 XX XXX XXX (8 digits after country code)
 *
 * Mobile Network Operators in Liberia:
 * - MTN: 88, 77, 76
 * - Orange: 86, 87
 * - Lonestar Cell: 55, 44, 33
 * - Comium: 22
 */

export interface PhoneValidationResult {
  isValid: boolean
  formatted: string
  carrier?: string
  errorMessage?: string
}

// Network operator prefixes
const NETWORK_OPERATORS = {
  MTN: ['88', '77', '76'],
  Orange: ['86', '87'],
  'Lonestar Cell': ['55', '44', '33'],
  Comium: ['22']
} as const

/**
 * Get the carrier/network operator from phone number
 */
export const getCarrier = (phoneNumber: string): string | null => {
  // Extract the first two digits after cleaning
  const cleaned = phoneNumber.replace(/\D/g, '')
  let prefix = ''

  // If it starts with 231 (country code), get digits after that
  if (cleaned.startsWith('231')) {
    prefix = cleaned.substring(3, 5)
  } else if (cleaned.length >= 2) {
    prefix = cleaned.substring(0, 2)
  }

  // Find matching carrier
  for (const [carrier, prefixes] of Object.entries(NETWORK_OPERATORS)) {
    if ((prefixes as readonly string[]).includes(prefix)) {
      return carrier
    }
  }

  return null
}

/**
 * Format phone number to standard format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Handle different input formats
  let digits = cleaned

  // If starts with 231, remove it
  if (digits.startsWith('231')) {
    digits = digits.substring(3)
  }

  // If starts with 0, remove it (local format)
  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }

  // Ensure we have exactly 8 digits (2-digit prefix + 6 digits)
  if (digits.length !== 8) {
    return phoneNumber // Return original if invalid length
  }

  // Format as +231 XX XXX XXX
  return `+231 ${digits.substring(0, 2)} ${digits.substring(2, 5)} ${digits.substring(5)}`
}

/**
 * Validate Liberian phone number
 */
export const validateLiberianPhone = (phoneNumber: string): PhoneValidationResult => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '')

  // Check if empty
  if (!cleaned) {
    return {
      isValid: false,
      formatted: '',
      errorMessage: 'Phone number is required'
    }
  }

  let digits = cleaned

  // Handle international format (+231)
  if (digits.startsWith('231')) {
    digits = digits.substring(3)
  }

  // Handle local format (0XX)
  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }

  // Check if 8 or 9 digits (8 digits without leading zero, 9 digits with leading zero)
  if (digits.length !== 8 && digits.length !== 9) {
    return {
      isValid: false,
      formatted: phoneNumber,
      errorMessage: `Invalid phone number length. Expected 8 or 9 digits, got ${digits.length}`
    }
  }

  // If 9 digits, ensure it starts with 0
  if (digits.length === 9 && !digits.startsWith('0')) {
    return {
      isValid: false,
      formatted: phoneNumber,
      errorMessage: '9-digit numbers must start with 0 (e.g., 088XXXXXX)'
    }
  }

  // Normalize to 8 digits for validation (remove leading 0 if present)
  const normalizedDigits = digits.startsWith('0') ? digits.substring(1) : digits

  // Check if starts with valid operator prefix using normalized digits
  const prefix = normalizedDigits.substring(0, 2)
  const carrier = getCarrier(normalizedDigits)

  if (!carrier) {
    return {
      isValid: false,
      formatted: phoneNumber,
      errorMessage: `Invalid network operator prefix: ${prefix}. Valid prefixes are: ${Object.values(NETWORK_OPERATORS).flat().join(', ')}`
    }
  }

  // Valid number
  return {
    isValid: true,
    formatted: formatPhoneNumber(normalizedDigits),
    carrier
  }
}

/**
 * Check if a string is a valid Liberian phone number
 */
export const isValidLiberianPhone = (phoneNumber: string): boolean => {
  return validateLiberianPhone(phoneNumber).isValid
}

/**
 * Get all valid network operator prefixes
 */
export const getNetworkPrefixes = () => {
  return NETWORK_OPERATORS
}

/**
 * Format phone number for display (with carrier)
 */
export const formatPhoneWithCarrier = (phoneNumber: string): string => {
  const result = validateLiberianPhone(phoneNumber)
  if (result.isValid && result.carrier) {
    return `${result.formatted} (${result.carrier})`
  }
  return phoneNumber
}

/**
 * Parse phone number input and provide suggestions
 */
export const parsePhoneInput = (input: string): {
  cleaned: string
  hasCountryCode: boolean
  hasLeadingZero: boolean
  digitCount: number
  suggestions: string[]
} => {
  const cleaned = input.replace(/\D/g, '')
  const hasCountryCode = cleaned.startsWith('231')
  const hasLeadingZero = cleaned.startsWith('0')

  let digits = cleaned
  if (hasCountryCode) {
    digits = cleaned.substring(3)
  } else if (hasLeadingZero) {
    digits = cleaned.substring(1)
  }

  const suggestions: string[] = []

  // Provide helpful suggestions
  if (digits.length < 8) {
    suggestions.push(`Enter ${8 - digits.length} more digit(s)`)
  } else if (digits.length > 9) {
    suggestions.push('Phone number is too long')
  } else if (digits.length === 8 || digits.length === 9) {
    suggestions.push('Valid length ✓')
  }

  if (digits.length >= 2) {
    const carrier = getCarrier(digits)
    if (!carrier) {
      const validPrefixes = Object.values(NETWORK_OPERATORS).flat()
      suggestions.push(`Invalid prefix. Valid prefixes: ${validPrefixes.join(', ')}`)
    } else {
      suggestions.push(`${carrier} number`)
    }
  }

  return {
    cleaned: digits,
    hasCountryCode,
    hasLeadingZero,
    digitCount: digits.length,
    suggestions
  }
}

/**
 * Convert phone number to international format for API calls
 */
export const toInternationalFormat = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '')
  let digits = cleaned

  if (digits.startsWith('231')) {
    return `+${digits}`
  }

  if (digits.startsWith('0')) {
    digits = digits.substring(1)
  }

  return `+231${digits}`
}

/**
 * Convert phone number to local format (with leading 0)
 */
export const toLocalFormat = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '')
  let digits = cleaned

  if (digits.startsWith('231')) {
    digits = digits.substring(3)
  }

  if (!digits.startsWith('0')) {
    digits = `0${digits}`
  }

  return digits
}

export default {
  validateLiberianPhone,
  isValidLiberianPhone,
  formatPhoneNumber,
  formatPhoneWithCarrier,
  getCarrier,
  getNetworkPrefixes,
  parsePhoneInput,
  toInternationalFormat,
  toLocalFormat
}
