import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'
import VoiceButton from '../components/VoiceButton'

interface DashboardStats {
  totalListings: number
  activeListings: number
  soldItems: number
  messages: number
  notifications: number
}

/**
 * LibMarket Dashboard - Unified for Buyers and Sellers
 * Shows: Browse All, Jobs, Notifications, Inbox, Buying & Selling modules
 */
const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    messages: 0,
    notifications: 3 // Placeholder
  })
  const [loading, setLoading] = useState(true)
  // const [isAuth, setIsAuth] = useState<boolean>(Boolean(localStorage.getItem('token')))

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          // Fetch user's products
          const productsResponse = await productService.getUserProducts(user.id, 1, 100)
          const products = productsResponse.data

          setStats({
            totalListings: products.length,
            activeListings: products.filter((p: any) => p.status === 'active').length,
            soldItems: products.filter((p: any) => p.status === 'sold').length,
            messages: 0, // Placeholder - will implement messaging
            notifications: 3 // Placeholder
          })
        }
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user, isAuthenticated, navigate])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (err) {
      console.error('Logout failed:', err)
    } finally {
      navigate('/login')
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading your dashboard...</h2>
      </div>
    )
  }

  const dashboardModules = [
    {
      id: 'browse',
      title: 'Browse All',
      icon: '🏪',
      description: 'Explore all products in marketplace',
      link: '/products',
      color: '#007bff',
      voiceText: 'Browse all products in the marketplace'
    },
    {
      id: 'jobs',
      title: 'Jobs',
      icon: '💼',
      description: 'Post or find jobs',
      link: '/jobs',
      color: '#28a745',
      badge: 'New',
      voiceText: 'Post or find jobs'
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: '🔔',
      description: 'Stay updated',
      link: '/notifications',
      color: '#ffc107',
      badge: stats.notifications > 0 ? stats.notifications.toString() : undefined,
      voiceText: `You have ${stats.notifications} notifications`
    },
    {
      id: 'inbox',
      title: 'Inbox',
      icon: '💬',
      description: 'Your messages',
      link: '/inbox',
      color: '#17a2b8',
      badge: stats.messages > 0 ? stats.messages.toString() : undefined,
      voiceText: `You have ${stats.messages} messages`
    },
    {
      id: 'selling',
      title: 'My Products',
      icon: '📦',
      description: 'Manage your listings',
      link: '/profile?tab=products',
      color: '#6f42c1',
      voiceText: `You have ${stats.activeListings} active listings`
    },
    {
      id: 'add-product',
      title: 'Sell Item',
      icon: '➕',
      description: 'Create new listing',
      link: '/add-product',
      color: '#fd7e14',
      voiceText: 'Create a new product listing'
    }
  ]

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Welcome Header */}
      <div className="card" style={{ marginBottom: 'var(--space-xl)', background: 'linear-gradient(135deg, var(--color-primary) 0%, #0056b3 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)', color: 'white' }}>
              Welcome, {user?.name}! 👋
            </h1>
            <p style={{ fontSize: 'var(--font-size-lg)', opacity: 0.9, marginBottom: 0 }}>
              Your LibMarket Dashboard
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <VoiceButton
              text={`Welcome ${user?.name}. This is your LibMarket dashboard. You have ${stats.activeListings} active listings, ${stats.soldItems} sold items, and ${stats.notifications} notifications.`}
              size="large"
              ariaLabel="Listen to dashboard summary"
            />
            {/* Logout quick action */}
            <button
              onClick={handleLogout}
              aria-label="Logout"
              title="Logout"
              style={{
                background: '#fff',
                color: '#007bff',
                border: '1px solid rgba(255,255,255,0.2)',
                padding: '8px 12px',
                borderRadius: 8,
                cursor: 'pointer',
                fontWeight: 700
              }}
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 'var(--space-md)',
        marginBottom: 'var(--space-xl)'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', backgroundColor: '#e3f2fd' }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: '#007bff', marginBottom: 'var(--space-xs)' }}>
            {stats.activeListings}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Active Listings
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', backgroundColor: '#e8f5e9' }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: '#28a745', marginBottom: 'var(--space-xs)' }}>
            {stats.soldItems}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Items Sold
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-lg)', backgroundColor: '#fff3e0' }}>
          <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 'bold', color: '#ff9800', marginBottom: 'var(--space-xs)' }}>
            {stats.messages}
          </div>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
            Messages
          </div>
        </div>
      </div>

      {/* Dashboard Modules */}
      <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-lg)', fontWeight: 'bold' }}>
        Quick Access
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--space-lg)'
      }}>
        {dashboardModules.map((module) => (
          <Link
            key={module.id}
            to={module.link}
            style={{ textDecoration: 'none' }}
          >
            <div
              className="card"
              style={{
                padding: 'var(--space-xl)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: '2px solid var(--color-border)',
                position: 'relative',
                overflow: 'hidden',
                minHeight: '160px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)'
                e.currentTarget.style.boxShadow = 'var(--shadow-lg)'
                e.currentTarget.style.borderColor = module.color
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                e.currentTarget.style.borderColor = 'var(--color-border)'
              }}
            >
              {/* Icon Background */}
              <div style={{
                position: 'absolute',
                top: '-20px',
                right: '-20px',
                fontSize: '120px',
                opacity: 0.05,
                pointerEvents: 'none'
              }}>
                {module.icon}
              </div>

              {/* Badge */}
              {module.badge && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: module.color,
                  color: 'white',
                  padding: '4px 12px',
                  borderRadius: '12px',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 'bold'
                }}>
                  {module.badge}
                </div>
              )}

              {/* Content */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{
                  fontSize: '3rem',
                  marginBottom: 'var(--space-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-sm)'
                }}>
                  <span>{module.icon}</span>
                  <VoiceButton
                    text={module.voiceText}
                    size="small"
                    ariaLabel={`Listen to ${module.title}`}
                  />
                </div>

                <h3 style={{
                  fontSize: 'var(--font-size-xl)',
                  marginBottom: 'var(--space-sm)',
                  color: module.color,
                  fontWeight: 'bold'
                }}>
                  {module.title}
                </h3>

                <p style={{
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text-secondary)',
                  margin: 0
                }}>
                  {module.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity Section */}
      <div style={{ marginTop: 'var(--space-3xl)' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-lg)', fontWeight: 'bold' }}>
          Recent Activity
        </h2>

        <div className="card" style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>📊</div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
            Your recent activity will appear here
          </p>
          <Link to="/products" className="btn btn-primary" style={{ marginTop: 'var(--space-md)' }}>
            Start Browsing
          </Link>
        </div>
      </div>

      {/* Help Section */}
      <div className="card" style={{
        marginTop: 'var(--space-xl)',
        padding: 'var(--space-xl)',
        backgroundColor: '#f8f9fa',
        borderLeft: '4px solid var(--color-primary)'
      }}>
        <div style={{ display: 'flex', alignItems: 'start', gap: 'var(--space-md)' }}>
          <div style={{ fontSize: '2rem' }}>💡</div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-sm)', fontWeight: 'bold' }}>
              Need Help?
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-md)' }}>
              Tap the speaker icons (🔉) to hear instructions. Use the microphone (🎤) to search with your voice.
            </p>
            <button
              onClick={() => {
                const helpText = `Welcome to LibMarket dashboard. Here you can browse all products, post or find jobs, check notifications, read messages, manage your products, and sell new items. Tap any card to access that feature. Tap speaker icons to hear more information.`
                const utterance = new SpeechSynthesisUtterance(helpText)
                utterance.rate = 0.9
                window.speechSynthesis.speak(utterance)
              }}
              className="btn btn-secondary"
              style={{ fontSize: 'var(--font-size-sm)' }}
            >
              🔉 Hear Dashboard Guide
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
