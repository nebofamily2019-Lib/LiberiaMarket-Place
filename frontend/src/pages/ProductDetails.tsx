import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/ProductDetails.css'

interface Product {
  id: string
  title: string
  description: string
  price: number
  location: string
  condition: string
  status: string
  contactPhone?: string
  createdAt: string
  category?: {
    name: string
    icon: string
    color: string
  }
  seller?: {
    id: string
    name: string
    phone: string
  }
}

const ProductDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const toast = useToast()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showOfferModal, setShowOfferModal] = useState(false)
  const [offerAmount, setOfferAmount] = useState('')
  const [offerMessage, setOfferMessage] = useState('')
  const [sendingOffer, setSendingOffer] = useState(false)
  const [creatingConversation, setCreatingConversation] = useState(false)

  useEffect(() => {
    fetchProductDetails()
  }, [id])

  const fetchProductDetails = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/products/${id}`)
      
      if (response.data.success) {
        setProduct(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching product:', err)
      setError(err.response?.data?.error || 'Failed to load product')
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = async () => {
    if (!isAuthenticated) {
      toast.info('Please login to message the seller')
      navigate('/login')
      return
    }

    if (product?.seller_id === user?.id) {
      toast.warning('You cannot message yourself about your own product')
      return
    }

    try {
      setCreatingConversation(true)
      const response = await api.post('/conversations', {
        listing_id: product?.id
      })

      if (response.data.success) {
        toast.success('Opening conversation...')
        navigate(`/messages/${response.data.data.id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start conversation')
    } finally {
      setCreatingConversation(false)
    }
  }

  const handleMakeOffer = () => {
    if (!user) {
      alert('Please login to make an offer')
      navigate('/login')
      return
    }
    setShowOfferModal(true)
    // Pre-fill with 10% less than asking price
    const suggestedOffer = (product!.price * 0.9).toFixed(2)
    setOfferAmount(suggestedOffer)
  }

  const handleSendOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      alert('Please enter a valid offer amount')
      return
    }
    
    if (parseFloat(offerAmount) >= product!.price) {
      alert('Your offer should be less than the asking price')
      return
    }
    
    try {
      setSendingOffer(true)
      
      const response = await api.post('/offers', {
        product_id: product!.id,
        offer_amount: parseFloat(offerAmount),
        message: offerMessage.trim() || 'I would like to buy this item.'
      })
      
      if (response.data.success) {
        alert('✅ Offer sent successfully! The seller will contact you.')
        setShowOfferModal(false)
        setOfferAmount('')
        setOfferMessage('')
      }
    } catch (err: any) {
      console.error('Error sending offer:', err)
      alert(err.response?.data?.error || 'Failed to send offer. Please try again.')
    } finally {
      setSendingOffer(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="product-details-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading product details...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <HamburgerMenu />
        <div className="error-state">
          <div className="error-icon">❌</div>
          <h2>Product Not Found</h2>
          <p>{error || 'This product may have been removed'}</p>
          <button onClick={handleBack} className="btn-back">
            ← Go Back
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === product.seller?.id

  return (
    <div className="product-details-container">
      <HamburgerMenu />
      
      <div className="product-details-content">
        {/* Back Button */}
        <button onClick={handleBack} className="back-button">
          ← Back
        </button>

        {/* Product Card */}
        <div className="details-card">
          {/* Header */}
          <div className="details-header">
            <div>
              <h1 className="product-title">{product.title}</h1>
              {product.category && (
                <span 
                  className="category-badge"
                  style={{ 
                    background: product.category.color + '20',
                    color: product.category.color 
                  }}
                >
                  {product.category.icon} {product.category.name}
                </span>
              )}
            </div>
            <span className={`status-badge status-${product.status}`}>
              {product.status}
            </span>
          </div>

          {/* Price */}
          <div className="price-section">
            <span className="price-label">Price</span>
            <span className="price-value">${product.price.toFixed(2)}</span>
          </div>

          {/* Description */}
          <div className="details-section">
            <h3 className="section-title">Description</h3>
            <p className="description-text">{product.description}</p>
          </div>

          {/* Product Information */}
          <div className="details-section">
            <h3 className="section-title">Product Information</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Condition</span>
                <span className="info-value">{product.condition}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Location</span>
                <span className="info-value">📍 {product.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Listed</span>
                <span className="info-value">
                  {new Date(product.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          {product.seller && (
            <div className="details-section">
              <h3 className="section-title">Seller Information</h3>
              <div className="seller-info">
                <div className="seller-details">
                  <div className="seller-avatar">
                    {product.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="seller-name">{product.seller.name}</p>
                    <p className="seller-phone">📞 +231 {product.seller.phone}</p>
                  </div>
                </div>
                
                {!isOwner && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button 
                      onClick={handleMakeOffer}
                      className="btn-offer"
                    >
                      💰 Make Offer
                    </button>
                    <button 
                      onClick={handleContactSeller}
                      className="btn-contact"
                    >
                      📞 Contact Seller
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner Actions */}
          {isOwner && (
            <div className="owner-actions">
              <button 
                onClick={() => navigate(`/products/${product.id}/edit`)}
                className="btn-edit-full"
              >
                ✏️ Edit Product
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this product?')) {
                    // Handle delete
                    api.delete(`/products/${product.id}`)
                      .then(() => {
                        navigate('/my-products')
                      })
                      .catch(err => {
                        alert('Failed to delete product')
                      })
                  }
                }}
                className="btn-delete"
              >
                🗑️ Delete
              </button>
            </div>
          )}
        </div>

        {/* Safety Tips */}
        <div className="safety-tips">
          <h3>💡 Safety Tips</h3>
          <ul>
            <li>Meet in a public place for transactions</li>
            <li>Inspect the product before payment</li>
            <li>Don't share personal financial information</li>
            <li>Report suspicious listings</li>
          </ul>
        </div>
      </div>

      {/* Make Offer Modal */}
      {showOfferModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2000,
          padding: '1rem'
        }}
        onClick={() => setShowOfferModal(false)}
        >
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '2rem',
            maxWidth: '500px',
            width: '100%',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}
          onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', color: '#1f2937' }}>
              💰 Make an Offer
            </h2>
            
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem', color: '#6b7280', fontSize: '0.95rem' }}>
                <strong>Product:</strong> {product?.title}
              </p>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '0.95rem' }}>
                <strong>Asking Price:</strong> <span style={{ color: '#10b981', fontWeight: 700 }}>${product?.price.toFixed(2)}</span>
              </p>
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1f2937' }}>
                Your Offer (USD) *
              </label>
              <input
                type="number"
                placeholder="Enter your offer"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                Suggested: ${(product!.price * 0.9).toFixed(2)} (10% off)
              </span>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#1f2937' }}>
                Message (Optional)
              </label>
              <textarea
                placeholder="Add a message to the seller..."
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                rows={3}
                maxLength={500}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
              />
              <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                {offerMessage.length}/500 characters
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setShowOfferModal(false)}
                disabled={sendingOffer}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: sendingOffer ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSendOffer}
                disabled={sendingOffer}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  cursor: sendingOffer ? 'not-allowed' : 'pointer',
                  opacity: sendingOffer ? 0.6 : 1
                }}
              >
                {sendingOffer ? '⏳ Sending...' : '📤 Send Offer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
