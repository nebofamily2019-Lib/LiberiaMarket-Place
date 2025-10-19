import { getPaymentMethodById } from '../data/paymentMethods'

interface PaymentMethodBadgeProps {
  methodIds: string[]
  maxDisplay?: number
  size?: 'small' | 'medium' | 'large'
  showIcons?: boolean
  className?: string
}

const PaymentMethodBadge = ({
  methodIds,
  maxDisplay = 3,
  size = 'medium',
  showIcons = true,
  className = ''
}: PaymentMethodBadgeProps) => {
  if (!methodIds || methodIds.length === 0) {
    return null
  }

  const sizeStyles = {
    small: { fontSize: '0.7rem', padding: '3px 8px' },
    medium: { fontSize: '0.8rem', padding: '4px 10px' },
    large: { fontSize: '0.9rem', padding: '6px 12px' }
  }

  const displayMethods = methodIds.slice(0, maxDisplay)
  const remainingCount = methodIds.length - maxDisplay

  return (
    <div className={`payment-method-badges ${className}`} style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
      {displayMethods.map(methodId => {
        const method = getPaymentMethodById(methodId)
        if (!method) return null

        return (
          <span
            key={methodId}
            style={{
              ...sizeStyles[size],
              backgroundColor: '#e7f3ff',
              color: '#007bff',
              borderRadius: '4px',
              fontWeight: '500',
              display: 'inline-flex',
              alignItems: 'center',
              border: '1px solid #b3d9ff'
            }}
            title={method.description}
          >
            {showIcons && method.icon && (
              <span style={{ marginRight: '4px' }}>{method.icon}</span>
            )}
            {method.name}
          </span>
        )
      })}

      {remainingCount > 0 && (
        <span
          style={{
            ...sizeStyles[size],
            backgroundColor: '#f8f9fa',
            color: '#666',
            borderRadius: '4px',
            fontWeight: '500',
            border: '1px solid #ddd'
          }}
        >
          +{remainingCount} more
        </span>
      )}
    </div>
  )
}

interface NegotiableBadgeProps {
  isNegotiable: boolean
  size?: 'small' | 'medium' | 'large'
  className?: string
}

export const NegotiableBadge = ({
  isNegotiable,
  size = 'medium',
  className = ''
}: NegotiableBadgeProps) => {
  if (!isNegotiable) return null

  const sizeStyles = {
    small: { fontSize: '0.7rem', padding: '3px 8px' },
    medium: { fontSize: '0.8rem', padding: '4px 10px' },
    large: { fontSize: '0.9rem', padding: '6px 12px' }
  }

  return (
    <span
      className={`negotiable-badge ${className}`}
      style={{
        ...sizeStyles[size],
        backgroundColor: '#d4edda',
        color: '#155724',
        borderRadius: '4px',
        fontWeight: '600',
        display: 'inline-flex',
        alignItems: 'center',
        border: '1px solid #c3e6cb'
      }}
      title="Price is negotiable"
    >
      🤝 Negotiable
    </span>
  )
}

export default PaymentMethodBadge
