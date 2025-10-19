import { User } from '../services/authService'

/**
 * Mock data for testing
 */

// Mock Users
export const mockUser: User = {
  id: 'user-123',
  name: 'John Doe',
  email: 'john@test.com',
  phone: '881234567',
  role: 'user',
  isActive: true,
  avatar: null,
  location: 'Monrovia',
  createdAt: '2025-01-01T00:00:00.000Z',
}

export const mockSeller: User = {
  id: 'seller-456',
  name: 'Jane Seller',
  email: 'jane@test.com',
  phone: '771234567',
  role: 'seller',
  isActive: true,
  avatar: '/uploads/avatars/jane.jpg',
  location: 'Paynesville',
  createdAt: '2025-01-01T00:00:00.000Z',
}

export const mockAdmin: User = {
  id: 'admin-789',
  name: 'Admin User',
  email: 'admin@test.com',
  phone: '881111111',
  role: 'admin',
  isActive: true,
  avatar: null,
  location: 'Monrovia',
  createdAt: '2025-01-01T00:00:00.000Z',
}

// Mock Products
export const mockProduct = {
  id: 'product-123',
  title: 'Samsung Galaxy S21',
  description: 'Like new condition, 128GB, unlocked',
  slug: 'samsung-galaxy-s21',
  price: 350.0,
  category_id: 'cat-electronics',
  seller_id: 'seller-456',
  location: 'Monrovia',
  condition: 'like-new',
  images: ['/uploads/products/phone1.jpg'],
  status: 'active',
  views: 42,
  isFeatured: false,
  isNegotiable: true,
  tags: ['smartphone', 'samsung', 'unlocked'],
  contactPhone: '771234567',
  createdAt: '2025-01-10T00:00:00.000Z',
  updatedAt: '2025-01-10T00:00:00.000Z',
  seller: mockSeller,
  category: {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    color: '#3B82F6',
    isActive: true,
  },
}

export const mockProducts = [
  mockProduct,
  {
    id: 'product-456',
    title: 'Vintage Leather Jacket',
    description: 'Genuine leather, size M',
    slug: 'vintage-leather-jacket',
    price: 75.0,
    category_id: 'cat-fashion',
    seller_id: 'seller-456',
    location: 'Paynesville',
    condition: 'good',
    images: ['/uploads/products/jacket1.jpg'],
    status: 'active',
    views: 15,
    isFeatured: false,
    isNegotiable: false,
    tags: ['fashion', 'leather', 'jacket'],
    contactPhone: '771234567',
    createdAt: '2025-01-09T00:00:00.000Z',
    updatedAt: '2025-01-09T00:00:00.000Z',
    seller: mockSeller,
    category: {
      id: 'cat-fashion',
      name: 'Fashion',
      slug: 'fashion',
      icon: '👗',
      color: '#EC4899',
      isActive: true,
    },
  },
]

// Mock Categories
export const mockCategories = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    icon: '📱',
    color: '#3B82F6',
    description: 'Phones, laptops, and electronics',
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 'cat-fashion',
    name: 'Fashion',
    slug: 'fashion',
    icon: '👗',
    color: '#EC4899',
    description: 'Clothing and accessories',
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 'cat-home',
    name: 'Home & Garden',
    slug: 'home-garden',
    icon: '🏡',
    color: '#10B981',
    description: 'Furniture and home decor',
    isActive: true,
    sortOrder: 3,
  },
]

// Mock Ratings
export const mockRating = {
  id: 'rating-123',
  rater_id: 'user-123',
  rated_user_id: 'seller-456',
  rating: 5,
  review: 'Great seller, fast response!',
  transaction_type: 'buying',
  isAnonymous: false,
  isVerified: true,
  isHidden: false,
  createdAt: '2025-01-15T00:00:00.000Z',
  rater: mockUser,
}

export const mockRatings = [
  mockRating,
  {
    id: 'rating-456',
    rater_id: 'user-789',
    rated_user_id: 'seller-456',
    rating: 4,
    review: 'Good communication',
    transaction_type: 'buying',
    isAnonymous: true,
    isVerified: false,
    isHidden: false,
    createdAt: '2025-01-14T00:00:00.000Z',
    rater: null, // Anonymous
  },
]

// Mock Auth Response
export const mockAuthResponse = {
  success: true,
  message: 'Login successful',
  user: mockUser,
  token: 'mock-jwt-token-123456789',
}

// Mock API Responses
export const mockProductsResponse = {
  success: true,
  count: mockProducts.length,
  pagination: {
    page: 1,
    limit: 12,
    total: mockProducts.length,
    pages: 1,
  },
  data: mockProducts,
}

export const mockCategoriesResponse = {
  success: true,
  count: mockCategories.length,
  data: mockCategories,
}

// Helper functions
export const createMockProduct = (overrides?: Partial<typeof mockProduct>) => ({
  ...mockProduct,
  ...overrides,
})

export const createMockUser = (overrides?: Partial<User>) => ({
  ...mockUser,
  ...overrides,
})
