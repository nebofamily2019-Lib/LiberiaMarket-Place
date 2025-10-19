import { getPaymentMethods, PaymentMethod } from '../data/paymentMethods'

interface PaymentMethodSelectorProps {
  selectedMethods: string[]
  onChange: (methods: string[]) => void
  showDescriptions?: boolean
  disabled?: boolean
  className?: string
}

const PaymentMethodSelector = ({
  selectedMethods,
  onChange,
  showDescriptions = false,
  disabled = false,
  className = ''
}: PaymentMethodSelectorProps) => {
  const paymentMethods = getPaymentMethods()

  const handleToggle = (methodId: string) => {
    if (disabled) return

    const isSelected = selectedMethods.includes(methodId)
    const newMethods = isSelected
      ? selectedMethods.filter(m => m !== methodId)
      : [...selectedMethods, methodId]

    onChange(newMethods)
  }

  // Group methods by type
  const groupedMethods = paymentMethods.reduce((acc, method) => {
    if (!acc[method.type]) {
      acc[method.type] = []
    }
    acc[method.type].push(method)
    return acc
  }, {} as Record<string, PaymentMethod[]>)

  const typeLabels = {
    mobile_money: '📱 Mobile Money',
    cash: '💵 Cash Payment',
    bank: '🏦 Bank Transfer',
    other: '🤝 Other Methods'
  }

  return (
    <div className={`payment-method-selector ${className}`}>
      <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold', fontSize: '16px' }}>
        Accepted Payment Methods
      </label>

      {Object.entries(groupedMethods).map(([type, methods]) => (
        <div key={type} style={{ marginBottom: '20px' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>
            {typeLabels[type as keyof typeof typeLabels]}
          </h4>

          <div style={{
            display: 'grid',
            gap: '12px',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))'
          }}>
            {methods.map(method => {
              const isSelected = selectedMethods.includes(method.id)

              return (
                <label
                  key={method.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '12px',
                    border: `2px solid ${isSelected ? '#007bff' : '#ddd'}`,
                    borderRadius: '8px',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    backgroundColor: isSelected ? '#e7f3ff' : '#fff',
                    transition: 'all 0.2s',
                    opacity: disabled ? 0.6 : 1
                  }}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(method.id)}
                    disabled={disabled}
                    style={{
                      width: '18px',
                      height: '18px',
                      marginRight: '10px',
                      marginTop: '2px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      flexShrink: 0
                    }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '2px' }}>
                      {method.icon && <span style={{ marginRight: '6px' }}>{method.icon}</span>}
                      {method.name}
                    </div>

                    {showDescriptions && (
                      <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                        {method.description}
                      </div>
                    )}

                    {method.isPopular && (
                      <span style={{
                        fontSize: '0.7rem',
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        marginTop: '4px',
                        display: 'inline-block'
                      }}>
                        Popular
                      </span>
                    )}
                  </div>
                </label>
              )
            })}
          </div>
        </div>
      ))}

      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '12px', fontStyle: 'italic' }}>
        💡 Tip: Selecting multiple payment methods increases your chances of making a sale.
      </p>

      {selectedMethods.length === 0 && (
        <p style={{ fontSize: '0.85rem', color: '#dc3545', marginTop: '8px' }}>
          ⚠️ Please select at least one payment method
        </p>
      )}
    </div>
  )
}

export default PaymentMethodSelector
