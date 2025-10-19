/**
 * Test cases for Liberian Phone Number Validation
 * Run with: npm test phoneValidation.test.ts
 */

import {
  validateLiberianPhone,
  isValidLiberianPhone,
  formatPhoneNumber,
  getCarrier,
  toInternationalFormat,
  toLocalFormat,
  parsePhoneInput
} from './phoneValidation'

describe('Liberian Phone Validation', () => {
  // Valid phone numbers from different carriers
  const validNumbers = {
    mtn: [
      '88123456',
      '77123456',
      '76123456',
      '088123456',
      '077123456',
      '076123456',
      '+23188123456',
      '+23177123456',
      '+23176123456',
      '231 88 123 456',
      '231-77-123-456'
    ],
    orange: [
      '86123456',
      '87123456',
      '086123456',
      '087123456',
      '+23186123456',
      '+23187123456'
    ],
    lonestar: [
      '55123456',
      '44123456',
      '33123456',
      '055123456',
      '044123456',
      '033123456',
      '+23155123456',
      '+23144123456',
      '+23133123456'
    ],
    comium: [
      '22123456',
      '022123456',
      '+23122123456'
    ]
  }

  const invalidNumbers = [
    '',
    '123',
    '12345678',
    '123456789',
    '99123456', // Invalid prefix
    '81123456', // Invalid prefix
    '+1234567890', // Wrong country code
    'abcdefgh',
    '00000000'
  ]

  describe('validateLiberianPhone', () => {
    it('should validate MTN numbers correctly', () => {
      validNumbers.mtn.forEach(number => {
        const result = validateLiberianPhone(number)
        expect(result.isValid).toBe(true)
        expect(result.carrier).toBe('MTN')
        expect(result.errorMessage).toBeUndefined()
      })
    })

    it('should validate Orange numbers correctly', () => {
      validNumbers.orange.forEach(number => {
        const result = validateLiberianPhone(number)
        expect(result.isValid).toBe(true)
        expect(result.carrier).toBe('Orange')
      })
    })

    it('should validate Lonestar numbers correctly', () => {
      validNumbers.lonestar.forEach(number => {
        const result = validateLiberianPhone(number)
        expect(result.isValid).toBe(true)
        expect(result.carrier).toBe('Lonestar Cell')
      })
    })

    it('should validate Comium numbers correctly', () => {
      validNumbers.comium.forEach(number => {
        const result = validateLiberianPhone(number)
        expect(result.isValid).toBe(true)
        expect(result.carrier).toBe('Comium')
      })
    })

    it('should reject invalid numbers', () => {
      invalidNumbers.forEach(number => {
        const result = validateLiberianPhone(number)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toBeDefined()
      })
    })

    it('should provide error messages for invalid lengths', () => {
      const result = validateLiberianPhone('123')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('Invalid phone number length')
    })

    it('should provide error messages for invalid prefixes', () => {
      const result = validateLiberianPhone('99123456')
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('Invalid network operator prefix')
    })
  })

  describe('isValidLiberianPhone', () => {
    it('should return true for valid numbers', () => {
      expect(isValidLiberianPhone('88123456')).toBe(true)
      expect(isValidLiberianPhone('+23188123456')).toBe(true)
    })

    it('should return false for invalid numbers', () => {
      expect(isValidLiberianPhone('123')).toBe(false)
      expect(isValidLiberianPhone('99123456')).toBe(false)
    })
  })

  describe('formatPhoneNumber', () => {
    it('should format valid numbers correctly', () => {
      expect(formatPhoneNumber('88123456')).toBe('+231 88 123 456')
      expect(formatPhoneNumber('088123456')).toBe('+231 88 123 456')
      expect(formatPhoneNumber('+23188123456')).toBe('+231 88 123 456')
      expect(formatPhoneNumber('231-88-123-456')).toBe('+231 88 123 456')
    })

    it('should handle numbers with spaces and dashes', () => {
      expect(formatPhoneNumber('231 88 123 456')).toBe('+231 88 123 456')
      expect(formatPhoneNumber('231-88-123-456')).toBe('+231 88 123 456')
    })
  })

  describe('getCarrier', () => {
    it('should identify MTN numbers', () => {
      expect(getCarrier('88123456')).toBe('MTN')
      expect(getCarrier('77123456')).toBe('MTN')
      expect(getCarrier('76123456')).toBe('MTN')
    })

    it('should identify Orange numbers', () => {
      expect(getCarrier('86123456')).toBe('Orange')
      expect(getCarrier('87123456')).toBe('Orange')
    })

    it('should identify Lonestar numbers', () => {
      expect(getCarrier('55123456')).toBe('Lonestar Cell')
      expect(getCarrier('44123456')).toBe('Lonestar Cell')
      expect(getCarrier('33123456')).toBe('Lonestar Cell')
    })

    it('should identify Comium numbers', () => {
      expect(getCarrier('22123456')).toBe('Comium')
    })

    it('should return null for invalid prefixes', () => {
      expect(getCarrier('99123456')).toBeNull()
      expect(getCarrier('81123456')).toBeNull()
    })
  })

  describe('toInternationalFormat', () => {
    it('should convert to international format', () => {
      expect(toInternationalFormat('88123456')).toBe('+23188123456')
      expect(toInternationalFormat('088123456')).toBe('+23188123456')
      expect(toInternationalFormat('+23188123456')).toBe('+23188123456')
    })
  })

  describe('toLocalFormat', () => {
    it('should convert to local format', () => {
      expect(toLocalFormat('88123456')).toBe('088123456')
      expect(toLocalFormat('+23188123456')).toBe('088123456')
      expect(toLocalFormat('088123456')).toBe('088123456')
    })
  })

  describe('parsePhoneInput', () => {
    it('should parse input and provide suggestions', () => {
      const result = parsePhoneInput('881')
      expect(result.digitCount).toBe(3)
      expect(result.suggestions).toContain('Enter 5 more digit(s)')
      expect(result.suggestions).toContain('MTN number')
    })

    it('should detect country code', () => {
      const result = parsePhoneInput('+23188123456')
      expect(result.hasCountryCode).toBe(true)
    })

    it('should detect leading zero', () => {
      const result = parsePhoneInput('088123456')
      expect(result.hasLeadingZero).toBe(true)
    })

    it('should suggest valid prefixes for invalid ones', () => {
      const result = parsePhoneInput('991')
      expect(result.suggestions.some(s => s.includes('Invalid prefix'))).toBe(true)
    })
  })
})
