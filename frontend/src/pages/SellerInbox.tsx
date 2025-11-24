import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/SellerInbox.css'

interface Offer {
  id: string
  offer_amount: number
  message: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: string
  product: {
    id: string
    title: string
    price: number
  }
  buyer: {
    id: string
    name: string
    phone: string
  }
}

const SellerInbox = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all')

  useEffect(() => {
    fetchOffers()
  }, [])

  const fetchOffers = async () => {
    try {
      setLoading(true)
      console.log('📥 Fetching received offers...')
      
      const response = await api.get('/offers/received')
      
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

  const handleAcceptOffer = async (offerId: string) => {
    if (!window.confirm('Accept this offer? The buyer will be notified.')) {
      return
    }

    try {
      const response = await api.patch(`/offers/${offerId}/accept`)
      
      if (response.data.success) {
        alert('✅ Offer accepted! Contact the buyer to arrange payment and delivery.')
        fetchOffers()
      }
    } catch (err: any) {
      console.error('❌ Error accepting offer:', err)
      alert(err.response?.data?.error || 'Failed to accept offer')
    }
  }

  const handleRejectOffer = async (offerId: string) => {
    if (!window.confirm('Reject this offer?')) {
      return
    }

    try {
      const response = await api.patch(`/offers/${offerId}/reject`)
      
      if (response.data.success) {
        alert('Offer rejected')
        fetchOffers()
      }
    } catch (err: any) {
      console.error('❌ Error rejecting offer:', err)
      alert(err.response?.data?.error || 'Failed to reject offer')
    }
  }

  const handleContactBuyer = (phone: string) => {
    window.location.href = `tel:+231${phone}`
  }

  const filteredOffers = offers.filter(offer => {
    if (filter === 'all') return true
    return offer.status === filter
  })

  if (loading) {
    return (
      <div className="seller-inbox-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading offers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="seller-inbox-container">
      <HamburgerMenu />
      
      <div className="seller-inbox-content">
        <div className="page-header">
          <h1>💰 My Offers</h1>
          <p className="subtitle">{offers.length} total offer{offers.length !== 1 ? 's' : ''}</p>
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
            Pending ({offers.filter(o => o.status === 'pending').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'accepted' ? 'active' : ''}`}
            onClick={() => setFilter('accepted')}
          >
            Accepted ({offers.filter(o => o.status === 'accepted').length})
          </button>
          <button 
            className={`filter-tab ${filter === 'rejected' ? 'active' : ''}`}
            onClick={() => setFilter('rejected')}
          >
            Rejected ({offers.filter(o => o.status === 'rejected').length})
          </button>
        </div>

        {filteredOffers.length > 0 ? (
          <div className="offers-list">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className={`offer-card status-${offer.status}`}>
                {/* Product Info */}
                <div className="offer-product">
                  <h3>{offer.product.title}</h3>
                  <div className="price-comparison">
                    <div>
                      <span className="label">Asking Price:</span>
                      <span className="asking-price">${offer.product.price.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="label">Offer:</span>
                      <span className="offer-price">${offer.offer_amount.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="label">Difference:</span>
                      <span className="difference">
                        -${(offer.product.price - offer.offer_amount).toFixed(2)}
                        ({(((offer.product.price - offer.offer_amount) / offer.product.price) * 100).toFixed(0)}% off)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Buyer Info */}
                <div className="offer-buyer">
                  <div className="buyer-details">
                    <div className="buyer-avatar">
                      {offer.buyer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="buyer-name">{offer.buyer.name}</p>
                      <p className="buyer-phone">📞 +231 {offer.buyer.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Offer Message */}
                {offer.message && (
                  <div className="offer-message">
                    <strong>Message:</strong>
                    <p>{offer.message}</p>
                  </div>
                )}

                {/* Offer Details */}
                <div className="offer-details">
                  <span className={`status-badge status-${offer.status}`}>
                    {offer.status.toUpperCase()}
                  </span>
                  <span className="offer-date">
                    {new Date(offer.createdAt).toLocaleString()}
                  </span>
                </div>

                {/* Actions */}
                {offer.status === 'pending' && (
                  <div className="offer-actions">
                    <button 
                      className="btn-accept"
                      onClick={() => handleAcceptOffer(offer.id)}
                    >
                      ✅ Accept Offer
                    </button>
                    <button 
                      className="btn-reject"
                      onClick={() => handleRejectOffer(offer.id)}
                    >
                      ❌ Reject
                    </button>
                    <button 
                      className="btn-contact"
                      onClick={() => handleContactBuyer(offer.buyer.phone)}
                    >
                      📞 Call Buyer
                    </button>
                  </div>
                )}

                {offer.status === 'accepted' && (
                  <div className="offer-actions">
                    <button 
                      className="btn-contact"
                      onClick={() => handleContactBuyer(offer.buyer.phone)}
                    >
                      📞 Contact Buyer
                    </button>
                    <button 
                      className="btn-view"
                      onClick={() => navigate(`/products/${offer.product.id}`)}
                    >
                      👁️ View Product
                    </button>
                  </div>
                )}

                {offer.status === 'rejected' && (
                  <div className="rejected-info">
                    <p>You rejected this offer</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💰</div>
            <h2>No {filter !== 'all' ? filter : ''} offers</h2>
            <p>
              {filter === 'pending' && 'You have no pending offers'}
              {filter === 'accepted' && 'You haven\'t accepted any offers yet'}
              {filter === 'rejected' && 'No rejected offers'}
              {filter === 'all' && 'You haven\'t received any offers yet'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default SellerInbox
