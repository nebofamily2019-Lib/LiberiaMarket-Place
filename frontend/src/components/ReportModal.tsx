import { useState } from 'react';
import { designSystem } from '../styles/designSystem';
import { reportService } from '../services/reportService';
import { useToast } from '../context/ToastContext';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: string;
  userId?: string;
}

const ReportModal = ({ isOpen, onClose, productId, userId }: ReportModalProps) => {
  const [reason, setReason] = useState<string>('scam');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const toast = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitError(null);

    try {
      await reportService.createReport({
        product_id: productId,
        reported_user_id: userId,
        reason: reason as any,
        description
      });
      toast.success('Report submitted successfully');
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      const errorMessage = error.response?.data?.error || 'Failed to submit report';
      setSubmitError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
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
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: designSystem.spacing.xl,
        borderRadius: designSystem.borderRadius.lg,
        width: '90%',
        maxWidth: '500px'
      }}>
        <h2 style={{ marginBottom: designSystem.spacing.lg }}>Report {productId ? 'Item' : 'User'}</h2>
        
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
          <div style={{ marginBottom: designSystem.spacing.md }}>
            <label style={{ display: 'block', marginBottom: designSystem.spacing.xs }}>Reason</label>
            <select 
              value={reason} 
              onChange={(e) => setReason(e.target.value)}
              style={{
                width: '100%',
                padding: designSystem.spacing.sm,
                borderRadius: designSystem.borderRadius.md,
                border: `1px solid ${designSystem.colors.neutral[200]}`
              }}
            >
              <option value="scam">Scam / Fraud</option>
              <option value="harassment">Harassment</option>
              <option value="inappropriate_content">Inappropriate Content</option>
              <option value="counterfeit">Counterfeit Item</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: designSystem.spacing.lg }}>
            <label style={{ display: 'block', marginBottom: designSystem.spacing.xs }}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: designSystem.spacing.sm,
                borderRadius: designSystem.borderRadius.md,
                border: `1px solid ${designSystem.colors.neutral[200]}`
              }}
              placeholder="Please provide more details..."
            />
          </div>

          <div style={{ display: 'flex', gap: designSystem.spacing.md, justifyContent: 'flex-end' }}>
            <button 
              type="button" 
              onClick={onClose}
              style={{
                padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              style={{
                padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
                background: designSystem.colors.secondary[500],
                color: 'white',
                border: 'none',
                borderRadius: designSystem.borderRadius.md,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportModal;
