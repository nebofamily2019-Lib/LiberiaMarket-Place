// Export all services for easier imports
export { default as authService } from './authService'
export { default as productService } from './productService'
export { default as categoryService } from './categoryService'

// Export types
export type { User, LoginCredentials, RegisterData, AuthResponse } from './authService'
export type {
  Product,
  Category,
  ProductListResponse,
  ProductResponse,
  ProductFilters,
  CreateProductData
} from './productService'
export type { CategoryResponse } from './categoryService'
