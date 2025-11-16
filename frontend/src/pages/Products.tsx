import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/Products.css'
import SearchHeader from '../components/SearchHeader'
import CategoryFilter from '../components/CategoryFilter'
import ProductGrid from '../components/ProductGrid'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import { designSystem } from '../styles/designSystem'
import FilterSheet from '../components/FilterSheet'
import TopNav from '../components/TopNav'

interface Product {
  id: string
  title: string
  description: string
  price: number
  location: string
  category?: {
    name: string
    icon: string
    color: string
  }
  seller?: {
    name: string
    phone: string
  }
  images?: string[]
  status: string
  createdAt: string
}

/**
 * Products Page - Browse All Products
 * - Mobile-first marketplace view
 * - Search, filter, and browse functionality
 */
const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageLimit] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const navigate = useNavigate()

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching products from API...')
        const response = await api.get(`/products?page=${currentPage}&limit=${pageLimit}`)
        
        console.log('API Response:', response.data)

        if (response.data.success) {
          setProducts(response.data.data || [])
          setTotalPages(response.data.pagination?.totalPages || 1)
        } else {
          throw new Error(response.data.error || 'Failed to fetch products')
        }
      } catch (err: any) {
        console.error('Error fetching products:', err)
        const errorMessage = err.response?.data?.error || err.message || 'Failed to load products'
        setError(errorMessage)
        setProducts([])
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [currentPage])

  const handleClearFilters = () => {
    setMinPrice('')
    setMaxPrice('')
  }

  const handleApplyFilters = (newFilters: any) => {
    setFilters(newFilters)
    // Apply filters to product list
    // ...filter logic...
  }

  const hasActiveFilters = minPrice || maxPrice

  // Quick price range presets for Liberian market
  const pricePresets = [
    { label: 'Under L$100', min: '', max: '100' },
    { label: 'L$100 - L$500', min: '100', max: '500' },
    { label: 'L$500 - L$1,000', min: '500', max: '1000' },
    { label: 'L$1,000 - L$5,000', min: '1000', max: '5000' },
    { label: 'Over L$5,000', min: '5000', max: '' }
  ]

  const handlePresetClick = (min: string, max: string) => {
    setMinPrice(min)
    setMaxPrice(max)
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="products-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="products-container">
        <HamburgerMenu />
        <div className="error-state">
          <div className="error-icon">❌</div>
          <p>{error}</p>
          <button onClick={() => fetchProducts()} className="retry-button">
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="products-container">
      <HamburgerMenu />
      <TopNav />

      {/* Header with Navigation */}
      <div className="products-header">
        <div className="header-content">
          <h1>🛍️ Browse Products</h1>
          <p className="subtitle">Discover amazing products from local sellers</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No products available</h2>
          <p>Check back later for new listings</p>
          <button 
            onClick={() => navigate('/dashboard')} 
            className="back-button"
          >
            ← Back to Dashboard
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                {/* ...existing product card content... */}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              {/* ...existing pagination... */}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Products