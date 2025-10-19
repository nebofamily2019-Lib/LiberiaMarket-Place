import { useState, useEffect } from 'react'
import {
  validateLiberianPhone,
  parsePhoneInput,
  formatPhoneNumber,
  PhoneValidationResult
} from '../utils/phoneValidation'

interface PhoneInputProps {
  value: string
  onChange: (value: string, isValid: boolean) => void
  required?: boolean
  disabled?: boolean
  placeholder?: string
  className?: string
  showValidation?: boolean
  showCarrier?: boolean
  label?: string
  id?: string
}

const PhoneInput = ({
  value,
  onChange,
  required = false,
  disabled = false,
  placeholder = '+231 XX XXX XXXX',
  className = '',
  showValidation = true,
  showCarrier = true,
  label = 'Phone Number',
  id = 'phone'
}: PhoneInputProps) => {
  const [validationResult, setValidationResult] = useState<PhoneValidationResult | null>(null)
  const [touched, setTouched] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  useEffect(() => {
    setInputValue(value)
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)

    // Validate
    const result = validateLiberianPhone(newValue)
    setValidationResult(result)

    // Notify parent
    onChange(newValue, result.isValid)
  }

  const handleBlur = () => {
    setTouched(true)

    // Auto-format on blur if valid
    if (validationResult?.isValid) {
      const formatted = formatPhoneNumber(inputValue)
      setInputValue(formatted)
      onChange(formatted, true)
    }
  }

  const handleFocus = () => {
    // Remove formatting on focus for easier editing
    const cleaned = inputValue.replace(/\D/g, '')
    if (cleaned.startsWith('231')) {
      setInputValue(cleaned.substring(3))
    } else if (cleaned.startsWith('0')) {
      setInputValue(cleaned.substring(1))
    } else {
      setInputValue(cleaned)
    }
  }

  const showError = touched && showValidation && !validationResult?.isValid && inputValue.length > 0
  const showSuccess = touched && showValidation && validationResult?.isValid

  // Get input suggestions
  const parseResult = inputValue ? parsePhoneInput(inputValue) : null

  return (
    <div className={`phone-input-wrapper ${className}`}>
      {label && (
        <label htmlFor={id} className="block mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          type="tel"
          id={id}
          value={inputValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            form-control w-full p-2 border rounded
            ${showError ? 'border-red-500' : ''}
            ${showSuccess ? 'border-green-500' : ''}
          `}
        />

        {/* Validation Icon */}
        {showValidation && touched && inputValue && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {validationResult?.isValid ? (
              <span className="text-green-500 text-xl">✓</span>
            ) : (
              <span className="text-red-500 text-xl">✗</span>
            )}
          </div>
        )}
      </div>

      {/* Carrier Info */}
      {showCarrier && validationResult?.isValid && validationResult.carrier && (
        <div className="text-sm text-green-600 mt-1">
          {validationResult.carrier} Network
        </div>
      )}

      {/* Error Message */}
      {showError && validationResult?.errorMessage && (
        <div className="text-sm text-red-500 mt-1">
          {validationResult.errorMessage}
        </div>
      )}

      {/* Input Suggestions */}
      {parseResult && parseResult.suggestions.length > 0 && !touched && inputValue.length > 0 && (
        <div className="text-xs text-gray-500 mt-1">
          {parseResult.suggestions.join(' • ')}
        </div>
      )}

      {/* Help Text */}
      {!inputValue && (
        <div className="text-xs text-gray-500 mt-1">
          Format: +231 XX XXX XXXX or 0XX XXX XXXX
        </div>
      )}
    </div>
  )
}

export default PhoneInput
