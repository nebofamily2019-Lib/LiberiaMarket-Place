import api from './api'
import { User } from './authService'

export interface Category {
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
}

export interface Product {
  id: string
  title: string
  slug: string
  description: string
  price: number
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  status: 'active' | 'sold' | 'inactive' | 'pending'
  images: string[]
  location: string
  contactPhone: string
  views: number
  isNegotiable: boolean
  tags: string[]
  specifications?: Record<string, any>
  seller?: User
  category?: Category
  seller_id: string
  category_id: string
  created_at: string
  updated_at: string
}

export interface ProductListResponse {
  success: boolean
  count: number
  total: number
  pagination: {
    page: number
    limit: number
    pages: number
  }
  data: Product[]
}

export interface ProductResponse {
  success: boolean
  data: Product
  message?: string
}

export interface ProductFilters {
  page?: number
  limit?: number
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string
  location?: string
  negotiable?: boolean
  sortBy?: string
  sortOrder?: 'ASC' | 'DESC'
}

export interface CreateProductData {
  title: string
  description: string
  price: number
  category_id: string
  location: string
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor'
  isNegotiable: boolean
  tags?: string[]
  contactPhone: string
}

const productService = {
  // Get all products with filters
  getProducts: async (filters?: ProductFilters): Promise<ProductListResponse> => {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get<ProductListResponse>(`/products?${params.toString()}`)
    return response.data
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<ProductResponse>(`/products/${id}`)
    return response.data.data
  },

  // Search products
  searchProducts: async (query: string, page = 1, limit = 12): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>('/products/search', {
      params: { q: query, page, limit }
    })
    return response.data
  },

  // Get products by category
  getProductsByCategory: async (
    categoryId: string,
    page = 1,
    limit = 12
  ): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>(`/products/category/${categoryId}`, {
      params: { page, limit }
    })
    return response.data
  },

  // Get user's products
  getUserProducts: async (userId: string, page = 1, limit = 12): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>(`/products/user/${userId}`, {
      params: { page, limit }
    })
    return response.data
  },

  // Create new product
  createProduct: async (productData: CreateProductData, image?: File): Promise<Product> => {
    const formData = new FormData()

    // Append product data
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    // Append image if provided
    if (image) {
      formData.append('image', image)
    }

    const response = await api.post<ProductResponse>('/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data.data
  },

  // Update product
  updateProduct: async (
    id: string,
    productData: Partial<CreateProductData>,
    image?: File
  ): Promise<Product> => {
    const formData = new FormData()

    // Append product data
    Object.entries(productData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value.toString())
        }
      }
    })

    // Append image if provided
    if (image) {
      formData.append('image', image)
    }

    const response = await api.put<ProductResponse>(`/products/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })

    return response.data.data
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`)
  },

  // Update product status
  updateProductStatus: async (
    id: string,
    status: 'active' | 'sold' | 'inactive' | 'pending'
  ): Promise<Product> => {
    const response = await api.patch<ProductResponse>(`/products/${id}/status`, { status })
    return response.data.data
  }
}

export default productService
