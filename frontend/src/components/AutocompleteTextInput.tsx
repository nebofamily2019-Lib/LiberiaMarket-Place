import { useState, useMemo, useRef, useEffect } from 'react'

interface AutocompleteTextInputProps {
  label?: string
  value: string
  onChange: (val: string) => void
  placeholder?: string
  required?: boolean
  suggestions?: string[]
  maxSuggestions?: number
  helpText?: string
  name?: string
  disabled?: boolean
}

const defaultSuggestions = [
  'Samsung Galaxy S21',
  'Samsung Galaxy S22',
  'Samsung A12',
  'iPhone 11',
  'iPhone 12',
  'iPhone 13',
  'Tecno Spark 10',
  'HP Laptop',
  'Dell Laptop',
  'Lenovo ThinkPad',
  'MacBook Pro',
  'MacBook Air',
  'Bluetooth Speaker',
  'Flat Screen TV',
  'Refrigerator',
  'Gas Stove',
  'Solar Panel',
  'Generator',
  'Inverter Battery',
  'Office Chair',
  'Wooden Table',
  'Single Bed',
  'Motorcycle Helmet',
  'Men Shoes',
  'Women Handbag',
  'School Backpack',
  'Football Jersey',
  'Wrist Watch',
  'Wireless Earbuds'
]

const AutocompleteTextInput = ({
  label,
  value,
  onChange,
  placeholder = '',
  required = false,
  suggestions = defaultSuggestions,
  maxSuggestions = 6,
  helpText,
  name = 'title',
  disabled = false
}: AutocompleteTextInputProps) => {
  const [open, setOpen] = useState(false)
  const [highlightIndex, setHighlightIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Filter suggestions by current value (case-insensitive, startsWith or includes)
  const filtered = useMemo(() => {
    if (!value.trim()) return []
    const lower = value.toLowerCase()
    return suggestions
      .filter(s =>
        s.toLowerCase().startsWith(lower) ||
        s.toLowerCase().includes(lower)
      )
      .slice(0, maxSuggestions)
  }, [value, suggestions, maxSuggestions])

  useEffect(() => {
    // reset highlight when filtered changes
    setHighlightIndex(0)
  }, [filtered.length])

  const acceptSuggestion = (index: number) => {
    if (filtered[index]) {
      onChange(filtered[index])
      setOpen(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && filtered.length > 0 && (e.key === 'ArrowDown' || e.key === 'Tab')) {
      // Open suggestion list when user starts navigation
      setOpen(true)
      e.preventDefault()
      return
    }

    if (!open) {
      if (e.key === 'Tab' && filtered.length > 0) {
        // Accept first suggestion with Tab even if list closed
        acceptSuggestion(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightIndex(i => Math.min(i + 1, filtered.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightIndex(i => Math.max(i - 1, 0))
        break
      case 'Enter':
      case 'Tab':
      case 'ArrowRight':
        if (filtered.length > 0) {
          e.preventDefault()
          acceptSuggestion(highlightIndex)
        }
        break
      case 'Escape':
        setOpen(false)
        break
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // delay close so click can register
    setTimeout(() => setOpen(false), 120)
  }

  return (
    <div ref={containerRef} style={{ marginBottom: '24px', position: 'relative' }}>
      {label && (
        <label
          htmlFor={name}
          style={{
            display: 'block',
            fontWeight: 700,
            marginBottom: '6px',
            fontSize: '0.95rem'
          }}
        >
          {label} {required && <span style={{ color: '#d9534f' }}>*</span>}
        </label>
      )}

      <input
        id={name}
        name={name}
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => {
          onChange(e.target.value)
          setOpen(true)
        }}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (filtered.length > 0) setOpen(true)
        }}
        onBlur={handleBlur}
        autoComplete="off"
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: '10px',
          border: '1px solid #ccc',
          fontSize: '1rem',
          outline: 'none',
          boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
          transition: 'border-color 0.2s',
        }}
      />

      {helpText && (
        <div style={{
          marginTop: '6px',
          fontSize: '0.75rem',
          color: '#666'
        }}>
          {helpText}
        </div>
      )}

      {open && filtered.length > 0 && (
        <ul
          role="listbox"
          aria-label="Title suggestions"
          style={{
            listStyle: 'none',
            margin: 0,
            padding: '4px',
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '10px',
            boxShadow: '0 8px 18px rgba(0,0,0,0.12)',
            zIndex: 20,
            maxHeight: '220px',
            overflowY: 'auto'
          }}
        >
          {filtered.map((s, i) => {
            const isActive = i === highlightIndex
            return (
              <li
                key={s + i}
                role="option"
                aria-selected={isActive}
                onMouseDown={(e) => {
                  e.preventDefault()
                  acceptSuggestion(i)
                }}
                onMouseEnter={() => setHighlightIndex(i)}
                style={{
                  padding: '10px 12px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  background: isActive ? '#eef4ff' : 'transparent',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span style={{ opacity: 0.75 }}>📝</span>
                <span>{s}</span>
                {i === 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      padding: '2px 6px',
                      background: '#007bff',
                      color: '#fff',
                      borderRadius: '12px'
                    }}
                  >
                    Tab ⟳
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default AutocompleteTextInput
