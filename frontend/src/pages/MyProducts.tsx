import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/MyProducts.css'

interface Product {
  id: string
  title: string
  description: string
  price: number
  status: string
  location: string
  createdAt: string
  category?: {
    name: string
    icon: string
    color: string
  }
}

const MyProducts = () => {
  const navigate = useNavigate()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchMyProducts()
  }, [currentPage])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      console.log('📦 Fetching my products - Page:', currentPage)
      
      const response = await api.get(`/dashboard/my-products?page=${currentPage}&limit=10`)
      
      console.log('📦 My products response:', response.data)
      
      if (response.data.success) {
        setProducts(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
        console.log(`✅ Loaded ${response.data.data?.length || 0} products`)
      }
    } catch (err: any) {
      console.error('❌ Error fetching my products:', err)
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (productId: string) => {
    console.log('✏️ Editing product:', productId)
    navigate(`/products/${productId}/edit`)
  }

  const handleView = (productId: string) => {
    console.log('👁️ Viewing product:', productId)
    navigate(`/products/${productId}`)
  }

  const handleDelete = async (productId: string, productTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete "${productTitle}"?`)) {
      return
    }

    try {
      console.log('🗑️ Deleting product:', productId)
      const response = await api.delete(`/products/${productId}`)
      
      if (response.data.success) {
        alert('✅ Product deleted successfully!')
        fetchMyProducts() // Refresh the list
      }
    } catch (err: any) {
      console.error('❌ Error deleting product:', err)
      alert(err.response?.data?.error || 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="my-products-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading your products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-products-container">
      <HamburgerMenu />
      
      <div className="my-products-content">
        <div className="page-header">
          <h1>📦 My Products</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              {products.length} product{products.length !== 1 ? 's' : ''}
            </span>
            <button 
              className="btn-add"
              onClick={() => navigate('/products/add')}
            >
              + Add New Product
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#fee',
            color: '#dc2626',
            borderRadius: '8px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {products.length > 0 ? (
          <>
            <div className="products-grid">
              {products.map((product) => (
                <div key={product.id} className="product-card">
                  <div className="product-header">
                    <h3>{product.title}</h3>
                    <span className={`status-badge status-${product.status}`}>
                      {product.status}
                    </span>
                  </div>
                  
                  <p className="product-description">{product.description}</p>
                  
                  <div className="product-details">
                    <div className="detail-item">
                      <span className="detail-label">Price:</span>
                      <span className="detail-value price">${product.price}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Location:</span>
                      <span className="detail-value">📍 {product.location}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Condition:</span>
                      <span className="detail-value">{product.condition}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Listed:</span>
                      <span className="detail-value">
                        {new Date(product.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {product.category && (
                      <div className="detail-item">
                        <span className="detail-label">Category:</span>
                        <span className="detail-value">
                          {product.category.icon} {product.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="product-actions">
                    <button 
                      className="btn-edit"
                      onClick={() => handleEdit(product.id)}
                      title="Edit this product"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => handleView(product.id)}
                      title="View product details"
                    >
                      👁️ View
                    </button>
                    <button 
                      className="btn-delete"
                      onClick={() => handleDelete(product.id, product.title)}
                      title="Delete this product"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                <span>Page {currentPage} of {totalPages}</span>
                <button 
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No products yet</h2>
            <p>Start selling by adding your first product</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/products/add')}
            >
              Add Your First Product
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProducts
