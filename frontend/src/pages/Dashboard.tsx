import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import { getSentOffers, getReceivedOffers, Offer } from '../services/offerService'
import BuyerOverview from '../components/dashboard/BuyerOverview'
import SellerOverview from '../components/dashboard/SellerOverview'
import useUnreadMessages from '../hooks/useUnreadMessages'
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
  category?: {
    name: string
    icon: string
    color: string
  }
}

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [myProducts, setMyProducts] = useState<Product[]>([])
  const [myPurchases, setMyPurchases] = useState<any[]>([])
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [sentOffers, setSentOffers] = useState<Offer[]>([])
  const [receivedOffers, setReceivedOffers] = useState<Offer[]>([])
  const unreadMessages = useUnreadMessages()

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
      await api.get('/dashboard/stats')

      // Fetch seller's products if user is a seller
      if (hasRole('seller')) {
        const productsRes = await api.get('/dashboard/my-products?limit=5')
        if (productsRes.data.success) {
          setMyProducts(productsRes.data.data)
        }
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
      // Fetch sent offers for buyers
      if (hasRole('buyer')) {
        const offers = await getSentOffers()
        setSentOffers(offers.slice(0, 5)) // Show only 5 most recent
      }

      // Fetch received offers for sellers
      if (hasRole('seller')) {
        const offers = await getReceivedOffers()
        setReceivedOffers(offers.slice(0, 5)) // Show only 5 most recent
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
        </div>

        {/* Render Role-Specific Overviews */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Seller Section */}
          {hasRole('seller') && (
            <SellerOverview 
              products={myProducts} 
              receivedOffers={receivedOffers}
              onOfferUpdated={fetchOffers}
            />
          )}

          {/* Buyer Section */}
          {hasRole('buyer') && (
            <BuyerOverview 
              purchases={myPurchases} 
              recentActivity={recentActivity} 
              sentOffers={sentOffers}
              onOfferUpdated={fetchOffers}
            />
          )}
        </div>

      </div>
    </div>
  )
}

export default Dashboard
