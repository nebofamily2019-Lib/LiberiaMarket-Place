import api from '../utils/api'
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
  // Get all products with optional filters
  getProducts: async (page = 1, limit = 20, filters = {}): Promise<ProductListResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...filters
    })
    const response = await api.get<ProductListResponse>(`/products?${params}`)
    return response.data
  },

  // Get single product
  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get<ProductResponse>(`/products/${id}`)
    return response.data.data
  },

  // Get user's products
  getUserProducts: async (userId: string, page = 1, limit = 100): Promise<ProductListResponse> => {
    const response = await api.get<ProductListResponse>(`/products/user/${userId}?page=${page}&limit=${limit}`)
    return response.data
  },

  // Create product (with CSRF token)
  createProduct: async (productData: FormData): Promise<Product> => {
    try {
      console.log('Creating product via API...')
      // Fetch CSRF token first
      const csrfRes = await api.get('/csrf-token');
      const csrfToken = csrfRes.data.csrfToken;
      const response = await api.post('/products', productData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-csrf-token': csrfToken
        },
        withCredentials: true
      });
      console.log('Product created successfully:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in createProduct:', error);
      console.error('Error response:', error.response);
      throw error;
    }
  },

  // Update product
  updateProduct: async (id: string, productData: any): Promise<Product> => {
    const response = await api.put<ProductResponse>(`/products/${id}`, productData)
    return response.data.data
  },

  // Delete product
  deleteProduct: async (id: string): Promise<void> => {
    const response = await api.delete(`/products/${id}`)
    return response.data
  }
}

export default productService
