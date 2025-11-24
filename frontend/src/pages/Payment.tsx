import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/Payment.css'

interface Offer {
  id: string
  offer_amount: number
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

const Payment = () => {
  const [searchParams] = useSearchParams()
  const offerId = searchParams.get('offer_id')
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [offer, setOffer] = useState<Offer | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [paymentData, setPaymentData] = useState({
    payment_method: 'mtn_mobile_money',
    payment_phone: '',
    transaction_id: '',
    notes: ''
  })

  useEffect(() => {
    if (offerId) {
      fetchOffer()
    }
  }, [offerId])

  const fetchOffer = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/offers/${offerId}`)
      
      if (response.data.success) {
        setOffer(response.data.data)
        // Pre-fill phone with user's phone
        setPaymentData(prev => ({ ...prev, payment_phone: user?.phone || '' }))
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load offer')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const response = await api.post('/payments', {
        offer_id: offerId,
        ...paymentData
      })

      if (response.data.success) {
        alert('✅ Payment initiated! The seller will confirm once received.')
        navigate('/buyer/payments')
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to process payment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="payment-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem' }}>⏳</div>
          <p>Loading payment details...</p>
        </div>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="payment-container">
        <HamburgerMenu />
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Offer not found</h2>
          <button onClick={() => navigate('/buyer/inbox')}>
            Back to Offers
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="payment-container">
      <HamburgerMenu />
      
      <div className="payment-content">
        <div className="page-header">
          <h1>💳 Complete Payment</h1>
          <p className="subtitle">Choose your payment method</p>
        </div>

        {/* Order Summary */}
        <div className="order-summary">
          <h3>Order Summary</h3>
          <div className="summary-item">
            <span>Product:</span>
            <span>{offer.product.title}</span>
          </div>
          <div className="summary-item">
            <span>Seller:</span>
            <span>{offer.seller.name}</span>
          </div>
          <div className="summary-item">
            <span>Original Price:</span>
            <span className="crossed">${offer.product.price.toFixed(2)}</span>
          </div>
          <div className="summary-item total">
            <span>Agreed Price:</span>
            <span>${offer.offer_amount.toFixed(2)}</span>
          </div>
          <div className="summary-item savings">
            <span>You Save:</span>
            <span>${(offer.product.price - offer.offer_amount).toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            ⚠️ {error}
          </div>
        )}

        {/* Payment Form */}
        <form onSubmit={handleSubmit} className="payment-form">
          {/* Payment Method */}
          <div className="form-group">
            <label>Payment Method *</label>
            <div className="payment-methods">
              <label className="payment-method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="mtn_mobile_money"
                  checked={paymentData.payment_method === 'mtn_mobile_money'}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                />
                <span className="method-label">
                  <span className="method-icon">📱</span>
                  MTN Mobile Money
                </span>
              </label>

              <label className="payment-method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="orange_money"
                  checked={paymentData.payment_method === 'orange_money'}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                />
                <span className="method-label">
                  <span className="method-icon">🟠</span>
                  Orange Money
                </span>
              </label>

              <label className="payment-method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="lonestar_cell"
                  checked={paymentData.payment_method === 'lonestar_cell'}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                />
                <span className="method-label">
                  <span className="method-icon">⭐</span>
                  Lonestar Cell MTN
                </span>
              </label>

              <label className="payment-method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="cash"
                  checked={paymentData.payment_method === 'cash'}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                />
                <span className="method-label">
                  <span className="method-icon">💵</span>
                  Cash on Delivery
                </span>
              </label>

              <label className="payment-method-option">
                <input
                  type="radio"
                  name="payment_method"
                  value="bank_transfer"
                  checked={paymentData.payment_method === 'bank_transfer'}
                  onChange={(e) => setPaymentData({ ...paymentData, payment_method: e.target.value })}
                />
                <span className="method-label">
                  <span className="method-icon">🏦</span>
                  Bank Transfer
                </span>
              </label>
            </div>
          </div>

          {/* Mobile Money Phone (if mobile money selected) */}
          {['mtn_mobile_money', 'orange_money', 'lonestar_cell'].includes(paymentData.payment_method) && (
            <div className="form-group">
              <label>Mobile Money Phone Number *</label>
              <input
                type="tel"
                placeholder="e.g. 77012345"
                value={paymentData.payment_phone}
                onChange={(e) => setPaymentData({ ...paymentData, payment_phone: e.target.value })}
                required
              />
              <span className="helper-text">
                The number registered with your mobile money account
              </span>
            </div>
          )}

          {/* Transaction ID */}
          <div className="form-group">
            <label>Transaction ID / Reference (Optional)</label>
            <input
              type="text"
              placeholder="Enter transaction reference if available"
              value={paymentData.transaction_id}
              onChange={(e) => setPaymentData({ ...paymentData, transaction_id: e.target.value })}
            />
          </div>

          {/* Notes */}
          <div className="form-group">
            <label>Additional Notes (Optional)</label>
            <textarea
              placeholder="Any additional information..."
              value={paymentData.notes}
              onChange={(e) => setPaymentData({ ...paymentData, notes: e.target.value })}
              rows={3}
            />
          </div>

          {/* Instructions */}
          <div className="payment-instructions">
            <h4>📋 Payment Instructions:</h4>
            {paymentData.payment_method === 'mtn_mobile_money' && (
              <ol>
                <li>Dial *156# on your MTN phone</li>
                <li>Select "Transfer Money"</li>
                <li>Send ${offer.offer_amount.toFixed(2)} to {offer.seller.phone}</li>
                <li>Enter your PIN to confirm</li>
                <li>Copy the transaction ID and enter above</li>
              </ol>
            )}
            {paymentData.payment_method === 'orange_money' && (
              <ol>
                <li>Dial #144# on your Orange phone</li>
                <li>Select "Send Money"</li>
                <li>Send ${offer.offer_amount.toFixed(2)} to {offer.seller.phone}</li>
                <li>Enter your PIN to confirm</li>
                <li>Copy the transaction ID and enter above</li>
              </ol>
            )}
            {paymentData.payment_method === 'lonestar_cell' && (
              <ol>
                <li>Dial *500# on your Lonestar phone</li>
                <li>Select "Transfer"</li>
                <li>Send ${offer.offer_amount.toFixed(2)} to {offer.seller.phone}</li>
                <li>Enter your PIN to confirm</li>
                <li>Copy the transaction ID and enter above</li>
              </ol>
            )}
            {paymentData.payment_method === 'cash' && (
              <ol>
                <li>Arrange delivery with the seller</li>
                <li>Call: {offer.seller.phone}</li>
                <li>Pay cash on delivery</li>
                <li>Inspect product before payment</li>
              </ol>
            )}
            {paymentData.payment_method === 'bank_transfer' && (
              <ol>
                <li>Contact seller for bank details</li>
                <li>Call: {offer.seller.phone}</li>
                <li>Transfer ${offer.offer_amount.toFixed(2)} to their account</li>
                <li>Send payment proof to seller</li>
              </ol>
            )}
          </div>

          {/* Submit */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate('/buyer/inbox')}
              className="btn-cancel"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={submitting}
            >
              {submitting ? '⏳ Processing...' : '💳 Confirm Payment'}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="security-notice">
          <h4>🔒 Security Tips:</h4>
          <ul>
            <li>Never share your mobile money PIN</li>
            <li>Verify seller's phone number before sending money</li>
            <li>For cash payments, meet in a public place</li>
            <li>Inspect product before confirming payment</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Payment
