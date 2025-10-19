/**
 * ProductMetaBadges Component
 *
 * Displays payment methods and negotiable status together
 * Perfect for product cards and listings
 */

import PaymentMethodBadge, { NegotiableBadge } from './PaymentMethodBadge'

interface ProductMetaBadgesProps {
  paymentMethods: string[]
  isNegotiable: boolean
  maxPaymentDisplay?: number
  size?: 'small' | 'medium' | 'large'
  className?: string
  layout?: 'horizontal' | 'vertical'
}

const ProductMetaBadges = ({
  paymentMethods,
  isNegotiable,
  maxPaymentDisplay = 3,
  size = 'medium',
  className = '',
  layout = 'vertical'
}: ProductMetaBadgesProps) => {
  const containerStyle = layout === 'horizontal'
    ? { display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' as const }
    : { display: 'flex', flexDirection: 'column' as const, gap: '12px' }

  return (
    <div className={`product-meta-badges ${className}`} style={containerStyle}>
      {/* Negotiable Badge */}
      {isNegotiable && (
        <div>
          <NegotiableBadge isNegotiable={isNegotiable} size={size} />
        </div>
      )}

      {/* Payment Methods */}
      {paymentMethods && paymentMethods.length > 0 && (
        <div>
          <PaymentMethodBadge
            methodIds={paymentMethods}
            maxDisplay={maxPaymentDisplay}
            size={size}
            showIcons={true}
          />
        </div>
      )}
    </div>
  )
}

export default ProductMetaBadges
