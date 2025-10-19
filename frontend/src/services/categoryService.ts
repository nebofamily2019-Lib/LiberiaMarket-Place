import api from './api'
import { Category } from './productService'

export interface CategoryResponse {
  success: boolean
  count: number
  data: Category[]
}

export interface CreateCategoryData {
  name: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  sortOrder?: number
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  icon?: string
  color?: string
  isActive?: boolean
  sortOrder?: number
}

const categoryService = {
  // Get all categories
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<CategoryResponse>('/categories')
    return response.data.data
  },

  // Get single category by ID
  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get<{ success: boolean; data: Category }>(`/categories/${id}`)
    return response.data.data
  },

  // Create new category (Admin only)
  createCategory: async (data: CreateCategoryData): Promise<Category> => {
    const response = await api.post<{ success: boolean; message: string; data: Category }>('/categories', data)
    return response.data.data
  },

  // Update category (Admin only)
  updateCategory: async (id: string, data: UpdateCategoryData): Promise<Category> => {
    const response = await api.put<{ success: boolean; message: string; data: Category }>(`/categories/${id}`, data)
    return response.data.data
  },

  // Delete category (Admin only)
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`)
  },

  // Get categories with product counts (includes inactive for admins)
  getCategoriesWithCounts: async (): Promise<Category[]> => {
    const response = await api.get<CategoryResponse>('/categories?includeInactive=true')
    return response.data.data
  }
}

export default categoryService
