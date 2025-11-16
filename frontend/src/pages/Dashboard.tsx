import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import TopNav from '../components/TopNav'
import '../styles/Dashboard.css'

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

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<any>(null)
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [myPurchases, setMyPurchases] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  // Helper to check if user has a role
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles?.includes(role) || user.roles?.includes('admin');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch stats
      const statsRes = await api.get('/dashboard/stats')
      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      }

      // Fetch seller's products if user is a seller
      if (hasRole('seller')) {
        const productsRes = await api.get('/dashboard/my-products?limit=5')
        if (productsRes.data.success) {
          setMyProducts(productsRes.data.data)
        }
      }

      // Fetch buyer's purchases if user is a buyer
      if (hasRole('buyer')) {
        const purchasesRes = await api.get('/dashboard/my-purchases')
        if (purchasesRes.data.success) {
          setMyPurchases(purchasesRes.data.data)
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
      // Use placeholder data on error
      setStats({
        totalProducts: 0,
        activeProducts: 0,
        totalCategories: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMyProducts = () => {
    if (user?.role === 'seller' || user?.role === 'admin') {
      // Sellers go to their listed products
      navigate('/my-products')
    } else {
      // Buyers go to their purchases
      navigate('/my-purchases')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <HamburgerMenu />
        <TopNav />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <HamburgerMenu />
      <TopNav />
      
      <div className="dashboard-content">
        <h1>Welcome, {user?.name}! 👋</h1>
        
        {/* Stats Grid */}
        <div className="stats-grid">
          {user?.role === 'admin' && (
            <>
              <div className="stat-card">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <h3>{stats?.totalUsers || 0}</h3>
                  <p>Total Users</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats?.totalProducts || 0}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats?.activeProducts || 0}</h3>
                  <p>Active Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-info">
                  <h3>{stats?.totalCategories || 0}</h3>
                  <p>Categories</p>
                </div>
              </div>
            </>
          )}

          {user?.role === 'seller' && (
            <>
              <div className="stat-card">
                <div className="stat-icon">📦</div>
                <div className="stat-info">
                  <h3>{stats?.myProducts || 0}</h3>
                  <p>My Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <h3>{stats?.activeProducts || 0}</h3>
                  <p>Active Listings</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⏳</div>
                <div className="stat-info">
                  <h3>{stats?.pendingProducts || 0}</h3>
                  <p>Pending</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">👁️</div>
                <div className="stat-info">
                  <h3>{stats?.totalViews || 0}</h3>
                  <p>Total Views</p>
                </div>
              </div>
            </>
          )}

          {user?.role === 'buyer' && (
            <>
              <div className="stat-card">
                <div className="stat-icon">🛍️</div>
                <div className="stat-info">
                  <h3>{stats?.totalProducts || 0}</h3>
                  <p>Products Available</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📂</div>
                <div className="stat-info">
                  <h3>{stats?.totalCategories || 0}</h3>
                  <p>Categories</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🆕</div>
                <div className="stat-info">
                  <h3>{stats?.newListings || 0}</h3>
                  <p>New This Week</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Seller Section */}
        {hasRole('seller') && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>📦 My Products</h2>
              <button 
                className="view-all-btn"
                onClick={handleMyProducts}
              >
                View All →
              </button>
            </div>

            {myProducts.length > 0 ? (
              <>
                <div className="products-list">
                  {myProducts.map((product) => (
                    <div key={product.id} className="product-item">
                      <div className="product-info">
                        <h3>{product.title}</h3>
                        <p className="product-description">{product.description}</p>
                        <div className="product-meta">
                          <span className="product-price">${product.price}</span>
                          <span className={`product-status status-${product.status}`}>
                            {product.status}
                          </span>
                          <span className="product-location">📍 {product.location}</span>
                        </div>
                        {product.category && (
                          <div className="product-category">
                            {product.category.icon} {product.category.name}
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
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <p>You haven't listed any products yet</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/products/add')}
                >
                  List Your First Product
                </button>
              </div>
            )}
          </div>
        )}

        {/* Buyer Section */}
        {hasRole('buyer') && (
          <div className="dashboard-section">
            <div className="section-header">
              <h2>🛍️ My Purchases</h2>
              <button 
                className="view-all-btn"
                onClick={handleMyProducts}
              >
                View All →
              </button>
            </div>

            {myPurchases.length > 0 ? (
              <div className="purchases-list">
                {myPurchases.map((purchase) => (
                  <div key={purchase.id} className="product-item">
                    <div className="product-info">
                      <h3>{purchase.title}</h3>
                      <p className="product-description">{purchase.description}</p>
                      <div className="product-meta">
                        <span className="product-price">${purchase.price}</span>
                        <span className="product-date">
                          Purchased: {new Date(purchase.purchasedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="product-actions">
                      <button 
                        className="btn-view"
                        onClick={() => navigate(`/products/${purchase.id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🛍️</div>
                <p>You haven't made any purchases yet</p>
                <button 
                  className="btn-primary"
                  onClick={() => navigate('/products')}
                >
                  Start Shopping
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <button onClick={() => window.location.href = '/products'}>
              <span>🛍️</span>
              <span>Browse Products</span>
            </button>
            {(user?.role === 'seller' || user?.role === 'admin') && (
              <button onClick={() => window.location.href = '/products/add'}>
                <span>➕</span>
                <span>Add Product</span>
              </button>
            )}
            <button onClick={() => window.location.href = '/categories'}>
              <span>📂</span>
              <span>View Categories</span>
            </button>
            {user?.role === 'admin' && (
              <button onClick={() => window.location.href = '/admin/dashboard'}>
                <span>⚙️</span>
                <span>Admin Panel</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
