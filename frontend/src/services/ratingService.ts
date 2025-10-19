import api from './api'
import { User } from './authService'

export interface Rating {
  id: string
  rating: number
  review?: string
  isAnonymous: boolean
  isVerified: boolean
  isHidden: boolean
  rater_id: string
  rated_user_id: string
  rater?: User
  ratedUser?: User
  created_at: string
  updated_at: string
}

export interface RatingListResponse {
  success: boolean
  count: number
  total: number
  averageRating?: number
  pagination: {
    page: number
    limit: number
    pages: number
  }
  data: Rating[]
}

export interface RatingResponse {
  success: boolean
  data: Rating
  message?: string
}

export interface CreateRatingData {
  rated_user_id: string
  rating: number
  review?: string
  isAnonymous?: boolean
}

const ratingService = {
  // Get all ratings (for current user)
  getRatings: async (page = 1, limit = 10): Promise<RatingListResponse> => {
    const response = await api.get<RatingListResponse>('/ratings', {
      params: { page, limit }
    })
    return response.data
  },

  // Get ratings for a specific user (seller)
  getUserRatings: async (userId: string, page = 1, limit = 10): Promise<RatingListResponse> => {
    const response = await api.get<RatingListResponse>(`/ratings/user/${userId}`, {
      params: { page, limit }
    })
    return response.data
  },

  // Get ratings for a product (via seller)
  getProductRatings: async (productId: string): Promise<Rating[]> => {
    const response = await api.get<{ success: boolean; count: number; data: Rating[] }>(
      `/ratings/product/${productId}`
    )
    return response.data.data
  },

  // Create new rating
  createRating: async (ratingData: CreateRatingData): Promise<Rating> => {
    const response = await api.post<RatingResponse>('/ratings', ratingData)
    return response.data.data
  },

  // Update rating
  updateRating: async (id: string, ratingData: Partial<CreateRatingData>): Promise<Rating> => {
    const response = await api.put<RatingResponse>(`/ratings/${id}`, ratingData)
    return response.data.data
  },

  // Delete rating
  deleteRating: async (id: string): Promise<void> => {
    await api.delete(`/ratings/${id}`)
  }
}

export default ratingService
