import { useState } from 'react';
import { designSystem } from '../styles/designSystem';
// import { useLanguage } from '../context/LanguageContext';

interface MarkAsSoldModalProps {
  product: any;
  onClose: () => void;
  onConfirm: (data: { soldPrice: number; paymentMethod: string; buyerId?: string }) => void;
}

const MarkAsSoldModal = ({ product, onClose, onConfirm }: MarkAsSoldModalProps) => {
  const [soldPrice, setSoldPrice] = useState(product.price);
  const [paymentMethod, setPaymentMethod] = useState('cash');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({ soldPrice, paymentMethod });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: designSystem.spacing.xl,
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        boxShadow: designSystem.shadows.lg
      }}>
        <h2 style={{ marginBottom: designSystem.spacing.lg, fontSize: '1.25rem', fontWeight: 'bold' }}>
          Mark "{product.title}" as Sold
        </h2>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Sold Price (USD)
            </label>
            <input
              type="number"
              value={soldPrice}
              onChange={(e) => setSoldPrice(parseFloat(e.target.value))}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${designSystem.colors.neutral[300]}`
              }}
              required
            />
          </div>

          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: `1px solid ${designSystem.colors.neutral[300]}`
              }}
            >
              <option value="cash">Cash (In Person)</option>
              <option value="mobile_money">Mobile Money</option>
              <option value="other">Other</option>
            </select>
          </div>

          {paymentMethod === 'cash' && (
            <div style={{ 
              padding: '10px', 
              backgroundColor: '#fff7ed', 
              border: '1px solid #fdba74', 
              borderRadius: '8px',
              marginBottom: designSystem.spacing.lg,
              fontSize: '0.9rem',
              color: '#9a3412'
            }}>
              ⚠️ <strong>Safety Check:</strong> Ensure you have received the cash and counted it before confirming.
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: designSystem.spacing.lg }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: designSystem.colors.neutral[200],
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#166534',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Confirm Sold
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MarkAsSoldModal;
