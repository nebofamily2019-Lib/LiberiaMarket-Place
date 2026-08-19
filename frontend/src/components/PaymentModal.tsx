import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { initiatePayment, getMobileMoneyAccounts } from '../services/paymentService';
import { useToast } from '../context/ToastContext';
import { formatPriceWithCurrency } from '../utils/currency';
import '../styles/PaymentModal.css';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: any;
  onSuccess: () => void;
}

const PaymentModal = ({ isOpen, onClose, offer, onSuccess }: PaymentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [mobileAccounts, setMobileAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      fetchMobileAccounts();
    }
  }, [isOpen]);

  const fetchMobileAccounts = async () => {
    try {
      const accounts = await getMobileMoneyAccounts();
      setMobileAccounts(accounts);
    } catch (error) {
      console.error('Error fetching mobile accounts:', error);
    }
  };

  const handlePayment = async () => {
    setSubmitError(null);
    if (!paymentMethod) {
      const msg = 'Please select a payment method';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    if (['orange_money', 'mtn_mobile_money', 'lonestar_money'].includes(paymentMethod) && !selectedAccountId) {
      const msg = 'Please select a mobile money account';
      setSubmitError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      await initiatePayment({
        offer_id: offer.id,
        payment_method: paymentMethod,
        mobile_money_account_id: selectedAccountId || undefined,
        currency: offer.currency
      });

      toast.success('Payment initiated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Payment error:', error);
      const errorMessage = error.response?.data?.message || 'Payment failed';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content payment-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💸 Make Payment</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
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

          <div className="payment-summary">
            <h3>Order Summary</h3>
            <div className="summary-row">
              <span>Product:</span>
              <strong>{offer.product?.title}</strong>
            </div>
            <div className="summary-row">
              <span>Amount:</span>
              <div style={{ textAlign: 'right' }}>
                <strong style={{ display: 'block' }}>{formatPriceWithCurrency(offer.offer_amount, offer.currency).primary}</strong>
                <span style={{ fontSize: '0.9em', color: '#666' }}>{formatPriceWithCurrency(offer.offer_amount, offer.currency).secondary}</span>
              </div>
            </div>
          </div>

          <div className="payment-methods">
            <h3>Select Payment Method</h3>
            
            <div className="method-options">
              <label className={`method-card ${paymentMethod === 'orange_money' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="orange_money"
                  checked={paymentMethod === 'orange_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">🟠</span>
                <span>Orange Money</span>
              </label>

              <label className={`method-card ${paymentMethod === 'mtn_mobile_money' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="mtn_mobile_money"
                  checked={paymentMethod === 'mtn_mobile_money'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">🟡</span>
                <span>MTN Mobile Money</span>
              </label>

              <label className={`method-card ${paymentMethod === 'cash' ? 'active' : ''}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <span className="method-icon">💵</span>
                <span>Cash on Delivery</span>
              </label>
            </div>
          </div>

          {['orange_money', 'mtn_mobile_money'].includes(paymentMethod) && (
            <div className="account-selection">
              <h4>Select Account</h4>
              {mobileAccounts.length > 0 ? (
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  className="account-select"
                >
                  <option value="">-- Select Account --</option>
                  {mobileAccounts
                    .filter(acc => acc.provider === paymentMethod)
                    .map(acc => (
                      <option key={acc.id} value={acc.id}>
                        {acc.account_name} ({acc.phone_number})
                      </option>
                    ))}
                </select>
              ) : (
                <div className="no-accounts">
                  <p>No linked accounts found.</p>
                  <button 
                    onClick={() => navigate('/wallet')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#3b82f6',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      padding: 0,
                      marginTop: '0.5rem'
                    }}
                  >
                    Go to Wallet to add one
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            className="btn-pay"
            onClick={handlePayment}
            disabled={loading}
          >
            {loading ? 'Processing...' : `Pay ${formatPriceWithCurrency(offer.offer_amount, offer.currency).primary}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
