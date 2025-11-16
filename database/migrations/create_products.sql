import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import productService from '../services/productService'

interface DashboardStats {
  totalListings: number
  activeListings: number
  soldItems: number
  messages: number
  notifications: number
}

const Dashboard = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeListings: 0,
    soldItems: 0,
    messages: 0,
    notifications: 3
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }

    const fetchStats = async () => {
      try {
        setLoading(true)
        if (user?.id) {
          const productsResponse = await productService.getUserProducts(user.id, 1, 100)
          const products = productsResponse.data

          setStats({
            totalListings: products.length,
            activeListings: products.filter((p: any) => p.status === 'active').length,
            soldItems: products.filter((p: any) => p.status === 'sold').length,
            messages: 0,
            notifications: 3
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

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px', position: 'relative' }}>
      {/* Fixed Login (top-right) for unauthenticated users */}
      {!isAuthenticated && (
        <Link
          to="/login"
          aria-label="Login"
          style={{
            position: 'fixed',
            top: '12px',
            right: '16px',
            zIndex: 1000,
            background: '#ffffff',
            border: '1px solid #ddd',
            padding: '8px 16px',
            borderRadius: '8px',
            fontWeight: 600,
            textDecoration: 'none',
            boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
          }}
        >
          Login
        </Link>
      )}

      {/* Split Screen Hero (Buyers vs Sellers) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))',
          gap: '24px',
          marginBottom: '40px'
        }}
      >
        {/* Buyers Panel */}
        <div
          className="card"
          style={{
            padding: '32px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg,#f0f8ff 0%,#e3f2fd 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '140px', opacity: 0.05 }}>🛍️</div>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, color: '#007bff' }}>For Buyers</h2>
            <p style={{ marginTop: '12px', color: '#333', fontSize: '0.95rem', lineHeight: 1.4 }}>
              Discover local products, compare deals, and contact sellers easily.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <Link
              to="/products"
              className="btn btn-primary"
              style={{ padding: '14px 24px', fontSize: '1rem', fontWeight: 600, borderRadius: '10px' }}
              aria-label="Browse products"
            >
              Browse Products
            </Link>
          </div>
        </div>

        {/* Sellers Panel */}
        <div
          className="card"
          style={{
            padding: '32px',
            minHeight: '300px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            background: 'linear-gradient(135deg,#fff7ed 0%,#ffe8d5 100%)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', top: '-30px', right: '-30px', fontSize: '140px', opacity: 0.05 }}>📦</div>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0, fontWeight: 800, color: '#fd7e14' }}>For Sellers</h2>
            <p style={{ marginTop: '12px', color: '#333', fontSize: '0.95rem', lineHeight: 1.4 }}>
              Post items fast. Manage listings and reach more local buyers.
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '16px' }}>
            <Link
              to="/add-product"
              className="btn btn-secondary"
              style={{
                padding: '14px 24px',
                fontSize: '1rem',
                fontWeight: 600,
                borderRadius: '10px',
                background: '#fd7e14',
                color: '#fff',
                border: 'none'
              }}
              aria-label="Sell an item"
            >
              Sell an Item
            </Link>
          </div>
          {isAuthenticated && (
            <div style={{ marginTop: '12px', fontSize: '0.75rem', color: '#444' }}>
              Signed in as {user?.name}.{' '}
              <button
                onClick={handleLogout}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#d9534f',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '0.75rem'
                }}
                aria-label="Logout now"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Divider text */}
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <span style={{ fontSize: '0.85rem', color: '#666' }}>
          Voice-friendly marketplace for Liberia — choose your path.
        </span>
      </div>

      {/* Quick Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '16px',
        marginBottom: '40px'
      }}>
        <div className="card" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e3f2fd' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#007bff', marginBottom: '8px' }}>
            {stats.activeListings}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Active Listings
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#e8f5e9' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#28a745', marginBottom: '8px' }}>
            {stats.soldItems}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Items Sold
          </div>
        </div>

        <div className="card" style={{ textAlign: 'center', padding: '20px', backgroundColor: '#fff3e0' }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#ff9800', marginBottom: '8px' }}>
            {stats.messages}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666' }}>
            Messages
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard