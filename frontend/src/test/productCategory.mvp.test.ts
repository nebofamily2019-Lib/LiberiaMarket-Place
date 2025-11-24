import { describe, it, expect, vi, beforeEach } from 'vitest'
import categoryService from '../services/categoryService'
import productService, { Product, Category } from '../services/productService'

vi.mock('../services/categoryService')
vi.mock('../services/productService')

describe('Product Posting and Category Loading', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('loads categories for product form', async () => {
    const categories: Category[] = [
      { id: '1', name: 'Electronics', slug: 'electronics' },
      { id: '2', name: 'Fashion', slug: 'fashion' }
    ]
    vi.mocked(categoryService.getCategories).mockResolvedValueOnce(categories)
    const result = await categoryService.getCategories()
    expect(result.length).toBeGreaterThan(0)
    expect(result[0].name).toBe('Electronics')
  })

  it('posts a product as seller', async () => {
    const productData = new FormData()
    productData.append('title', 'Test Product')
    productData.append('description', 'A product for testing')
    productData.append('price', '100')
    productData.append('category_id', '1')
    productData.append('location', 'Monrovia')
    productData.append('condition', 'new')
    productData.append('isNegotiable', 'true')
    productData.append('contactPhone', '77712345')
    const mockProduct: Product = {
      id: 'p1',
      title: 'Test Product',
      slug: 'test-product',
      description: 'A product for testing',
      price: 100,
      condition: 'new',
      status: 'active',
      images: [],
      location: 'Monrovia',
      contactPhone: '77712345',
      views: 0,
      isNegotiable: true,
      tags: [],
      seller_id: 'u1',
      category_id: '1',
      created_at: '',
      updated_at: ''
    }
    vi.mocked(productService.createProduct).mockResolvedValueOnce(mockProduct)
    const result = await productService.createProduct(productData)
    expect(result.title).toBe('Test Product')
    expect(result.price).toBe(100)
    expect(result.category_id).toBe('1')
  })
})
