import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import '../styles/Products.css'

interface Product {
  id: string
  title: string
  description: string
  price: number
  location: string
  status: string
  createdAt: string
  category?: {
    name: string
    icon: string
    color: string
  }
  seller?: {
    name: string
    phone: string
  }
}

const BrowseProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const pageLimit = 20

  useEffect(() => {
    fetchProducts()
  }, [currentPage])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await api.get(`/products?page=${currentPage}&limit=${pageLimit}&status=active`)
      
      console.log('📦 Products fetched:', response.data)
      
      if (response.data.success) {
        setProducts(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (loading) {
    return (
      <div className="products-container">
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
      {/* Guest Header */}
      <div className="guest-header">
        <button 
          className="back-home-btn"
          onClick={() => navigate('/')}
        >
          ← Back to Home
        </button>
        <div className="guest-actions">
          <button 
            className="btn-login"
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn-register"
            onClick={() => navigate('/register')}
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Header with Navigation */}
      <div className="products-header">
        <div className="header-content">
          <h1>🛍️ Browse Products</h1>
          <p className="subtitle">Discover amazing products from local sellers in Liberia</p>
          <p className="product-count">{products.length} products available</p>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h2>No products available</h2>
          <p>Be the first to list a product on our marketplace!</p>
          <button 
            onClick={() => navigate('/register')} 
            className="back-button"
          >
            Sign Up to Sell
          </button>
        </div>
      ) : (
        <>
          <div className="products-grid">
            {products.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-header">
                  <h3 className="product-title">{product.title}</h3>
                  {product.category && (
                    <span 
                      className="product-badge"
                      style={{ 
                        background: product.category.color + '20',
                        color: product.category.color 
                      }}
                    >
                      {product.category.icon} {product.category.name}
                    </span>
                  )}
                </div>
                
                <p className="product-description">
                  {product.description.length > 150 
                    ? `${product.description.substring(0, 150)}...` 
                    : product.description}
                </p>

               {/* Product Details */}
               <div className="product-details">
                 <div className="detail-row">
                   <span className="detail-label">Condition:</span>
                   <span className="detail-value">{product.condition}</span>
                 </div>
                 <div className="detail-row">
                   <span className="detail-label">Listed:</span>
                   <span className="detail-value">
                     {new Date(product.createdAt).toLocaleDateString()}
                   </span>
                 </div>
               </div>
                
                <div className="product-footer">
                  <span className="product-price">${product.price.toFixed(2)}</span>
                  <span className="product-location">📍 {product.location}</span>
                </div>

                {product.seller && (
                  <div className="product-seller">
                    <span>
                      <strong>Seller:</strong> {product.seller.name}
                    </span>
                    <a 
                      href={`tel:+231${product.seller.phone}`}
                      className="contact-seller-btn"
                      onClick={(e) => {
                        // Prompt guests to sign up
                        e.preventDefault()
                        if (window.confirm('Sign up to contact sellers directly!')) {
                          navigate('/register')
                        }
                      }}
                    >
                      📞 Contact
                    </a>
                  </div>
                )}

                <button 
                  className="login-to-buy-btn"
                  onClick={() => navigate('/register')}
                >
                  Sign Up to Contact Seller
                </button>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default BrowseProducts
