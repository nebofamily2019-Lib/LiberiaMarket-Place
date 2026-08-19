import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/Products.css'
import EnhancedSearch from '../components/EnhancedSearch'
import { ProductGridSkeleton } from '../components/LoadingSkeleton'
import { useToast } from '../context/ToastContext'
import ProductCard from '../components/ProductCard'

interface Product {
  id: string
  title: string
  description: string
  price: number
  location: string
  images?: string[]
  category?: {
    name: string
    icon: string
    color: string
  }
  seller?: {
    name: string
    phone: string
  }
  status: string
  createdAt: string
}

/**
 * Products Page - Browse All Products
 * - Mobile-first marketplace view
 * - Search, filter, and browse functionality
 */
const Products = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('category')
  const toast = useToast()

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [counties, setCounties] = useState<any[]>([])
  const [selectedCounty, setSelectedCounty] = useState('')
  const [filters, setFilters] = useState<any>({})
  const pageLimit = 12

  // Fetch products from API
  useEffect(() => {
    fetchCategories()
    fetchCounties()
    fetchProducts()
  }, [currentPage, categoryId])

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories')
      if (response.data.success) {
        setCategories(response.data.data)
      }
    } catch (err) {
      console.error('Failed to load categories')
      toast.error('Failed to load categories. Some filters may not be available.')
    }
  }

  const fetchCounties = async () => {
    try {
      const response = await api.get('/counties')
      if (response.data.success) {
        setCounties(response.data.data)
      }
    } catch (err) {
      console.error('Failed to load counties')
    }
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build query string from filters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageLimit.toString(),
        status: 'active',
        ...filters
      })

      if (categoryId) {
        params.append('category_id', categoryId)
      }

      if (selectedCounty) {
        params.append('county', selectedCounty)
      }

      const url = `/products?${params.toString()}`

      const response = await api.get(url)

      if (response.data.success) {
        setProducts(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)

        // Show success toast if it's a search/filter action
        if (Object.keys(filters).length > 0 || categoryId) {
          toast.success(`Found ${response.data.data?.length || 0} product(s)`)
        }
      }
    } catch (err: any) {
      console.error('Error fetching products:', err)
      const errorMsg = err.response?.data?.error || 'Failed to load products'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page
  }

  const handleNearMe = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    toast.info('Getting your location...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFilters({
          ...filters,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          radius: 10 // 10km default
        })
        setCurrentPage(1)
        toast.success('Showing products near you (10km)')
      },
      (error) => {
        console.error('Error getting location:', error)
        toast.error('Failed to get location. Please allow location access.')
      }
    )
  }
  
  useEffect(() => {
    fetchProducts()
  }, [filters, currentPage, categoryId, selectedCounty])

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (loading) {
    return (
      <div className="products-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner"></div>
          <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>
            Loading Products...
          </h1>
        </div>
        <ProductGridSkeleton count={pageLimit} />
      </div>
    )
  }

  return (
    <div className="products-container">
      <HamburgerMenu />
      
      {/* Enhanced Search */}
      <EnhancedSearch
        onSearch={handleSearch}
        categories={categories}
      />

      {/* County Filter */}
      {counties.length > 0 && (
        <div style={{ padding: '0 1rem 1rem', maxWidth: '400px' }}>
          <select
            value={selectedCounty}
            onChange={(e) => {
              setSelectedCounty(e.target.value)
              setCurrentPage(1)
            }}
            style={{
              width: '100%',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-border)',
              background: 'var(--color-surface)',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            <option value="">All Counties</option>
            {counties.map((county: any) => (
              <option key={county.id} value={county.name}>
                {county.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="products-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div className="header-content">
            <h1>
              {categoryId ? 'Filtered Products' : 'All Products'}
            </h1>
            <p className="product-count">
              {products.length} product{products.length !== 1 ? 's' : ''} available
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleNearMe}
              style={{
                padding: '0.5rem 1rem',
                background: filters.latitude ? 'var(--color-success)' : 'var(--color-background)',
                color: filters.latitude ? 'white' : 'var(--color-text-secondary)',
                border: filters.latitude ? '2px solid var(--color-success)' : '2px solid var(--color-border)',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              Near Me
            </button>

            {(categoryId || Object.keys(filters).length > 0) && (
              <button
                onClick={() => {
                  navigate('/products')
                  setFilters({})
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: 'var(--color-background)',
                  color: 'var(--color-text-secondary)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-state">
          <div className="error-icon">!</div>
          <p>{error}</p>
          <button onClick={fetchProducts} className="retry-button">Retry</button>
        </div>
      )}

      {products.length > 0 ? (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ← Previous
              </button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">No Products</div>
          <h2>No products available</h2>
          <p>
            {categoryId ? 'No products found in this category' : 'Be the first to list a product!'}
          </p>
        </div>
      )}
    </div>
  )
}

export default Products