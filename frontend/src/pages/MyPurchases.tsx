import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import TopNav from '../components/TopNav'
import '../styles/MyProducts.css'

interface Purchase {
  id: string
  title: string
  description: string
  price: number
  status: string
  purchasedAt: string
  seller?: {
    name: string
    phone: string
  }
}

const MyPurchases = () => {
  const navigate = useNavigate()
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyPurchases()
  }, [])

  const fetchMyPurchases = async () => {
    try {
      setLoading(true)
      const response = await api.get('/dashboard/my-purchases')
      
      if (response.data.success) {
        setPurchases(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching purchases:', err)
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
          <p>Loading your purchases...</p>
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
          <h1>🛍️ My Purchases</h1>
          <button 
            className="btn-add"
            onClick={() => navigate('/products')}
          >
            Browse More Products
          </button>
        </div>

        {purchases.length > 0 ? (
          <div className="products-grid">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="product-card">
                <div className="product-header">
                  <h3>{purchase.title}</h3>
                  <span className="status-badge status-purchased">
                    Purchased
                  </span>
                </div>
                
                <p className="product-description">{purchase.description}</p>
                
                <div className="product-details">
                  <div className="detail-item">
                    <span className="detail-label">Price Paid:</span>
                    <span className="detail-value price">${purchase.price}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Date:</span>
                    <span className="detail-value">
                      {new Date(purchase.purchasedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {purchase.seller && (
                    <div className="detail-item">
                      <span className="detail-label">Seller:</span>
                      <span className="detail-value">
                        {purchase.seller.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="product-actions">
                  <button 
                    className="btn-view"
                    onClick={() => navigate(`/products/${purchase.id}`)}
                  >
                    View Details
                  </button>
                  {purchase.seller?.phone && (
                    <button 
                      className="btn-contact"
                      onClick={() => window.location.href = `tel:+231${purchase.seller?.phone}`}
                    >
                      Contact Seller
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">🛍️</div>
            <h2>No purchases yet</h2>
            <p>Start shopping to see your purchase history here</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPurchases
