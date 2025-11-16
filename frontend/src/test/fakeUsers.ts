import { User, RegisterData, LoginCredentials } from '../services/authService'

/**
 * Fake test users for comprehensive authentication testing
 * Using realistic Liberian phone numbers and locations
 */

// Valid Liberian phone number patterns: 
// Mobile: 77/88/555/666/777/888 + 6 digits
// Landline: 22 + 6 digits (for Monrovia)

export const fakeTestUsers = {
  // Valid active users
  regularBuyer: {
    id: 'user-buyer-001',
    name: 'Mohammed Kamara',
    email: 'mohammed.kamara@gmail.com',
    phone: '770123456', // MTN Liberia format
    role: 'buyer',
    isActive: true,
    location: 'Monrovia, Montserrado County',
    preferredPaymentMethods: ['mobile-money', 'cash']
  } as User,

  regularSeller: {
    id: 'user-seller-002', 
    name: 'Fatima Dukuly',
    email: 'fatima.dukuly@yahoo.com',
    phone: '880456789', // Lonestar Cell format
    role: 'seller',
    isActive: true,
    location: 'Paynesville, Montserrado County',
    avatar: '/uploads/avatars/fatima.jpg',
    preferredPaymentMethods: ['mobile-money', 'bank-transfer']
  } as User,

  adminUser: {
    id: 'user-admin-003',
    name: 'James Kollie',
    email: 'james.admin@libmarket.com',
    phone: '770987654',
    role: 'admin',
    isActive: true,
    location: 'Congo Town, Montserrado County',
    avatar: '/uploads/avatars/admin.jpg'
  } as User,

  ruralFarmer: {
    id: 'user-farmer-004',
    name: 'Mary Gbassay',
    email: '', // No email for rural user
    phone: '555234567', // Orange format
    role: 'seller',
    isActive: true,
    location: 'Gbarnga, Bong County',
    preferredPaymentMethods: ['mobile-money', 'cash']
  } as User,

  // Inactive/suspended user
  suspendedUser: {
    id: 'user-suspended-005',
    name: 'Robert Johnson',
    email: 'robert.banned@email.com',
    phone: '777345678',
    role: 'buyer',
    isActive: false,
    location: 'Buchanan, Grand Bassa County'
  } as User,

  // User from other counties
  voinjamaSeller: {
    id: 'user-voinjama-006',
    name: 'Kpannah Konneh',
    email: 'kpannah@outlook.com',
    phone: '666789012',
    role: 'seller', 
    isActive: true,
    location: 'Voinjama, Lofa County',
    preferredPaymentMethods: ['mobile-money']
  } as User,

  harperBuyer: {
    id: 'user-harper-007',
    name: 'Princess Williams',
    email: 'princess.harper@gmail.com',
    phone: '888567890',
    role: 'buyer',
    isActive: true,
    location: 'Harper, Maryland County',
    preferredPaymentMethods: ['cash', 'mobile-money']
  } as User
}

export const fakeRegisterData: Record<string, RegisterData> = {
  validBuyer: {
    name: 'Abdul Kamara',
    email: 'abdul.test@gmail.com',
    phone: '770111222',
    password: 'LibMarket2025!',
    role: 'buyer'
  },

  validSeller: {
    name: 'Blessing Pewee',
    email: 'blessing.seller@yahoo.com', 
    phone: '880333444',
    password: 'StrongPass123#',
    role: 'seller'
  },

  noEmail: {
    name: 'John Dolo',
    phone: '555666777',
    password: 'SimplePass789',
    role: 'seller'
  },

  invalidPhone: {
    name: 'Invalid User',
    email: 'invalid@test.com',
    phone: '123456', // Too short
    password: 'password123',
    role: 'buyer'
  },

  weakPassword: {
    name: 'Weak Pass User',
    email: 'weak@test.com',
    phone: '770888999',
    password: '123', // Too weak
    role: 'buyer'
  },

  duplicatePhone: {
    name: 'Duplicate User',
    email: 'duplicate@test.com',
    phone: '770123456', // Same as regularBuyer
    password: 'ValidPass123!',
    role: 'buyer'
  }
}

export const fakeLoginCredentials: Record<string, LoginCredentials> = {
  validBuyer: {
    phone: '770123456',
    password: 'LibMarket2025!'
  },

  validSeller: {
    phone: '880456789',
    password: 'StrongPass123#'
  },

  validAdmin: {
    phone: '770987654', 
    password: 'AdminSecure456!'
  },

  invalidPhone: {
    phone: '999999999', // Doesn't exist
    password: 'anypassword'
  },

  wrongPassword: {
    phone: '770123456', // Valid phone
    password: 'wrongpassword'
  },

  suspendedUser: {
    phone: '777345678',
    password: 'ValidPass123!'
  },

  emptyCredentials: {
    phone: '',
    password: ''
  }
}

// Phone number validation patterns for Liberia
export const liberianPhonePatterns = {
  mobile: [
    /^77\d{7}$/, // MTN - 77 + 7 digits
    /^88\d{7}$/, // Lonestar - 88 + 7 digits  
    /^555\d{6}$/, // Orange - 555 + 6 digits
    /^666\d{6}$/, // Orange alternative - 666 + 6 digits
    /^777\d{6}$/, // Cellcom - 777 + 6 digits
    /^888\d{6}$/ // Novafone - 888 + 6 digits
  ],
  landline: [
    /^22\d{7}$/ // Monrovia landlines - 22 + 7 digits (not 6)
  ]
}

export const isValidLiberianPhone = (phone: string): boolean => {
  const allPatterns = [...liberianPhonePatterns.mobile, ...liberianPhonePatterns.landline]
  return allPatterns.some(pattern => pattern.test(phone))
}

// Common Liberian locations for testing
export const liberianLocations = [
  'Monrovia, Montserrado County',
  'Paynesville, Montserrado County', 
  'Congo Town, Montserrado County',
  'New Kru Town, Montserrado County',
  'Gbarnga, Bong County',
  'Buchanan, Grand Bassa County',
  'Kakata, Margibi County',
  'Voinjama, Lofa County',
  'Zwedru, Grand Gedeh County',
  'Harper, Maryland County',
  'Robertsport, Grand Cape Mount County',
  'Tubmanburg, Bomi County',
  'Greenville, Sinoe County',
  'Barclayville, Grand Kru County',
  'Fish Town, River Gee County'
]

// Test scenarios for different user types
export const testScenarios = {
  ruralUser: {
    hasEmail: false,
    primaryPayment: 'mobile-money',
    location: 'Rural area',
    internetAccess: 'limited'
  },
  urbanUser: {
    hasEmail: true,
    primaryPayment: 'mobile-money',
    location: 'Urban area', 
    internetAccess: 'good'
  },
  businessUser: {
    hasEmail: true,
    primaryPayment: 'bank-transfer',
    location: 'Commercial area',
    internetAccess: 'excellent'
  }
}