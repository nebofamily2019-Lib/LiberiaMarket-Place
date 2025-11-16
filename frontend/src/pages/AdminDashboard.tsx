import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import HamburgerMenu from '../components/HamburgerMenu'
import TopNav from '../components/TopNav'
import api from '../utils/api'
import '../styles/AdminDashboard.css'

interface Stats {
  totalUsers: number
  totalProducts: number
  totalCategories: number
  activeProducts: number
}

const AdminDashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalProducts: 0,
    totalCategories: 0,
    activeProducts: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      // TODO: Create admin stats endpoint
      // For now, using placeholder data
      setStats({
        totalUsers: 125,
        totalProducts: 48,
        totalCategories: 12,
        activeProducts: 42
      })
    } catch (err) {
      console.error('Error fetching stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-dashboard">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner">⏳</div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <HamburgerMenu />
      <TopNav />
      
      <div className="admin-header">
        <h1>🛡️ Admin Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-info">
            <h3>{stats.totalProducts}</h3>
            <p>Total Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>{stats.activeProducts}</h3>
            <p>Active Products</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📂</div>
          <div className="stat-info">
            <h3>{stats.totalCategories}</h3>
            <p>Categories</p>
          </div>
        </div>
      </div>

      <div className="admin-actions">
        <h2>Quick Actions</h2>
        <div className="actions-grid">
          <button className="action-button" onClick={() => window.location.href = '/categories'}>
            <span>📂</span>
            Manage Categories
          </button>
          <button className="action-button" onClick={() => window.location.href = '/products'}>
            <span>🛍️</span>
            View Products
          </button>
          <button className="action-button">
            <span>👥</span>
            Manage Users
          </button>
          <button className="action-button">
            <span>📊</span>
            View Reports
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
