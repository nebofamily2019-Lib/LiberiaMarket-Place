import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import MarkAsSoldModal from '../components/MarkAsSoldModal'
import '../styles/Dashboard.css'
import '../styles/MyProducts.css'
import { formatPriceWithCurrency } from '../utils/currency'
import { DollarSign, Package } from 'lucide-react'
import { getImageUrl } from '../utils/imageUtils'
import { calculateSellerPayout } from '../utils/platformFee'

interface Product {
  id: string
  title: string
  description: string
  price: number
  status: string
  location: string
  created_at: string
  condition?: string
  images?: string[]
  category?: {
    name: string
    icon: string
    color: string
  }
  sold_price?: number
  sold_at?: string
}

const STATUS_TABS = ['active', 'pending', 'sold'] as const
type StatusTab = typeof STATUS_TABS[number]

const TAB_LABELS: Record<StatusTab, string> = {
  active: '🟢 Active',
  pending: '🟡 Pending',
  sold: '✅ Sold',
}

const MyProducts = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const statusFilter = (searchParams.get('status') || 'active') as StatusTab

  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [selectedProductForSale, setSelectedProductForSale] = useState<Product | null>(null)

  useEffect(() => {
    fetchMyProducts()
  }, [currentPage, statusFilter])

  const fetchMyProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await api.get(`/dashboard/my-products?page=${currentPage}&limit=12&status=${statusFilter}`)
      if (response.data.success) {
        setProducts(response.data.data || [])
        setTotalPages(response.data.pagination?.totalPages || 1)
      }
    } catch (err: any) {
      console.error('Error fetching my products:', err)
      setError(err.response?.data?.error || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleTabChange = (status: string) => {
    setSearchParams({ status })
    setCurrentPage(1)
  }

  const handleMarkAsSold = async (data: { soldPrice: number; paymentMethod: string; buyerId?: string }) => {
    if (!selectedProductForSale) return
    try {
      await api.post(`/products/${selectedProductForSale.id}/sold`, data)
      alert('Product marked as sold!')
      setSelectedProductForSale(null)
      fetchMyProducts()
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to mark as sold')
    }
  }

  const handleEdit   = (id: string) => navigate(`/products/${id}/edit`)
  const handleView   = (id: string) => navigate(`/products/${id}`)
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return
    try {
      const response = await api.delete(`/products/${id}`)
      if (response.data.success) {
        fetchMyProducts()
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete product')
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading your products...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <HamburgerMenu />

      <div className="dashboard-content">

        {/* Page Heading */}
        <h1>My Market Stand 📦</h1>

        {/* Quick Navigation Banner */}
        <div className="quick-nav-banner">
          <button className="quick-nav-btn" onClick={() => navigate('/dashboard')} title="Back to dashboard">
            <span className="quick-nav-icon">🏠</span>
            <span className="quick-nav-label">Dashboard</span>
          </button>
          <button className="quick-nav-btn" onClick={() => navigate('/products')} title="Browse all products">
            <span className="quick-nav-icon">🛍️</span>
            <span className="quick-nav-label">Products</span>
          </button>
          <button className="quick-nav-btn" onClick={() => navigate('/seller/financials')} title="View financials">
            <span className="quick-nav-icon">📊</span>
            <span className="quick-nav-label">Financials</span>
          </button>
          <button className="quick-nav-btn" onClick={() => navigate('/products/add')} title="Add new product">
            <span className="quick-nav-icon">➕</span>
            <span className="quick-nav-label">Add Product</span>
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div style={{
            padding: '1rem 1.25rem',
            background: '#fef2f2',
            color: '#dc2626',
            borderRadius: '12px',
            border: '1px solid #fecaca',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Products Section */}
        <div className="dashboard-section">

          {/* Section Header: tabs left, add-button right */}
          <div className="section-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>
                {statusFilter === 'active'  && '🟢 Active Listings'}
                {statusFilter === 'pending' && '🟡 Pending Listings'}
                {statusFilter === 'sold'    && '✅ Sold Items'}
              </h2>
              <span style={{
                background: '#e0e7ff',
                color: '#3730a3',
                padding: '0.2rem 0.75rem',
                borderRadius: '20px',
                fontSize: '0.8rem',
                fontWeight: 700,
              }}>
                {products.length} {products.length === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button className="btn-add" onClick={() => navigate('/products/add')}>
              ➕ Add Product
            </button>
          </div>

          {/* Status Tab Pills */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {STATUS_TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                style={{
                  padding: '0.5rem 1.1rem',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: statusFilter === tab ? '#00205B' : '#e5e7eb',
                  background: statusFilter === tab ? '#00205B' : '#fff',
                  color: statusFilter === tab ? '#fff' : '#374151',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>

          {/* Products Grid or Empty State */}
          {products.length > 0 ? (
            <>
              <div className="products-grid">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={handleEdit}
                    onView={handleView}
                    onDelete={handleDelete}
                    onMarkAsSold={setSelectedProductForSale}
                  />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(p => p - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span>Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage(p => p + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon"><Package size={52} /></div>
              <h2>No {statusFilter} products</h2>
              <p>
                {statusFilter === 'active'  && 'Start selling by adding your first product.'}
                {statusFilter === 'pending' && 'No products are pending review right now.'}
                {statusFilter === 'sold'    && "You haven't sold anything yet — keep listing!"}
              </p>
              {statusFilter !== 'sold' && (
                <button className="btn-primary" onClick={() => navigate('/products/add')}>
                  Add Your First Product
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {selectedProductForSale && (
        <MarkAsSoldModal
          product={selectedProductForSale}
          onClose={() => setSelectedProductForSale(null)}
          onConfirm={handleMarkAsSold}
        />
      )}
    </div>
  )
}

/* ── Product Card ──────────────────────────── */
interface CardProps {
  product: Product
  onEdit: (id: string) => void
  onView: (id: string) => void
  onDelete: (id: string, title: string) => void
  onMarkAsSold: (p: Product) => void
}

const ProductCard = ({ product, onEdit, onView, onDelete, onMarkAsSold }: CardProps) => {
  const [imgErr, setImgErr] = useState(false)
  const imgSrc = product.images?.[0] ? getImageUrl(product.images[0]) : undefined

  return (
    <div className="product-card">

      {/* Image */}
      <div style={{
        width: '100%',
        aspectRatio: '4/3',
        borderRadius: '8px',
        overflow: 'hidden',
        background: '#f3f4f6',
        flexShrink: 0,
      }}>
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={product.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block' }}
            onError={() => setImgErr(true)}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, #00205B 0%, #00143e 100%)',
            color: '#fff',
          }}>
            <Package size={38} />
          </div>
        )}
      </div>

      {/* Status + Category */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span className={`status-badge status-${product.status}`}>{product.status}</span>
        {product.category && (
          <span className="category-badge" style={{
            background: product.category.color + '18',
            color: product.category.color,
          }}>
            {product.category.icon} {product.category.name}
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="product-title">{product.title}</h3>

      {/* Price */}
      <div className="product-price">
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#BF0A30' }}>
          {formatPriceWithCurrency(product.price).primary}
        </span>
        <span style={{ fontSize: '0.78rem', color: '#6b7280' }}>
          {formatPriceWithCurrency(product.price).secondary}
        </span>
      </div>

      {/* Description */}
      {product.description && (
        <p className="product-description">{product.description}</p>
      )}

      {/* Meta */}
      <div className="product-meta">
        <span>📍 {product.location}</span>
        <span>{new Date(product.created_at).toLocaleDateString()}</span>
      </div>

      {/* Actions */}
      <div className="product-actions">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0.4rem' }}>
          <button className="btn-action btn-edit"   onClick={() => onEdit(product.id)}>Edit</button>
          <button className="btn-action btn-view"   onClick={() => onView(product.id)}>View</button>
          <button className="btn-action btn-delete" onClick={() => onDelete(product.id, product.title)}>Delete</button>
        </div>

        {product.status === 'active' && (
          <button
            onClick={() => onMarkAsSold(product)}
            style={{
              width: '100%', padding: '0.5rem',
              background: '#059669', color: '#fff',
              border: 'none', borderRadius: '7px',
              fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}
          >
            <DollarSign size={15} /> Mark as Sold
          </button>
        )}

        {product.status === 'sold' && (
          <div style={{
            fontSize: '0.8rem', color: '#374151',
            background: '#f0fdf4',
            padding: '0.5rem 0.75rem', borderRadius: '7px',
            border: '1px solid #bbf7d0', lineHeight: 1.6,
          }}>
            <div>Sold for: <strong style={{ color: '#059669' }}>{formatPriceWithCurrency(product.sold_price).primary}</strong></div>
            <div style={{ color: '#6b7280' }}>
              You receive: <strong>{formatPriceWithCurrency(calculateSellerPayout(product.sold_price).netPayout).primary}</strong> (after 1% platform fee)
            </div>
            {product.sold_at && (
              <div style={{ color: '#6b7280' }}>{new Date(product.sold_at).toLocaleDateString()}</div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyProducts
