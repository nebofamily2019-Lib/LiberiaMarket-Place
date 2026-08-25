import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import { getImageUrl } from '../utils/imageUtils'
import HamburgerMenu from '../components/HamburgerMenu'
import MakeOfferModal from '../components/MakeOfferModal'
import ReportModal from '../components/ReportModal'
import { formatPriceWithCurrency } from '../utils/currency'
import '../styles/ProductDetails.css'
import { ProductDetailsSkeleton } from '../components/LoadingSkeleton'
import { savedItemService } from '../services/savedItemService'
import { getMyOfferForProduct, Offer } from '../services/offerService'
import { Heart, MapPin, Eye, Shield, Phone, Flag, Lock, UserPlus, Edit2, Trash2, MessageCircle, MessageSquare, Share2, XCircle, ArrowLeftRight } from 'lucide-react'

interface Product {
  id: string
  title: string
  description: string
  price: number
  currency?: string
  location: string
  condition: string
  status: string
  contactPhone?: string
  images?: string[]
  created_at: string
  view_count?: number
  current_bid?: number
  starting_bid?: number
  auction_end_time?: string
  bid_count?: number
  category?: {
    name: string
    icon: string
    color: string
  }
  seller?: {
    id: string
    name: string
    phone: string
    avg_rating?: number
    total_reviews?: number
    is_verified?: boolean
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
  const [showReportModal, setShowReportModal] = useState(false)
  const [isMsgLoading, setIsMsgLoading] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [myOffer, setMyOffer] = useState<Offer | null>(null)
  
  useEffect(() => {
    fetchProductDetails()
  }, [id])

  useEffect(() => {
    if (isAuthenticated && id) {
      checkSavedStatus()
      fetchMyOffer()
    }
  }, [id, isAuthenticated])

  const fetchMyOffer = async () => {
    try {
      if (id) {
        const offer = await getMyOfferForProduct(id)
        setMyOffer(offer)
      }
    } catch (error) {
      console.error('Error fetching my offer:', error)
    }
  }

  const checkSavedStatus = async () => {
    try {
      if (id) {
        const response = await savedItemService.checkSavedStatus(id)
        setIsSaved(response.isSaved)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    }
  }

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true)
      return
    }

    try {
      if (id) {
        const response = await savedItemService.toggleSavedItem(id)
        setIsSaved(response.saved)
        toast.success(response.message)
      }
    } catch (error) {
      console.error('Error toggling saved item:', error)
      toast.error('Failed to update saved items')
    }
  }

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

  const handleMakeOffer = () => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    setShowOfferModal(true)
  }

  const handleMessageSeller = async () => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }
    try {
      setIsMsgLoading(true)
      const response = await api.post('/messages/conversations', { listing_id: product?.id })
      if (response.data.success) {
        navigate(`/messages/${response.data.data.id}`)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Could not start conversation')
    } finally {
      setIsMsgLoading(false)
    }
  }

  const handleBack = () => {
    navigate(-1)
  }

  if (loading) {
    return (
      <div className="product-details-container">
        <HamburgerMenu />
        <div style={{ padding: '6rem 1rem 2rem' }}>
          <ProductDetailsSkeleton />
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="product-details-container">
        <HamburgerMenu />
        <div className="error-state">
          <div className="error-icon"><XCircle size={48} color="#dc2626" /></div>
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
          {/* Product Images Gallery */}
          {product.images && product.images.length > 0 && (
            <div className="product-gallery">
              {/* Main Image */}
              <div className="main-image-container">
                <img
                  src={getImageUrl(product.images[selectedImageIndex])}
                  alt={`${product.title} - Image ${selectedImageIndex + 1}`}
                  className="main-product-image"
                  loading="lazy"
                />
              </div>

              {/* Thumbnail Grid */}
              {product.images.length > 1 && (
                <div className="image-thumbnails">
                  {product.images.map((image, index) => (
                    <div
                      key={index}
                      className={`thumbnail ${index === selectedImageIndex ? 'active' : ''}`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={getImageUrl(image)} alt={`Thumbnail ${index + 1}`} loading="lazy" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

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
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <button 
                className={`save-button ${isSaved ? 'saved' : ''}`}
                onClick={handleToggleSave}
                title={isSaved ? "Remove from saved" : "Save item"}
                aria-label={isSaved ? "Remove from saved items" : "Save to saved items"}
              >
                <Heart 
                  size={24} 
                  fill={isSaved ? '#ef4444' : 'none'} 
                  color={isSaved ? '#ef4444' : '#6b7280'} 
                />
              </button>
              <span className={`status-badge status-${product.status}`}>
                {product.status}
              </span>
            </div>
          </div>

          {/* Price / Offer Info */}
          <div className="price-section">
            <div className="price-row">
                <span className="price-label">Asking Price</span>
                <div className="price-value-container">
                  <span className="price-value-primary">
                    {formatPriceWithCurrency(product.price || product.starting_bid || 0, product.currency).primary}
                  </span>
                  <span className="price-value-secondary">
                    {formatPriceWithCurrency(product.price || product.starting_bid || 0, product.currency).secondary}
                  </span>
                </div>
                {/* Only show offer count if there are offers */}
                {(product.bid_count || 0) > 0 && (
                  <span className="bid-count" style={{ marginLeft: '10px', fontSize: '0.9rem', color: '#666' }}>
                      ({product.bid_count} offers)
                  </span>
                )}
            </div>
            
          </div>

          {/* My Offer Banner */}
          {myOffer && (
            <div style={{ 
              marginTop: '1rem', 
              padding: '1rem', 
              background: '#f0f9ff', 
              border: '1px solid #bae6fd', 
              borderRadius: '8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.9rem', color: '#0369a1', fontWeight: 'bold' }}>
                  Your Offer
                </span>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0284c7' }}>
                    {formatPriceWithCurrency(myOffer.offer_amount, myOffer.currency).primary}
                  </span>
                  <span style={{ fontSize: '0.9rem', color: '#0369a1' }}>
                    {formatPriceWithCurrency(myOffer.offer_amount, myOffer.currency).secondary}
                  </span>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  Status: <span style={{ fontWeight: 'bold', textTransform: 'capitalize', color: myOffer.status === 'accepted' ? '#16a34a' : myOffer.status === 'rejected' ? '#dc2626' : '#ca8a04' }}>{myOffer.status}</span>
                </span>
              </div>
            </div>
          )}

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
                <span className="info-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><MapPin size={14} /> {product.location}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Listed</span>
                <span className="info-value">
                  {new Date(product.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Views</span>
                <span className="info-value" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Eye size={14} /> {product.view_count || 0}</span>
              </div>
            </div>
          </div>

          {/* Seller Information */}
          {product.seller && (
            <div className="details-section">
              <h3 className="section-title">Seller Information</h3>
              <div className="seller-info">
                <div className="seller-details">
                  <div
                    className="seller-avatar"
                    style={{ cursor: !isOwner ? 'pointer' : 'default' }}
                    onClick={() => !isOwner && navigate(`/seller/${product.seller?.id}`)}
                  >
                    {product.seller.name.charAt(0).toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <p
                        className="seller-name"
                        style={{
                          cursor: !isOwner ? 'pointer' : 'default',
                          textDecoration: !isOwner ? 'underline' : 'none'
                        }}
                        onClick={() => !isOwner && navigate(`/seller/${product.seller?.id}`)}
                      >
                        {product.seller.name}
                      </p>
                      {product.seller.is_verified && (
                        <span style={{
                          padding: '0.125rem 0.5rem',
                          background: '#10b981',
                          color: 'white',
                          borderRadius: '12px',
                          fontSize: '0.7rem',
                          fontWeight: 600
                        }}>
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <p className="seller-phone" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Phone size={14} /> +231 {product.seller.phone}</p>
                  </div>
                </div>

                {!isOwner && (
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {product.status === 'sold' ? (
                      <div style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#f3f4f6',
                        borderRadius: '8px',
                        textAlign: 'center',
                        color: '#9ca3af',
                        fontWeight: '600'
                      }}>
                        This item has been sold
                      </div>
                    ) : (
                      <>
                        {/* Primary: WhatsApp — works without login */}
                        {product.seller?.phone && (
                          <button
                            onClick={() => {
                              const phone = product.seller!.phone.replace(/\D/g, '');
                              const fullPhone = phone.startsWith('231') ? phone : `231${phone}`;
                              const text = encodeURIComponent(`Hi, I'm interested in your "${product.title}" on LibMarket.`);
                              window.open(`https://wa.me/${fullPhone}?text=${text}`, '_blank');
                            }}
                            style={{
                              flex: 1,
                              padding: '0.875rem',
                              background: '#25D366',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              fontSize: '1rem'
                            }}
                          >
                            <MessageCircle size={18} /> WhatsApp Seller
                          </button>
                        )}

                        {/* Secondary: Call — works without login */}
                        {product.seller?.phone && (
                          <a
                            href={`tel:+231${product.seller.phone.replace(/\D/g, '')}`}
                            style={{
                              flex: 1,
                              padding: '0.875rem',
                              background: '#00205B',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.5rem',
                              fontSize: '1rem',
                              textDecoration: 'none'
                            }}
                          >
                            <Phone size={18} /> Call Seller
                          </a>
                        )}

                        {/* Message Seller — in-app, requires login */}
                        <button
                          onClick={handleMessageSeller}
                          disabled={isMsgLoading}
                          style={{
                            width: '100%',
                            padding: '0.875rem',
                            background: 'var(--primary-blue)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: '700',
                            cursor: isMsgLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            opacity: isMsgLoading ? 0.75 : 1,
                          }}
                        >
                          <MessageSquare size={18} />
                          {isMsgLoading ? 'Opening chat...' : 'Message Seller'}
                        </button>

                        {/* Make Offer — requires login */}
                        <button
                          onClick={handleMakeOffer}
                          className="btn-offer"
                          style={{ width: '100%' }}
                        >
                          <ArrowLeftRight size={18} /> Make Offer
                        </button>
                      </>
                    )}
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
                <Edit2 size={16} /> Edit Product
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this product?')) {
                    // Handle delete
                    api.delete(`/products/${product.id}`)
                      .then(() => {
                        navigate('/my-products')
                      })
                      .catch(() => {
                        alert('Failed to delete product')
                      })
                  }
                }}
                className="btn-delete"
              >
                <Trash2 size={16} /> Delete
              </button>
            </div>
          )}

          {/* Share Section */}
          <div className="share-section" style={{ marginTop: '1.5rem', padding: '1rem', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Share2 size={16} /> Share with Friends</h3>
            <button
              onClick={() => {
                const text = encodeURIComponent(`Check out this ${product.title} on LibMarket! Price: ${formatPriceWithCurrency(product.price, product.currency)}`);
                const url = encodeURIComponent(window.location.href);
                window.open(`https://wa.me/?text=${text}%20${url}`, '_blank');
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                background: '#25D366',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                fontSize: '1rem'
              }}
            >
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* Safety Tips */}
        <div className="safety-tips">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={18} /> Safety Tips</h3>
          <ul>
            <li>Meet in a public place for transactions</li>
            <li>Inspect the product before payment</li>
            <li>Don't share personal financial information</li>
            <li>Report suspicious listings</li>
          </ul>
        </div>
      </div>

      {/* Authentication Prompt Modal */}
      {showAuthPrompt && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '1rem'
          }}
          onClick={() => setShowAuthPrompt(false)}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '2.5rem',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
              textAlign: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}><Lock size={40} color="#1f2937" /></div>

            <h2 style={{ margin: '0 0 1rem', fontSize: '1.75rem', color: '#1f2937' }}>
              Create an Account to Continue
            </h2>

            <p style={{ margin: '0 0 2rem', color: '#6b7280', fontSize: '1rem', lineHeight: '1.6' }}>
              You can browse and contact sellers via WhatsApp or phone for free.
              Create an account to make offers, save items, and track conversations.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button
                onClick={() => navigate('/register?role=buyer')}
                style={{
                  padding: '1rem 2rem',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                <UserPlus size={18} /> Create Buyer Account
              </button>

              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: '1rem 2rem',
                  background: 'white',
                  color: '#667eea',
                  border: '2px solid #667eea',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Already have an account? Login
              </button>

              <button
                onClick={() => setShowAuthPrompt(false)}
                style={{
                  padding: '0.75rem',
                  background: 'transparent',
                  color: '#9ca3af',
                  border: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                Continue Browsing
              </button>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                padding: '1rem',
                background: '#f0f9ff',
                borderRadius: '12px',
                border: '1px solid #bfdbfe'
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#1e40af' }}>
                <strong>Why create an account?</strong>
                <br />
                • Make offers on products
                <br />
                • Message sellers directly
                <br />
                • Track your conversations
                <br />
                • Save your favorite items
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Make Offer Modal */}
      {showOfferModal && product && (
        <MakeOfferModal
          productId={product.id}
          productTitle={product.title}
          productPrice={product.price}
          productCurrency={product.currency}
          onClose={() => setShowOfferModal(false)}
          onSuccess={() => {
            fetchProductDetails()
            fetchMyOffer()
          }}
        />
      )}

      {/* Report Modal */}
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        productId={product?.id}
      />

      {/* Report Button (Floating or placed appropriately) */}
      {product && (
        <div style={{ textAlign: 'center', marginTop: '2rem', marginBottom: '2rem' }}>
          <button
            onClick={() => {
              if (!isAuthenticated) {
                setShowAuthPrompt(true);
              } else {
                setShowReportModal(true);
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#ef4444',
              textDecoration: 'underline',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            <Flag size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '0.25rem' }} /> Report this item
          </button>
        </div>
      )}
    </div>
  )
}

export default ProductDetails
