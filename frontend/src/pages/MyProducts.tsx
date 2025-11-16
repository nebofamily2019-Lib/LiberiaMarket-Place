import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import TopNav from '../components/TopNav'
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

  useEffect(() => {
    fetchMyProducts()
  }, [currentPage])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/dashboard/my-products?page=${currentPage}&limit=10`)
      
      if (response.data.success) {
        setProducts(response.data.data)
        setTotalPages(response.data.pagination?.totalPages || 1)
      }
    } catch (err: any) {
      console.error('Error fetching my products:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="my-products-container">
        <HamburgerMenu />
        <TopNav />
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
      <TopNav />
      
      <div className="my-products-content">
        <div className="page-header">
          <h1>📦 My Products</h1>
          <button 
            className="btn-add"
            onClick={() => navigate('/products/add')}
          >
            + Add New Product
          </button>
        </div>

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
                      onClick={() => navigate(`/products/${product.id}/edit`)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/products/${product.id}`)}
                    >
                      View
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
