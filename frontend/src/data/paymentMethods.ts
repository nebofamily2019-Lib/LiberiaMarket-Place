/**
 * Liberian Payment Methods
 * Common payment methods used in Liberia for e-commerce transactions
 */

export interface PaymentMethod {
  id: string
  name: string
  type: 'mobile_money' | 'cash' | 'bank' | 'other'
  description: string
  isPopular: boolean
  icon?: string
  provider?: string
}

export const liberianPaymentMethods: PaymentMethod[] = [
  // Mobile Money - Most popular in Liberia
  {
    id: 'mtn-mobile-money',
    name: 'MTN Mobile Money',
    type: 'mobile_money',
    description: 'Pay using MTN Mobile Money wallet',
    isPopular: true,
    provider: 'MTN',
    icon: '📱'
  },
  {
    id: 'orange-money',
    name: 'Orange Money',
    type: 'mobile_money',
    description: 'Pay using Orange Money wallet',
    isPopular: true,
    provider: 'Orange',
    icon: '📱'
  },
  {
    id: 'lonestar-money',
    name: 'Lonestar Money',
    type: 'mobile_money',
    description: 'Pay using Lonestar Cell MTN Money wallet',
    isPopular: true,
    provider: 'Lonestar',
    icon: '📱'
  },

  // Cash - Traditional and widely used
  {
    id: 'cash-on-delivery',
    name: 'Cash on Delivery',
    type: 'cash',
    description: 'Pay with cash when item is delivered',
    isPopular: true,
    icon: '💵'
  },
  {
    id: 'cash-on-pickup',
    name: 'Cash on Pickup',
    type: 'cash',
    description: 'Pay with cash when picking up item',
    isPopular: true,
    icon: '💵'
  },

  // Bank Transfer
  {
    id: 'bank-transfer',
    name: 'Bank Transfer',
    type: 'bank',
    description: 'Direct bank transfer (LBR, LBDI, UBA, GTBank, etc.)',
    isPopular: false,
    icon: '🏦'
  },

  // Other methods
  {
    id: 'negotiable',
    name: 'Negotiable/Flexible',
    type: 'other',
    description: 'Payment method can be discussed with buyer',
    isPopular: true,
    icon: '🤝'
  }
]

/**
 * Get all payment methods
 */
export const getPaymentMethods = (): PaymentMethod[] => {
  return liberianPaymentMethods
}

/**
 * Get popular payment methods
 */
export const getPopularPaymentMethods = (): PaymentMethod[] => {
  return liberianPaymentMethods.filter(method => method.isPopular)
}

/**
 * Get payment methods by type
 */
export const getPaymentMethodsByType = (
  type: PaymentMethod['type']
): PaymentMethod[] => {
  return liberianPaymentMethods.filter(method => method.type === type)
}

/**
 * Get payment method by ID
 */
export const getPaymentMethodById = (id: string): PaymentMethod | undefined => {
  return liberianPaymentMethods.find(method => method.id === id)
}

/**
 * Get mobile money providers
 */
export const getMobileMoneyProviders = (): PaymentMethod[] => {
  return getPaymentMethodsByType('mobile_money')
}

/**
 * Get cash payment methods
 */
export const getCashPaymentMethods = (): PaymentMethod[] => {
  return getPaymentMethodsByType('cash')
}

/**
 * Format payment methods for dropdown
 */
export const getPaymentMethodOptions = () => {
  return liberianPaymentMethods.map(method => ({
    value: method.id,
    label: method.name,
    description: method.description,
    icon: method.icon
  }))
}

/**
 * Get payment method display name with icon
 */
export const formatPaymentMethodName = (methodId: string): string => {
  const method = getPaymentMethodById(methodId)
  if (!method) return methodId
  return method.icon ? `${method.icon} ${method.name}` : method.name
}

export default {
  methods: liberianPaymentMethods,
  getPaymentMethods,
  getPopularPaymentMethods,
  getPaymentMethodsByType,
  getPaymentMethodById,
  getMobileMoneyProviders,
  getCashPaymentMethods,
  getPaymentMethodOptions,
  formatPaymentMethodName
}
