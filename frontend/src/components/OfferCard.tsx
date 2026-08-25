import { useState } from 'react';
import { Package } from 'lucide-react';
import { designSystem } from '../styles/designSystem';
import {
  Offer,
  acceptOffer,
  rejectOffer,
  counterOffer,
  setDeliveryMethod,
  sellerConfirmDelivery,
  buyerConfirmReceipt,
  getOfferStatusColor,
  getOfferStatusText
} from '../services/offerService';
import { useToast } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { formatPriceWithCurrency, lrdToUsd, usdToLrd } from '../utils/currency';
import { getImageUrl } from '../utils/imageUtils';
import ConfirmationModal from './ConfirmationModal';
import '../styles/OfferCard.css';

interface OfferCardProps {
  offer: Offer;
  viewType: 'buyer' | 'seller';
  onOfferUpdated?: () => void;
}

const OfferCard = ({ offer, viewType, onOfferUpdated }: OfferCardProps) => {
  const [loading, setLoading] = useState(false);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [deliveryActionLoading, setDeliveryActionLoading] = useState(false);
  const [counterAmount, setCounterAmount] = useState<string>('');
  const [counterCurrency, setCounterCurrency] = useState<'LRD' | 'USD'>('LRD');
  const [counterMessage, setCounterMessage] = useState<string>('');
  
  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    type: 'danger' | 'warning' | 'info' | 'success';
    action: () => Promise<void>;
    confirmText: string;
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    action: async () => {},
    confirmText: 'Confirm'
  });

  const toast = useToast();
  const navigate = useNavigate();

  const isBuyer = viewType === 'buyer';
  const isSeller = viewType === 'seller';

  // Determine what actions are available
  const canAccept = (isSeller && offer.status === 'pending') || (isBuyer && offer.status === 'countered');
  const canReject = (isSeller && offer.status === 'pending') || (isBuyer && offer.status === 'countered');
  const canCounter = isSeller && offer.status === 'pending';

  const closeConfirmModal = () => {
    setConfirmModal(prev => ({ ...prev, isOpen: false }));
  };

  const executeConfirmAction = async () => {
    try {
      setLoading(true);
      await confirmModal.action();
      closeConfirmModal();
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptClick = () => {
    const acceptAmount = offer.status === 'countered' ? offer.counter_amount : offer.offer_amount;
    const currency = offer.status === 'countered' ? (offer.counter_currency || 'USD') : (offer.currency || 'USD');
    const priceDisplay = formatPriceWithCurrency(acceptAmount || 0, currency);
    
    setConfirmModal({
      isOpen: true,
      title: 'Accept Offer?',
      message: (
        <div>
          <p>You are about to accept this offer for:</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0', color: designSystem.colors.accent.green }}>
            {priceDisplay.primary}
            <span style={{ fontSize: '1rem', color: designSystem.colors.neutral[500], marginLeft: '0.5rem' }}>
              ({priceDisplay.secondary})
            </span>
          </div>
          <p>This action cannot be undone. The product will be reserved for this buyer until you both confirm the handover.</p>
        </div>
      ),
      type: 'success',
      confirmText: 'Yes, Accept Offer',
      action: async () => {
        try {
          await acceptOffer(offer.id);
          toast.success('Offer accepted successfully!');
          if (onOfferUpdated) {
            onOfferUpdated();
          }
        } catch (error: any) {
          console.error('Error accepting offer:', error);
          toast.error(error.response?.data?.error || 'Failed to accept offer');
          throw error;
        }
      }
    });
  };

  const handleRejectClick = () => {
    const rejectAmount = offer.status === 'countered' ? offer.counter_amount : offer.offer_amount;
    const currency = offer.status === 'countered' ? (offer.counter_currency || 'USD') : (offer.currency || 'USD');
    const priceDisplay = formatPriceWithCurrency(rejectAmount || 0, currency);

    setConfirmModal({
      isOpen: true,
      title: 'Reject Offer?',
      message: (
        <div>
          <p>You are about to reject this offer of:</p>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '1rem 0', color: '#ef4444' }}>
            {priceDisplay.primary}
            <span style={{ fontSize: '1rem', color: '#6b7280', marginLeft: '0.5rem' }}>
              ({priceDisplay.secondary})
            </span>
          </div>
          <p>The buyer will be notified. If the price is close, consider making a <strong>Counter Offer</strong> instead!</p>
        </div>
      ),
      type: 'danger',
      confirmText: 'Yes, Reject Offer',
      action: async () => {
        try {
          await rejectOffer(offer.id);
          toast.success('Offer rejected');
          if (onOfferUpdated) {
            onOfferUpdated();
          }
        } catch (error: any) {
          console.error('Error rejecting offer:', error);
          toast.error(error.response?.data?.error || 'Failed to reject offer');
          throw error;
        }
      }
    });
  };

  const handleCounterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const entered = parseFloat(counterAmount);
    if (isNaN(entered) || entered <= 0) {
      toast.error('Please enter a valid counter amount');
      return;
    }

    // Always store as USD — convert LRD → USD when needed
    const usdAmount = counterCurrency === 'LRD' ? lrdToUsd(entered) : entered;

    try {
      setLoading(true);
      await counterOffer(offer.id, {
        counter_amount: usdAmount,
        counter_currency: 'USD',
        counter_message: counterMessage.trim() || undefined
      });
      toast.success('Counter-offer sent successfully!');
      setShowCounterForm(false);
      setCounterAmount('');
      setCounterCurrency('LRD');
      setCounterMessage('');
      if (onOfferUpdated) {
        onOfferUpdated();
      }
    } catch (error: any) {
      console.error('Error countering offer:', error);
      toast.error(error.response?.data?.error || 'Failed to send counter-offer');
    } finally {
      setLoading(false);
    }
  };

  const handleChooseDeliveryMethod = async (method: 'delivery' | 'pickup') => {
    try {
      setDeliveryActionLoading(true);
      await setDeliveryMethod(offer.id, method);
      toast.success(method === 'pickup' ? 'Pickup selected' : 'Delivery selected');
      if (onOfferUpdated) onOfferUpdated();
    } catch (error: any) {
      console.error('Error setting delivery method:', error);
      toast.error(error.response?.data?.error || 'Failed to set delivery method');
    } finally {
      setDeliveryActionLoading(false);
    }
  };

  const handleSellerConfirmDelivery = async () => {
    try {
      setDeliveryActionLoading(true);
      const result = await sellerConfirmDelivery(offer.id);
      toast.success(result.completed ? 'Sale completed! Product marked as sold.' : 'Handover confirmed.');
      if (onOfferUpdated) onOfferUpdated();
    } catch (error: any) {
      console.error('Error confirming delivery:', error);
      toast.error(error.response?.data?.error || 'Failed to confirm delivery');
    } finally {
      setDeliveryActionLoading(false);
    }
  };

  const handleBuyerConfirmReceipt = async () => {
    try {
      setDeliveryActionLoading(true);
      const result = await buyerConfirmReceipt(offer.id);
      toast.success(result.completed ? 'Sale completed! Thanks for confirming.' : 'Receipt confirmed.');
      if (onOfferUpdated) onOfferUpdated();
    } catch (error: any) {
      console.error('Error confirming receipt:', error);
      toast.error(error.response?.data?.error || 'Failed to confirm receipt');
    } finally {
      setDeliveryActionLoading(false);
    }
  };

  const viewProduct = () => {
    if (offer.product) {
      navigate(`/products/${offer.product.id}`);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="offer-card">
      {/* Status Badge */}
      <div
        className="offer-status-badge"
        style={{ background: getOfferStatusColor(offer.status) }}
      >
        {getOfferStatusText(offer.status)}
      </div>

      {/* Product Info */}
      {offer.product && (
        <div className="offer-product-info" onClick={viewProduct}>
          {offer.product.images && offer.product.images[0] && !imgError ? (
            <img
              src={getImageUrl(offer.product.images[0])}
              alt={offer.product.title}
              className="offer-product-image"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="offer-product-image offer-product-image-fallback">
              <Package size={28} color={designSystem.colors.neutral[400]} />
            </div>
          )}
          <div className="offer-product-details">
            <h3>{offer.product.title}</h3>
            <p className="product-price">
              Asking Price: {formatPriceWithCurrency(offer.product.price).primary}
              <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                ({formatPriceWithCurrency(offer.product.price).secondary})
              </span>
            </p>
          </div>
        </div>
      )}

      {/* Offer Details */}
      <div className="offer-details">
        <div className="offer-amounts">
          <div className="amount-item">
            <span className="amount-label">
              {isBuyer ? 'Your Offer' : 'Buyer\'s Offer'}
            </span>
            <div className="amount-value">
              <span className="amount-primary">{formatPriceWithCurrency(offer.offer_amount, offer.currency).primary}</span>
              <span className="amount-secondary">{formatPriceWithCurrency(offer.offer_amount, offer.currency).secondary}</span>
            </div>
          </div>

          {offer.status === 'countered' && offer.counter_amount && (
            <div className="amount-item counter-amount">
              <span className="amount-label">
                {isSeller ? 'Your Counter' : 'Seller\'s Counter'}
              </span>
              <div className="amount-value">
                <span className="amount-primary">{formatPriceWithCurrency(offer.counter_amount, offer.counter_currency).primary}</span>
                <span className="amount-secondary">{formatPriceWithCurrency(offer.counter_amount, offer.counter_currency).secondary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        {offer.message && (
          <div className="offer-message">
            <strong>{isBuyer ? 'Your' : 'Buyer\'s'} Message:</strong>
            <p>{offer.message}</p>
          </div>
        )}

        {offer.counter_message && offer.status === 'countered' && (
          <div className="offer-message counter-message">
            <strong>{isSeller ? 'Your' : 'Seller\'s'} Counter Message:</strong>
            <p>{offer.counter_message}</p>
          </div>
        )}

        {/* Contact Info */}
        <div className="offer-contact">
          {isBuyer && offer.seller && (
            <p>
              <strong>Seller:</strong> {offer.seller.name} - {offer.seller.phone}
            </p>
          )}
          {isSeller && offer.buyer && (
            <p>
              <strong>Buyer:</strong> {offer.buyer.name} - {offer.buyer.phone}
            </p>
          )}
        </div>

        <p className="offer-date">
          <strong>Submitted:</strong> {formatDate(offer.createdAt)}
        </p>
      </div>

      {/* Counter Form */}
      {showCounterForm && (
        <form className="counter-form" onSubmit={handleCounterSubmit} style={{
          backgroundColor: '#eff6ff',
          padding: '1.5rem',
          borderRadius: '12px',
          border: '1px solid #bfdbfe',
          marginTop: '1rem'
        }}>
          <h4 style={{ 
            marginTop: 0, 
            color: '#1e40af', 
            fontSize: '1.1rem', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem' 
          }}>
            🔄 Propose a New Price
          </h4>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>
            Suggest a price that works better for you. The buyer can then accept or decline.
          </p>
          <div className="form-group">
            {/* Currency toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <label htmlFor={`counter-${offer.id}`} style={{ margin: 0 }}>
                Counter Amount
              </label>
              <div style={{ display: 'flex', gap: '0.25rem' }}>
                {(['LRD', 'USD'] as const).map(cur => (
                  <button
                    key={cur}
                    type="button"
                    onClick={() => { setCounterCurrency(cur); setCounterAmount(''); }}
                    disabled={loading}
                    style={{
                      padding: '0.2rem 0.65rem',
                      borderRadius: '20px',
                      border: '2px solid',
                      borderColor: counterCurrency === cur ? '#1e40af' : '#d1d5db',
                      background: counterCurrency === cur ? '#1e40af' : '#fff',
                      color: counterCurrency === cur ? '#fff' : '#6b7280',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            <input
              type="number"
              id={`counter-${offer.id}`}
              value={counterAmount}
              onChange={(e) => setCounterAmount(e.target.value)}
              placeholder={counterCurrency === 'LRD' ? 'Enter amount in LRD (L$)' : 'Enter amount in USD ($)'}
              step={counterCurrency === 'LRD' ? '1' : '0.01'}
              min={counterCurrency === 'LRD' ? '1' : '0.01'}
              required
              disabled={loading}
            />

            {/* Live conversion preview */}
            {counterAmount && parseFloat(counterAmount) > 0 && (
              <p style={{ fontSize: '0.82rem', color: '#6b7280', marginTop: '0.3rem' }}>
                {counterCurrency === 'LRD'
                  ? `≈ $${lrdToUsd(parseFloat(counterAmount)).toFixed(2)} USD`
                  : `≈ L$${usdToLrd(parseFloat(counterAmount)).toLocaleString()} LRD`
                }
              </p>
            )}
          </div>
          <div className="form-group">
            <label htmlFor={`counter-msg-${offer.id}`}>Message (Optional)</label>
            <textarea
              id={`counter-msg-${offer.id}`}
              value={counterMessage}
              onChange={(e) => setCounterMessage(e.target.value)}
              placeholder="Explain your counter-offer"
              rows={2}
              maxLength={500}
              disabled={loading}
            />
          </div>
          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => { setShowCounterForm(false); setCounterAmount(''); setCounterCurrency('LRD'); setCounterMessage(''); }}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Counter'}
            </button>
          </div>
        </form>
      )}

      {/* Delivery & Payment-on-Delivery flow for Accepted Offers */}
      {offer.status === 'accepted' && (
        <div className="payment-reminder" style={{
          marginTop: '1rem',
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          color: '#166534'
        }}>
          <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Offer Accepted!
          </h4>
          <p style={{ margin: 0, fontSize: '0.95rem' }}>
            Payment happens on delivery — cash or an electronic transfer arranged directly between you two. Contact each other to sort it out.
          </p>
          {isBuyer && offer.seller && (
            <div style={{ marginTop: '0.75rem', fontWeight: 'bold' }}>
              Call Seller: <a href={`tel:${offer.seller.phone}`} style={{ color: '#166534', textDecoration: 'underline' }}>{offer.seller.phone}</a>
            </div>
          )}
          {isSeller && offer.buyer && (
            <div style={{ marginTop: '0.75rem', fontWeight: 'bold' }}>
              Call Buyer: <a href={`tel:${offer.buyer.phone}`} style={{ color: '#166534', textDecoration: 'underline' }}>{offer.buyer.phone}</a>
            </div>
          )}

          {/* Step 1: seller picks delivery method */}
          {!offer.delivery_method && (
            isSeller ? (
              <div style={{ marginTop: '1rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>How will the buyer get the item?</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => handleChooseDeliveryMethod('pickup')}
                    disabled={deliveryActionLoading}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #166534', background: '#fff', color: '#166534', fontWeight: 600, cursor: 'pointer' }}
                  >
                    🤝 Buyer Picks Up
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChooseDeliveryMethod('delivery')}
                    disabled={deliveryActionLoading}
                    style={{ flex: 1, padding: '0.6rem', borderRadius: '8px', border: '1px solid #166534', background: '#fff', color: '#166534', fontWeight: 600, cursor: 'pointer' }}
                  >
                    📦 I'll Deliver It
                  </button>
                </div>
              </div>
            ) : (
              <p style={{ marginTop: '0.75rem', fontStyle: 'italic' }}>Waiting for the seller to choose pickup or delivery.</p>
            )
          )}

          {/* Step 2: confirm handover */}
          {offer.delivery_method && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: 600 }}>
                Method: {offer.delivery_method === 'pickup' ? '🤝 Buyer will pick up' : '📦 Seller will deliver'}
              </p>

              {isSeller && (
                offer.seller_confirmed
                  ? <p style={{ margin: 0 }}>✅ You confirmed the handover. Waiting for the buyer to confirm they received it.</p>
                  : (
                    <button
                      type="button"
                      onClick={handleSellerConfirmDelivery}
                      disabled={deliveryActionLoading}
                      style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: '#166534', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✅ I've Handed Over the Item
                    </button>
                  )
              )}

              {isBuyer && (
                offer.buyer_confirmed
                  ? <p style={{ margin: 0 }}>✅ You confirmed receipt. Waiting for the seller to confirm the handover.</p>
                  : (
                    <button
                      type="button"
                      onClick={handleBuyerConfirmReceipt}
                      disabled={deliveryActionLoading}
                      style={{ padding: '0.6rem 1rem', borderRadius: '8px', border: 'none', background: '#166534', color: '#fff', fontWeight: 600, cursor: 'pointer' }}
                    >
                      ✅ I've Received the Item
                    </button>
                  )
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {(canAccept || canReject || canCounter) && (
        <div className="offer-actions">
          {canAccept && (
            <button
              className="btn-accept"
              onClick={handleAcceptClick}
              disabled={loading}
            >
              Accept {formatPriceWithCurrency(
                offer.status === 'countered' ? (offer.counter_amount || 0) : offer.offer_amount,
                offer.status === 'countered' ? (offer.counter_currency || 'USD') : (offer.currency || 'USD')
              ).primary}
            </button>
          )}

          {canCounter && !showCounterForm && (
            <button
              className="btn-counter"
              onClick={() => setShowCounterForm(true)}
              disabled={loading}
            >
              🔄 Make Counter Offer
            </button>
          )}

          {canReject && (
            <button
              className="btn-reject"
              onClick={handleRejectClick}
              disabled={loading}
            >
              ✕ Reject
            </button>
          )}
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={executeConfirmAction}
        onCancel={closeConfirmModal}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
        loading={loading}
      />
    </div>
  );
};

export default OfferCard;
