import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { formatPriceWithCurrency } from '../utils/currency';
import { getReceivedOffers, Offer } from '../services/offerService';
import OfferCard from '../components/OfferCard';
import { getImageUrl } from '../utils/imageUtils';
import {
  AlertTriangle,
  DollarSign,
  Package,
  Tag,
  Lightbulb,
  Check,
  X,
  Clock,
  TrendingUp,
  Handshake,
  Smartphone,
  Gift,
  Store,
  Megaphone,
  HelpCircle,
} from 'lucide-react';
import '../styles/SellerDashboard.css';

const GroupImage = ({ images, title, size = 56 }: { images?: string[] | null; title?: string; size?: number }) => {
  const [err, setErr] = useState(false);
  const src = images?.[0] ? getImageUrl(images[0]) : undefined;
  const style: React.CSSProperties = {
    width: size,
    height: size,
    borderRadius: 8,
    objectFit: 'cover',
    objectPosition: 'center',
    border: '1px solid var(--color-border)',
    flexShrink: 0,
    display: 'block',
  };
  if (!src || err) {
    return (
      <div style={{ ...style, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-surface-alt, #f3f4f6)' }}>
        <Package size={Math.round(size * 0.4)} color="var(--color-text-muted)" />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={title || 'Product'}
      style={style}
      onError={() => setErr(true)}
    />
  );
};

const SellerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [statsError, setStatsError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('insights');
  const [offers, setOffers] = useState<Offer[]>([]);
  const [offerTab, setOfferTab] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  const [expiringProducts, setExpiringProducts] = useState<any[]>([]);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        await Promise.all([
          fetchStats(),
          fetchOffers(),
          user?.id ? fetchExpiringProducts() : Promise.resolve(),
        ]);
      } catch (error) {
        console.error('SellerDashboard: Error loading data:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    const timer = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id]);

  const fetchStats = async () => {
    try {
      setStatsError(null);
      const response = await api.get('/products/stats/seller');
      if (response.data.success) setStats(response.data.data);
    } catch (error: any) {
      console.error('Error fetching seller stats:', error);
      setStatsError(error?.message || 'Failed to load financial data');
    }
  };

  const fetchOffers = async () => {
    try {
      const data = await getReceivedOffers();
      setOffers(data);
    } catch (error) {
      console.error('Error fetching offers:', error);
    }
  };

  const fetchExpiringProducts = async () => {
    try {
      const response = await api.get(`/products/user/${user?.id}`);
      if (response.data.success) {
        const now = new Date();
        const fiveDaysFromNow = new Date();
        fiveDaysFromNow.setDate(now.getDate() + 5);
        const expiring = response.data.data.filter((p: any) => {
          if (!p.expiresAt) return false;
          const d = new Date(p.expiresAt);
          return d > now && d <= fiveDaysFromNow;
        });
        setExpiringProducts(expiring);
      }
    } catch (error) {
      console.error('Error fetching expiring products:', error);
    }
  };

  const handleRenew = async (productId: string) => {
    try {
      const response = await api.post(`/products/${productId}/renew`);
      if (response.data.success) {
        alert('Product renewed successfully!');
        fetchExpiringProducts();
        fetchStats();
      }
    } catch (error) {
      console.error('Error renewing product:', error);
      alert('Failed to renew product.');
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (offerTab === 'all') return true;
    if (offerTab === 'rejected') return offer.status === 'rejected' || offer.status === 'expired';
    return offer.status === offerTab;
  });

  if (loading) {
    return (
      <div className="seller-dash-loading">
        <div className="page-spinner" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  const renderInsights = () => (
    <>
      {statsError && (
        <div className="seller-alert-banner" style={{ background: '#fef2f2', borderColor: '#fca5a5' }}>
          <h3 style={{ color: '#dc2626' }}>
            <AlertTriangle size={18} />
            Could not load stats: {statsError}
          </h3>
          <button className="btn-renew" onClick={fetchStats} style={{ marginTop: '0.5rem' }}>
            Retry
          </button>
        </div>
      )}

      {expiringProducts.length > 0 && (
        <div className="seller-alert-banner">
          <h3>
            <AlertTriangle size={18} />
            Action Needed: {expiringProducts.length} Listing(s) Expiring Soon
          </h3>
          <div className="seller-alert-items">
            {expiringProducts.map(p => (
              <div key={p.id} className="seller-alert-item">
                <span>
                  {p.title} (Expires: {new Date(p.expiresAt).toLocaleDateString()})
                </span>
                <button className="btn-renew" onClick={() => handleRenew(p.id)}>
                  Renew Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="seller-stats-grid">
        <div className="seller-stat-card">
          <div className="seller-stat-label">
            <DollarSign size={16} />
            Money Made
          </div>
          <div className="seller-stat-value">
            {formatPriceWithCurrency(stats?.netRevenue ?? stats?.totalRevenue ?? 0).primary}
          </div>
          <div className="seller-stat-secondary">
            {formatPriceWithCurrency(stats?.netRevenue ?? stats?.totalRevenue ?? 0).secondary}
          </div>
          <div className="seller-stat-desc">What you keep, after the 1% platform fee</div>
        </div>

        <div className="seller-stat-card accent-red">
          <div className="seller-stat-label">
            <Package size={16} />
            Goods Sold
          </div>
          <div className="seller-stat-value">{stats?.totalItemsSold || 0}</div>
          <div className="seller-stat-desc">Items bought by customers</div>
        </div>

        <div className="seller-stat-card accent-blue">
          <div className="seller-stat-label">
            <Tag size={16} />
            Market Goods
          </div>
          <div className="seller-stat-value">{stats?.activeListings || 0}</div>
          <div className="seller-stat-desc">Currently on the market</div>
        </div>
      </div>

      <div className="seller-section-card">
        <div className="seller-section-card-header">
          <h2>Recent Sales History</h2>
        </div>
        {stats?.recentSales?.length > 0 ? (
          <div className="seller-table-wrap">
            <table className="seller-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Date</th>
                  <th>Sale Price</th>
                  <th>You Receive</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentSales.map((sale: any) => (
                  <tr key={sale.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <GroupImage images={sale.images} title={sale.title} size={44} />
                        <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{sale.title}</span>
                      </div>
                    </td>
                    <td className="muted">
                      {sale.sold_at ? new Date(sale.sold_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="price-main">
                        {formatPriceWithCurrency(sale.sold_price).primary}
                      </div>
                      <div className="price-sub">
                        {formatPriceWithCurrency(sale.sold_price).secondary}
                      </div>
                    </td>
                    <td>
                      <div className="price-main" style={{ color: '#059669' }}>
                        {formatPriceWithCurrency(sale.net_payout ?? sale.sold_price).primary}
                      </div>
                    </td>
                    <td>
                      <span className="badge-sold">Sold</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="seller-empty-state">
            <p>No sales yet.</p>
            <p className="sub">Share your products on WhatsApp to get more customers.</p>
          </div>
        )}
      </div>

      <div className="seller-tip-banner">
        <Lightbulb size={28} color="#ea580c" style={{ flexShrink: 0, marginTop: '2px' }} />
        <div>
          <h3>Market Tip of the Day</h3>
          <p>
            "Customer is King!" Always greet your customers with a smile. A happy customer will
            tell their friends about your shop.
          </p>
        </div>
      </div>
    </>
  );

  const renderOffers = () => (
    <div>
      <div className="offer-filter-tabs">
        {[
          { id: 'all', label: 'All Bargains', icon: null },
          { id: 'pending', label: 'New Requests', icon: <Clock size={15} /> },
          { id: 'accepted', label: 'Deal Done', icon: <Check size={15} /> },
          { id: 'rejected', label: 'No Deal', icon: <X size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            className={`offer-filter-tab${offerTab === tab.id ? ' active' : ''}`}
            onClick={() => setOfferTab(tab.id as any)}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {filteredOffers.length === 0 ? (
        <div className="offer-empty-state">
          <Handshake size={44} color="var(--color-text-muted)" />
          <h3>No bargaining yet</h3>
          <p>Share your market link on WhatsApp to get customers!</p>
        </div>
      ) : (
        <div>
          {Object.values(
            filteredOffers.reduce((acc: any, offer) => {
              const productId = offer.product?.id || 'unknown';
              if (!acc[productId]) acc[productId] = { product: offer.product, offers: [] };
              acc[productId].offers.push(offer);
              return acc;
            }, {})
          ).map((group: any) => (
            <div key={group.product?.id || 'unknown'} className="offer-group-card">
              <div className="offer-group-header">
                <GroupImage images={group.product?.images} title={group.product?.title} />
                <div>
                  <div className="offer-group-title">
                    {group.product?.title || 'Unknown Product'}
                  </div>
                  <div className="offer-group-count">
                    {group.offers.length} Active Offer{group.offers.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              <div className="offer-group-body">
                {group.offers.map((offer: any) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    viewType="seller"
                    onOfferUpdated={fetchOffers}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderPayouts = () => {
    if (statsError) {
      return (
        <div className="seller-empty-state">
          <AlertTriangle size={40} color="var(--color-error, #dc2626)" />
          <p style={{ color: 'var(--color-error, #dc2626)', fontWeight: 600 }}>
            Could not load financial data
          </p>
          <p className="sub">{statsError}</p>
          <button className="btn-renew" style={{ marginTop: '1rem' }} onClick={fetchStats}>
            Try Again
          </button>
        </div>
      );
    }

    const totalRevenueUSD = stats?.totalRevenue || 0;
    const netRevenueUSD = stats?.netRevenue ?? totalRevenueUSD;
    const totalFeesUSD = stats?.totalPlatformFees ?? 0;
    const priceFormatted = formatPriceWithCurrency(netRevenueUSD, 'USD');
    const recentSales = stats?.recentSales || [];

    return (
      <div>
        <div className="wallet-card">
          <div className="wallet-card-header">
            <div>
              <div className="wallet-card-title">
                My Earnings <span className="wallet-badge">Sales Revenue</span>
              </div>
              <p>What you keep from your sold items, after the 1% platform fee</p>
            </div>
            <button className="btn-cash-out" onClick={() => navigate('/wallet')}>
              My Wallet
            </button>
          </div>

          <div className="wallet-balance-panel">
            <div className="wallet-balance-col">
              <div className="wallet-balance-label">LRD Earned</div>
              <div className="wallet-balance-value lrd">{priceFormatted.primary}</div>
            </div>
            <div className="wallet-divider" />
            <div className="wallet-balance-col">
              <div className="wallet-balance-label">USD Equivalent</div>
              <div className="wallet-balance-value usd">{priceFormatted.secondary}</div>
            </div>
          </div>
        </div>

        {/* Summary cards */}
        <div className="seller-stats-grid" style={{ marginTop: '1.25rem' }}>
          <div className="seller-stat-card">
            <div className="seller-stat-label"><DollarSign size={16} /> Total Sales</div>
            <div className="seller-stat-value">{formatPriceWithCurrency(totalRevenueUSD).primary}</div>
            <div className="seller-stat-desc">
              All time, before the 1% fee ({formatPriceWithCurrency(totalFeesUSD).primary} total fees)
            </div>
          </div>
          <div className="seller-stat-card accent-red">
            <div className="seller-stat-label"><Package size={16} /> Items Sold</div>
            <div className="seller-stat-value">{stats?.totalItemsSold || 0}</div>
            <div className="seller-stat-desc">Successfully completed sales</div>
          </div>
          <div className="seller-stat-card accent-blue">
            <div className="seller-stat-label"><Tag size={16} /> Active Listings</div>
            <div className="seller-stat-value">{stats?.activeListings || 0}</div>
            <div className="seller-stat-desc">Products on the market now</div>
          </div>
        </div>

        {/* Recent Sales Table */}
        <div className="seller-section-card" style={{ marginTop: '1.25rem' }}>
          <div className="seller-section-card-header">
            <h2>Sales History</h2>
          </div>
          {recentSales.length > 0 ? (
            <div className="seller-table-wrap">
              <table className="seller-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Date Sold</th>
                    <th>Sale Price</th>
                    <th>You Receive</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale: any) => (
                    <tr key={sale.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                          <GroupImage images={sale.images} title={sale.title} size={44} />
                          <span style={{ fontWeight: 600, lineHeight: 1.3 }}>{sale.title}</span>
                        </div>
                      </td>
                      <td className="muted">
                        {sale.sold_at ? new Date(sale.sold_at).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="price-main">
                          {formatPriceWithCurrency(sale.sold_price || sale.price).primary}
                        </div>
                        <div className="price-sub">
                          {formatPriceWithCurrency(sale.sold_price || sale.price).secondary}
                        </div>
                      </td>
                      <td>
                        <div className="price-main" style={{ color: '#059669' }}>
                          {formatPriceWithCurrency(sale.net_payout ?? (sale.sold_price || sale.price)).primary}
                        </div>
                      </td>
                      <td><span className="badge-sold">Sold</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="seller-empty-state">
              <p>No sales recorded yet.</p>
              <p className="sub">
                When you mark a product as sold, it will appear here with the sale price and date.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderHelp = () => (
    <div>
      <div className="help-faq-card">
        <h3>Frequently Asked Questions</h3>
        <details className="help-faq-item">
          <summary>How do I get paid?</summary>
          <p>
            Payments are processed securely through Mobile Money (Lonestar/Orange). Once a buyer
            confirms receipt, funds are released to your wallet.
          </p>
        </details>
        <details className="help-faq-item">
          <summary>How to boost my sales?</summary>
          <p>
            Use clear photos, write detailed descriptions, and respond quickly to offers. You can
            also share your store link on WhatsApp.
          </p>
        </details>
        <details className="help-faq-item">
          <summary>What fees does the platform charge?</summary>
          <p>
            Listing is free! We only charge a small commission (1%) when you successfully sell an
            item.
          </p>
        </details>
      </div>

      <div className="help-support-card">
        <h3>Need more help?</h3>
        <p>Our support team is available 24/7 to assist you.</p>
        <button className="btn-contact">Contact Support</button>
      </div>
    </div>
  );

  const renderAnnouncements = () => (
    <div>
      <div className="announcement-card">
        <div className="announcement-card-header" style={{ background: '#25D366' }}>
          <Smartphone size={22} color="white" />
          <h3>WhatsApp Integration Live!</h3>
        </div>
        <div className="announcement-card-body">
          <div className="announcement-meta">
            <span
              className="announcement-tag"
              style={{ background: '#dcfce7', color: '#166534' }}
            >
              NEW FEATURE
            </span>
            <span className="announcement-date">Dec 9, 2025</span>
          </div>
          <p>
            You can now share your products directly to <strong>WhatsApp Status</strong> and groups
            with one click. This is the fastest way to get customers in Liberia!
          </p>
          <button className="btn-try-now">Try it now</button>
        </div>
      </div>

      <div className="announcement-card">
        <div className="announcement-card-header" style={{ background: '#dc2626' }}>
          <Gift size={22} color="white" />
          <h3>Holiday Season Tips</h3>
        </div>
        <div className="announcement-card-body">
          <div className="announcement-meta">
            <span
              className="announcement-tag"
              style={{ background: '#dbeafe', color: '#1e40af' }}
            >
              SELLING TIP
            </span>
            <span className="announcement-date">Dec 5, 2025</span>
          </div>
          <p>
            Christmas is coming! Stock up on popular items like{' '}
            <strong>phones, lappa suits, and rice</strong>. Buyers are looking for gifts and food
            for the celebration.
          </p>
        </div>
      </div>
    </div>
  );

  const tabs = [
    { id: 'insights', icon: <TrendingUp size={16} />, label: 'My Shop Stats' },
    { id: 'offers', icon: <Handshake size={16} />, label: 'Bargaining Table' },
    { id: 'payouts', icon: <DollarSign size={16} />, label: 'My Earnings' },
    { id: 'announcements', icon: <Megaphone size={16} />, label: "What's New" },
    { id: 'help', icon: <HelpCircle size={16} />, label: 'Help Center' },
  ];

  return (
    <div className="seller-dash-container">
      <div className="seller-dash-content">
        {/* Page Header */}
        <div className="seller-dash-header">
          <div>
            <h1>
              <Store size={24} />
              My Market Stand
            </h1>
            <p>Hello, {user?.name}! Manage your business and grow your money here.</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="seller-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`seller-tab-btn${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'insights' && renderInsights()}
          {activeTab === 'offers' && renderOffers()}
          {activeTab === 'payouts' && renderPayouts()}
          {activeTab === 'announcements' && renderAnnouncements()}
          {activeTab === 'help' && renderHelp()}
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
