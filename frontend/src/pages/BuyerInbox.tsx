import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/BuyerInbox.css'

interface Offer {
  id: string
  offer_amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  updatedAt: string
  product: {
    id: string
    title: string
    price: number
  }
  seller: {
    id: string
    name: string
    phone: string
  }
}

const BuyerInbox = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    fetchMyOffers()
  }, [])

  const fetchMyOffers = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching my offers...')
      
      const response = await api.get('/offers/sent')
      
      if (response.data.success) {
        console.log(`✅ Loaded ${response.data.data.length} offers`)
        setOffers(response.data.data)
      }
    } catch (err: any) {
      console.error('❌ Error fetching offers:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleContactSeller = (phone: string) => {
    window.location.href = `tel:+231${phone}`
  }

  const handleViewProduct = (productId: string) => {
    navigate(`/products/${productId}`)
  }

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true
    return offer.status === filter
  })

  if (loading) {
    return (
      <div className="buyer-inbox-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading your offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="buyer-inbox-container">
      <HamburgerMenu />
      
      <div className="buyer-inbox-content">
        <div className="page-header">
          <h1>📬 My Offers</h1>
          <p className="subtitle">{offers.length} offer{offers.length !== 1 ? 's' : ''} made</p>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button 
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({offers.length})
          </button>
          <button 
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            ⏳ Pending ({offers.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            ✅ Accepted ({offers.filter(o => o.status === 'accepted').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            ❌ Rejected ({offers.filter(o => o.status === 'rejected').length})
          </button>
        </div>

        {filteredOffers.length > 0 ? (
          <div className="offers-list">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className={`offer-card status-${offer.status}`}>
                {/* Status Banner */}
                {offer.status === 'accepted' && (
                  <div className="status-banner accepted">
                    🎉 Your offer was accepted! Contact the seller to arrange payment and delivery.
                  </div>
                )}
                {offer.status === 'rejected' && (
                  <div className="status-banner rejected">
                    The seller declined your offer. You can make a new offer or contact them directly.
                  </div>
                )}

                {/* Product Info */}
                <div className="offer-product">
                  <h3>{offer.product.title}</h3>
                  <div className="price-comparison">
                    <div>
                      <span className="label">Asking Price:</span>
                      <span className="asking-price">${offer.product.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="label">Your Offer:</span>
                      <span className="offer-price">${offer.offer_amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="label">Savings:</span>
                      <span className="difference">
                        ${(offer.product.price - offer.offer_amount).toFixed(2)}
                        ({(((offer.product.price - offer.offer_amount) / offer.product.price) * 100).toFixed(0)}% off)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Seller Info */}
                <div className="offer-seller">
                  <div className="seller-details">
                    <div className="seller-avatar">
                      {offer.seller.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="seller-name">{offer.seller.name}</p>
                      <p className="seller-phone">📞 +231 {offer.seller.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Your Message */}
                {offer.message && (
                  <div className="offer-message">
                    <strong>Your Message:</strong>
                    <p>{offer.message}</p>
                  </div>
                )}

                {/* Offer Details */}
                <div className="offer-details">
                  <span className={`status-badge status-${offer.status}`}>
                    {offer.status === 'pending' && '⏳ Waiting for Response'}
                    {offer.status === 'accepted' && '✅ ACCEPTED'}
                    {offer.status === 'rejected' && '❌ DECLINED'}
                  </span>
                  <span className="offer-date">
                    Sent: {new Date(offer.createdAt).toLocaleDateString()}
                  </span>
                  {offer.status !== 'pending' && (
                    <span className="offer-date">
                      Updated: {new Date(offer.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="offer-actions">
                  {offer.status === 'accepted' && (
                    <>
                      <button 
                        className="btn-contact"
                        onClick={() => handleContactSeller(offer.seller.phone)}
                      >
                        📞 Contact Seller
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewProduct(offer.product.id)}
                      >
                        👁️ View Product
                      </button>
                    </>
                  )}

                  {offer.status === 'pending' && (
                    <>
                      <button 
                        className="btn-contact"
                        onClick={() => handleContactSeller(offer.seller.phone)}
                      >
                        📞 Contact Seller
                      </button>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewProduct(offer.product.id)}
                      >
                        👁️ View Product
                      </button>
                    </>
                  )}

                  {offer.status === 'rejected' && (
                    <>
                      <button 
                        className="btn-view"
                        onClick={() => handleViewProduct(offer.product.id)}
                      >
                        👁️ View Product
                      </button>
                      <button 
                        className="btn-retry"
                        onClick={() => navigate(`/products/${offer.product.id}`)}
                      >
                        🔄 Make New Offer
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📬</div>
            <h2>No {filter !== 'all' ? filter : ''} offers</h2>
            <p>
              {filter === 'pending' && 'No pending offers waiting for response'}
              {filter === 'accepted' && 'No accepted offers yet'}
              {filter === 'rejected' && 'No rejected offers'}
              {filter === 'all' && 'You haven\'t made any offers yet'}
            </p>
            <button 
              className="btn-browse"
              onClick={() => navigate('/products')}
            >
              🛍️ Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default BuyerInbox
