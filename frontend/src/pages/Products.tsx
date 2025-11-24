import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import EnhancedSearch from '../components/EnhancedSearch'

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
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('category')
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState<any[]>([])
  const [filters, setFilters] = useState<any>({})
  const pageLimit = 12

  // Fetch products from API
  useEffect(() => {
    fetchCategories()
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
      
      const url = `/products?${params.toString()}`
      
      const response = await api.get(url)
      
      if (response.data.success) {
        setProducts(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
      }
    } catch (err: any) {
      console.error('❌ Error fetching products:', err)
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters)
    setCurrentPage(1) // Reset to first page
  }
  
  useEffect(() => {
    fetchProducts()
  }, [filters, currentPage, categoryId])

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
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="products-container">
      <HamburgerMenu />
      
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 1rem 2rem' }}>
        {/* Enhanced Search */}
        <EnhancedSearch 
          onSearch={handleSearch}
          categories={categories}
        />

        <div style={{
          background: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '2rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ margin: '0 0 0.5rem', fontSize: '2rem' }}>
                🛍️ {categoryId ? 'Filtered Products' : 'All Products'}
              </h1>
              <p style={{ margin: 0, color: '#10b981', fontWeight: 600 }}>
                {products.length} product{products.length !== 1 ? 's' : ''} available
              </p>
            </div>
            
            {categoryId && (
              <button
                onClick={() => navigate('/products')}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Clear Filter
              </button>
            )}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>⚠️ {error}</span>
            <button onClick={fetchProducts} style={{
              padding: '0.5rem 1rem',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>Retry</button>
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {products.map((product) => (
                <div key={product.id} style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s ease',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Product Header */}
                  <div style={{ marginBottom: '1rem' }}>
                    <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', color: '#1f2937' }}>
                      {product.title}
                    </h3>
                    {product.category && (
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: product.category.color + '20',
                        color: product.category.color
                      }}>
                        {product.category.icon} {product.category.name}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p style={{ margin: '0 0 1rem', color: '#6b7280', fontSize: '0.95rem' }}>
                    {product.description.length > 100 
                      ? `${product.description.substring(0, 100)}...` 
                      : product.description}
                  </p>

                  {/* Price & Location */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                      ${product.price.toFixed(2)}
                    </span>
                    <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      📍 {product.location}
                    </span>
                  </div>

                  {/* View Button */}
                  <button
                    onClick={() => navigate(`/products/${product.id}`)}
                    style={{
                      width: '100%',
                      marginTop: '1rem',
                      padding: '0.75rem',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1rem',
                padding: '1rem',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage === 1 ? '#f3f4f6' : '#667eea',
                    color: currentPage === 1 ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  ← Previous
                </button>
                <span style={{ fontWeight: 600 }}>
                  Page {currentPage} of {totalPages}
                </span>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: currentPage >= totalPages ? '#f3f4f6' : '#667eea',
                    color: currentPage >= totalPages ? '#9ca3af' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer'
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>📦</div>
            <h2 style={{ margin: '0 0 0.5rem', color: '#1f2937' }}>No products available</h2>
            <p style={{ margin: 0, color: '#6b7280' }}>
              {categoryId ? 'No products found in this category' : 'Be the first to list a product!'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Products