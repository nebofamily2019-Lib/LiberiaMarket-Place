import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import { getSentOffers, getReceivedOffers, Offer } from '../services/offerService'
import BuyerOverview from '../components/dashboard/BuyerOverview'
import SellerOverview from '../components/dashboard/SellerOverview'
import useUnreadMessages from '../hooks/useUnreadMessages'
import ReportModal from '../components/ReportModal'
import '../styles/Dashboard.css'

interface Product {
  id: string
  title: string
  description: string
  price: number
  status: string
  location: string
  createdAt: string
  seller_id?: string
  currency?: string
  images?: string[]
  category?: {
    name: string
    icon: string
    color: string
  }
}

interface DashboardStats {
  seller?: {
    myProducts: number
    activeProducts: number
    pendingProducts: number
    soldProducts: number
    pendingOffers: number
  }
  buyer?: {
    activeOffers: number
    awaitingYourResponse: number
    purchases: number
  }
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeProducts, setActiveProducts] = useState<Product[]>([])
  const [soldProducts, setSoldProducts] = useState<Product[]>([])
  const [myPurchases, setMyPurchases] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  // Sent offers (buyer), split by what they mean for the buyer right now
  const [pendingSentOffers, setPendingSentOffers] = useState<Offer[]>([])
  const [counteredSentOffers, setCounteredSentOffers] = useState<Offer[]>([])
  const [acceptedSentOffers, setAcceptedSentOffers] = useState<Offer[]>([])
  // Received offers (seller), split the same way
  const [pendingReceivedOffers, setPendingReceivedOffers] = useState<Offer[]>([])
  const [acceptedReceivedOffers, setAcceptedReceivedOffers] = useState<Offer[]>([])
  const [stats, setStats] = useState<DashboardStats>({})
  const unreadMessages = useUnreadMessages()
  const [showReportPicker, setShowReportPicker] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportProductId, setReportProductId] = useState<string | undefined>(undefined)

  // Re-run whenever user loads so role-gated fetches actually fire
  useEffect(() => {
    if (!user) return
    fetchDashboardData()
    fetchOffers()
  }, [user?.id])

  // Helper to check if user has a role
  const hasRole = (role: string) => {
    if (!user) return false;
    return user.roles?.includes(role) || user.roles?.includes('admin');
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch stats
      const statsRes = await api.get('/dashboard/stats')
      if (statsRes.data.success) {
        setStats(statsRes.data.data)
      }

      // Fetch seller's products if user is a seller — fetched per-status so
      // each dashboard section only ever shows products matching its own
      // status, instead of a mixed "5 most recent regardless of status" list.
      if (hasRole('seller')) {
        const [activeRes, soldRes] = await Promise.all([
          api.get('/dashboard/my-products?status=active&limit=5'),
          api.get('/dashboard/my-products?status=sold&limit=5')
        ])
        if (activeRes.data.success) setActiveProducts(activeRes.data.data)
        if (soldRes.data.success) setSoldProducts(soldRes.data.data)
      }

      // Fetch buyer's purchases if user is a buyer
      if (hasRole('buyer')) {
        const purchasesRes = await api.get('/dashboard/my-purchases')
        if (purchasesRes.data.success) {
          setMyPurchases(purchasesRes.data.data)
        }
        
        // Fetch recent activity
        const activityRes = await api.get('/dashboard/activity?limit=5')
        if (activityRes.data.success) {
          setRecentActivity(activityRes.data.data)
        }
      }
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchOffers = async () => {
    try {
      // Fetch sent offers for buyers — each bucket fetched by status so the
      // dashboard sections stay true to their labels (e.g. "awaiting you"
      // never mixes in offers that are actually done and dusted).
      if (hasRole('buyer')) {
        const [pending, countered, accepted] = await Promise.all([
          getSentOffers('pending'),
          getSentOffers('countered'),
          getSentOffers('accepted')
        ])
        setPendingSentOffers(pending)
        setCounteredSentOffers(countered)
        setAcceptedSentOffers(accepted)
      }

      // Fetch received offers for sellers
      if (hasRole('seller')) {
        const [pending, accepted] = await Promise.all([
          getReceivedOffers('pending'),
          getReceivedOffers('accepted')
        ])
        setPendingReceivedOffers(pending)
        setAcceptedReceivedOffers(accepted)
      }
    } catch (err: any) {
      console.error('Error fetching offers:', err)
    }
  }

  if (loading) {
    return (
      <div className='dashboard-container'>
        <HamburgerMenu />
        <div className='loading-state'>
          <div className='spinner'>⏳</div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='dashboard-container'>
      <HamburgerMenu />
      
      <div className='dashboard-content'>
        <h1>
          {user?.gender === 'Male' 
            ? 'Welcome back, Chief! 👋' 
            : user?.gender === 'Female' 
              ? 'Welcome back, Ma! 👋' 
              : `How body, ${user?.name || 'Friend'}? 👋`}
        </h1>

        {/* Quick Navigation Bar */}
        <div className='quick-nav-banner'>
          <button
            className='quick-nav-btn'
            onClick={() => navigate('/products')}
            title='Browse all products'
          >
            <span className='quick-nav-icon'>🛍️</span>
            <span className='quick-nav-label'>Products</span>
          </button>
          <button
            className='quick-nav-btn'
            onClick={() => navigate('/messages')}
            title={unreadMessages > 0 ? `${unreadMessages} unread message${unreadMessages > 1 ? 's' : ''}` : 'View messages'}
            style={{ position: 'relative' }}
          >
            <span className='quick-nav-icon' style={{ position: 'relative', display: 'inline-block' }}>
              💬
              {unreadMessages > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-8px',
                  right: '-10px',
                  background: '#EF4444',
                  color: '#fff',
                  borderRadius: '50%',
                  minWidth: '18px',
                  height: '18px',
                  fontSize: '0.62rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.5)',
                  lineHeight: 1,
                  padding: '0 3px',
                  boxShadow: '0 2px 6px rgba(239,68,68,0.5)',
                  animation: 'badge-pulse 2s infinite',
                }}>
                  {unreadMessages > 99 ? '99+' : unreadMessages}
                </span>
              )}
            </span>
            <span className='quick-nav-label'>
              Messages{unreadMessages > 0 ? ` (${unreadMessages})` : ''}
            </span>
          </button>
          {hasRole('seller') && (
            <>
              <button
                className='quick-nav-btn'
                onClick={() => navigate('/my-products')}
                title='My products'
              >
                <span className='quick-nav-icon'>📦</span>
                <span className='quick-nav-label'>My Products</span>
              </button>
              <button
                className='quick-nav-btn'
                onClick={() => navigate('/products/add')}
                title='Add new product'
              >
                <span className='quick-nav-icon'>➕</span>
                <span className='quick-nav-label'>Add Product</span>
              </button>
            </>
          )}
          <button
            className='quick-nav-btn'
            onClick={() => setShowReportPicker(true)}
            title='Report a problem'
          >
            <span className='quick-nav-icon'>🚩</span>
            <span className='quick-nav-label'>Report a Problem</span>
          </button>
        </div>

        {/* Render Role-Specific Overviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Seller Section */}
          {hasRole('seller') && (
            <SellerOverview
              activeProducts={activeProducts}
              soldProducts={soldProducts}
              pendingOffers={pendingReceivedOffers}
              activeDealOffers={acceptedReceivedOffers}
              onOfferUpdated={fetchOffers}
              stats={stats.seller}
            />
          )}

          {/* Buyer Section */}
          {hasRole('buyer') && (
            <BuyerOverview
              purchases={myPurchases}
              recentActivity={recentActivity}
              pendingSentOffers={pendingSentOffers}
              counteredSentOffers={counteredSentOffers}
              activeDealOffers={acceptedSentOffers}
              onOfferUpdated={fetchOffers}
              stats={stats.buyer}
            />
          )}
        </div>

      </div>

      {showReportPicker && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
          onClick={() => setShowReportPicker(false)}
        >
          <div
            style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', width: '90%', maxWidth: '480px', maxHeight: '80vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: '1rem' }}>What do you want to report?</h2>

            <button
              className='quick-nav-btn'
              style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.75rem' }}
              onClick={() => { setReportProductId(undefined); setShowReportModal(true); setShowReportPicker(false) }}
            >
              <span className='quick-nav-icon'>💬</span>
              <span className='quick-nav-label'>Something else / general issue</span>
            </button>

            {hasRole('buyer') && myPurchases.length > 0 && (
              <>
                <p style={{ fontWeight: 600, margin: '1rem 0 0.5rem' }}>A recent purchase</p>
                {myPurchases.slice(0, 5).map((purchase) => (
                  purchase.product && (
                    <button
                      key={purchase.id}
                      className='quick-nav-btn'
                      style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
                      onClick={() => { setReportProductId(purchase.product.id); setShowReportModal(true); setShowReportPicker(false) }}
                    >
                      <span className='quick-nav-label'>{purchase.product.title}</span>
                    </button>
                  )
                ))}
              </>
            )}

            {hasRole('seller') && [...activeProducts, ...soldProducts].length > 0 && (
              <>
                <p style={{ fontWeight: 600, margin: '1rem 0 0.5rem' }}>One of my listings</p>
                {[...activeProducts, ...soldProducts].slice(0, 5).map((product) => (
                  <button
                    key={product.id}
                    className='quick-nav-btn'
                    style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '0.5rem' }}
                    onClick={() => { setReportProductId(product.id); setShowReportModal(true); setShowReportPicker(false) }}
                  >
                    <span className='quick-nav-label'>{product.title}</span>
                  </button>
                ))}
              </>
            )}

            <button
              className='quick-nav-btn'
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
              onClick={() => setShowReportPicker(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        productId={reportProductId}
      />
    </div>
  )
}

export default Dashboard
