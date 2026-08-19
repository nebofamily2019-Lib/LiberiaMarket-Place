import { useState } from 'react';
import { createOffer } from '../services/offerService';
import { useToast } from '../context/ToastContext';
import { lrdToUsd, usdToLrd, formatPriceWithCurrency } from '../utils/currency';
import '../styles/MakeOfferModal.css';

interface MakeOfferModalProps {
  productId: string;
  productTitle: string;
  productPrice: number; // This is the Asking Price
  productCurrency?: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const MakeOfferModal = ({ productId, productTitle, productPrice, productCurrency, onClose, onSuccess }: MakeOfferModalProps) => {
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [currency, setCurrency] = useState<'USD' | 'LRD'>('USD');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toast = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setOfferAmount(value);
    setSubmitError(null); // Clear error on input change

    // Auto-detect currency from text
    const upperValue = value.toUpperCase();
    if (upperValue.includes('L$') || upperValue.includes('LRD') || upperValue.includes('LD')) {
      setCurrency('LRD');
    } else if (upperValue.includes('US') || upperValue.includes('USD') || (upperValue.includes('$') && !upperValue.includes('L$'))) {
      setCurrency('USD');
    }
  };

  const getNumericAmount = (val: string): number => {
    return parseFloat(val.replace(/[^0-9.]/g, '')) || 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amount = getNumericAmount(offerAmount);

    // Validation
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid offer amount');
      return;
    }

    try {
      setLoading(true);
      
      // Convert to USD for backend consistency
      const finalAmount = currency === 'USD' ? amount : lrdToUsd(amount);

      await createOffer({
        product_id: productId,
        offer_amount: finalAmount,
        currency: currency,
        message: message
      });
      
      toast.success('Offer sent successfully!');
      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error: any) {
      console.error('Error sending offer:', error);
      const errorMessage = error.response?.data?.error || 'Failed to send offer. Please try again.';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal-content make-offer-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>🤝 Make an Offer</h2>
          <button className='modal-close-btn' onClick={onClose}>×</button>
        </div>

        <div className='modal-body'>
          <div className='product-info-summary'>
            <h3>{productTitle}</h3>
            <p className='asking-price'>
              Asking Price: <strong>{formatPriceWithCurrency(productPrice, productCurrency).primary} <span style={{ fontSize: '0.9em', color: '#666', fontWeight: 'normal' }}>{formatPriceWithCurrency(productPrice, productCurrency).secondary}</span></strong>
            </p>
          </div>

          {submitError && (
            <div style={{ 
              padding: '12px', 
              marginBottom: '16px', 
              backgroundColor: '#fee2e2', 
              border: '1px solid #ef4444', 
              borderRadius: '8px', 
              color: '#b91c1c',
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>⚠️</span>
              <span>{submitError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className='form-group'>
              <label htmlFor='offerAmount'>Your Offer Amount *</label>
              <div className='currency-input-group' style={{ position: 'relative', display: 'block' }}>
                <input
                  type='text'
                  id='offerAmount'
                  value={offerAmount}
                  onChange={handleInputChange}
                  placeholder='e.g., $50 or 500 LRD'
                  required
                  disabled={loading}
                  className='amount-input'
                  style={{ width: '100%', paddingRight: '80px' }}
                />
                <span style={{ 
                  position: 'absolute', 
                  right: '10px', 
                  top: '50%', 
                  transform: 'translateY(-50%)',
                  fontSize: '0.8em',
                  color: '#666',
                  background: '#f0f0f0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  pointerEvents: 'none'
                }}>
                  {currency}
                </span>
              </div>
              <small style={{ display: 'block', marginTop: '5px', color: '#666' }}>
                Type amount (e.g. "50 USD", "L$500"). We'll detect the currency.
              </small>
              
              {offerAmount && getNumericAmount(offerAmount) > 0 && (
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginTop: '0.25rem' }}>
                  ≈ {currency === 'USD' 
                      ? `L$${usdToLrd(getNumericAmount(offerAmount)).toLocaleString()} LRD` 
                      : `$${lrdToUsd(getNumericAmount(offerAmount)).toFixed(2)} USD`}
                </p>
              )}
            </div>

            <div className='form-group' style={{ marginTop: '1rem' }}>
              <label htmlFor='message' style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message (Optional)</label>
              <textarea
                id='message'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder='Add a note to the seller...'
                rows={3}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>

            <div className='offer-tips'>
              <h4>💡 Offer Tips:</h4>
              <ul>
                <li>Offers expire in 24 hours.</li>
                <li>The seller can accept, reject, or counter your offer.</li>
                <li>Only one active offer allowed per item.</li>
              </ul>
            </div>

            <div className='modal-actions'>
              <button
                type='button'
                className='btn-secondary'
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type='submit'
                className='btn-primary'
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Offer'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MakeOfferModal;
