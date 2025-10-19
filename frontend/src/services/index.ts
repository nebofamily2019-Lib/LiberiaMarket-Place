// Export all services for easier imports
export { default as api } from './api'
export { default as authService } from './authService'
export { default as productService } from './productService'
export { default as categoryService } from './categoryService'
export { default as ratingService } from './ratingService'
export { default as userService } from './userService'

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
export type {
  Rating,
  RatingListResponse,
  RatingResponse,
  CreateRatingData
} from './ratingService'
export type {
  UpdateUserProfileData,
  UserResponse,
  UsersListResponse
} from './userService'
