import { useState, useEffect } from 'react';
import { mobileMoneyService, MobileMoneyAccount } from '../services/mobileMoneyService';
import { designSystem } from '../styles/designSystem';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

const Wallet = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<MobileMoneyAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const toast = useToast();

  const [formData, setFormData] = useState({
    provider: 'mtn_mobile_money',
    phone_number: '',
    account_name: ''
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await mobileMoneyService.getAccounts();
      if (response.success) {
        setAccounts(response.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Failed to load wallet accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await mobileMoneyService.addAccount(formData);
      if (response.success) {
        toast.success('Account added successfully');
        setFormData({ provider: 'mtn_mobile_money', phone_number: '', account_name: '' });
        setShowAddForm(false);
        fetchAccounts();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add account');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t.wallet.confirmDelete)) return;
    try {
      await mobileMoneyService.deleteAccount(id);
      toast.success('Account removed');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to remove account');
    }
  };

  const handleSetPrimary = async (id: string) => {
    try {
      await mobileMoneyService.setPrimary(id);
      toast.success('Primary account updated');
      fetchAccounts();
    } catch (error) {
      toast.error('Failed to update primary account');
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'mtn_mobile_money': return '#FFCC00'; // MTN Yellow
      case 'orange_money': return '#FF7900'; // Orange
      case 'lonestar_money': return '#E30613'; // Lonestar Red (MTN is Lonestar usually, but keeping distinct if needed)
      default: return '#ccc';
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'mtn_mobile_money': return 'MTN Mobile Money';
      case 'orange_money': return 'Orange Money';
      case 'lonestar_money': return 'Lonestar Money';
      default: return provider;
    }
  };

  return (
    <div style={{ padding: designSystem.spacing.lg, maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: designSystem.spacing.xl }}>
        <h1 style={{ 
          fontSize: designSystem.typography.fontSize['3xl'], 
          fontWeight: designSystem.typography.fontWeight.bold,
          color: designSystem.colors.neutral[900]
        }}>
          {t.wallet.title}
        </h1>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            padding: '10px 20px',
            backgroundColor: designSystem.colors.primary[500],
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          {showAddForm ? t.common.cancel : `+ ${t.wallet.addAccount}`}
        </button>
      </div>

      {showAddForm && (
        <div style={{ 
          backgroundColor: 'white', 
          padding: designSystem.spacing.xl, 
          borderRadius: '12px', 
          boxShadow: designSystem.shadows.md,
          marginBottom: designSystem.spacing.xl,
          border: `1px solid ${designSystem.colors.neutral[200]}`
        }}>
          <h2 style={{ marginBottom: designSystem.spacing.lg }}>{t.wallet.addAccount}</h2>
          <form onSubmit={handleAddAccount}>
            <div style={{ marginBottom: designSystem.spacing.md }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t.wallet.provider}</label>
              <select 
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: `1px solid ${designSystem.colors.neutral[200]}` 
                }}
              >
                <option value="mtn_mobile_money">MTN Mobile Money (Lonestar)</option>
                <option value="orange_money">Orange Money</option>
              </select>
            </div>

            <div style={{ marginBottom: designSystem.spacing.md }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t.wallet.phoneNumber}</label>
              <input 
                type="tel" 
                placeholder="e.g. 0886123456"
                value={formData.phone_number}
                onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: `1px solid ${designSystem.colors.neutral[200]}` 
                }}
                required
              />
              {user?.phone && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, phone_number: user.phone })}
                  style={{
                    marginTop: '8px',
                    background: 'none',
                    border: 'none',
                    color: designSystem.colors.primary[600],
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    textDecoration: 'underline',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  Use my registered number ({user.phone})
                </button>
              )}
            </div>

            <div style={{ marginBottom: designSystem.spacing.lg }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>{t.wallet.accountName}</label>
              <input
                type="text"
                value={formData.account_name}
                onChange={(e) => setFormData({...formData, account_name: e.target.value})}
                placeholder="e.g. John Doe"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: `1px solid ${designSystem.colors.neutral[200]}` 
                }}
                required
              />
            </div>

            <button 
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: designSystem.colors.primary[600],
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                fontSize: '1rem',
                cursor: 'pointer'
              }}
            >
              {t.wallet.saveAccount}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>{t.common.loading}</p>
      ) : accounts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: designSystem.spacing['2xl'], color: designSystem.colors.neutral[500] }}>
          <p>{t.wallet.noAccounts}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: designSystem.spacing.md }}>
          {accounts.map(account => (
            <div key={account.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: designSystem.spacing.lg,
              backgroundColor: 'white',
              borderRadius: '12px',
              borderLeft: `6px solid ${getProviderColor(account.provider)}`,
              boxShadow: designSystem.shadows.sm
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{getProviderName(account.provider)}</h3>
                <p style={{ margin: '4px 0', color: designSystem.colors.neutral[500] }}>{account.phone_number}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: designSystem.colors.neutral[500] }}>{account.account_name}</p>
                {account.is_primary && (
                  <span style={{ 
                    display: 'inline-block', 
                    marginTop: '8px',
                    padding: '2px 8px', 
                    backgroundColor: '#dcfce7', 
                    color: '#166534', 
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold'
                  }}>
                    {t.wallet.primary}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {!account.is_primary && (
                  <button 
                    onClick={() => handleSetPrimary(account.id)}
                    style={{
                      padding: '6px 12px',
                      background: 'transparent',
                      border: `1px solid ${designSystem.colors.neutral[200]}`,
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    {t.wallet.setPrimary}
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(account.id)}
                  style={{
                    padding: '6px 12px',
                    background: '#fee2e2',
                    color: '#991b1b',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}
                >
                  {t.common.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wallet;
