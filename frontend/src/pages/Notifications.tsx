import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import notificationService, { Notification } from '../services/notificationService'
import VoiceButton from '../components/VoiceButton'

const Notifications = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchNotifications()
  }, [isAuthenticated, navigate])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationService.getNotifications(1, 50)
      setNotifications(response.data)
      setUnreadCount(response.unreadCount)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, isRead: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications(notifications.map(n => ({ ...n, isRead: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      const deleted = notifications.find(n => n.id === id)
      setNotifications(notifications.filter(n => n.id !== id))
      if (deleted && !deleted.isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error('Error deleting notification:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message': return '💬'
      case 'product': return '📦'
      case 'job': return '💼'
      case 'review': return '⭐'
      case 'system': return '🔔'
      default: return '📢'
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'message': return '#17a2b8'
      case 'product': return '#007bff'
      case 'job': return '#28a745'
      case 'review': return '#ffc107'
      case 'system': return '#6f42c1'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading notifications...</h2>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
            Notifications 🔔
          </h1>
          {unreadCount > 0 && (
            <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllAsRead} className="btn btn-secondary">
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--space-3xl)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-md)' }}>🔔</div>
          <h3 style={{ marginBottom: 'var(--space-md)' }}>No notifications</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            You're all caught up! We'll notify you when something new happens.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--space-md)' }}>
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="card"
              style={{
                padding: 'var(--space-lg)',
                borderLeft: `4px solid ${getNotificationColor(notification.type)}`,
                backgroundColor: notification.isRead ? 'var(--color-bg-secondary)' : '#f0f8ff',
                cursor: notification.link ? 'pointer' : 'default',
                transition: 'all 0.3s ease'
              }}
              onClick={() => {
                if (!notification.isRead) {
                  handleMarkAsRead(notification.id)
                }
                if (notification.link) {
                  navigate(notification.link)
                }
              }}
              onMouseEnter={(e) => {
                if (notification.link) {
                  e.currentTarget.style.transform = 'translateX(4px)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)'
                }
              }}
              onMouseLeave={(e) => {
                if (notification.link) {
                  e.currentTarget.style.transform = 'translateX(0)'
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ display: 'flex', gap: 'var(--space-md)', flex: 1 }}>
                  <div style={{ fontSize: '2rem' }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-xs)' }}>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', margin: 0 }}>
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: getNotificationColor(notification.type)
                          }}
                        />
                      )}
                      <VoiceButton
                        text={`${notification.title}. ${notification.message}`}
                        size="small"
                        ariaLabel="Listen to notification"
                      />
                    </div>
                    <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--color-text-primary)', margin: 0, marginBottom: 'var(--space-xs)' }}>
                      {notification.message}
                    </p>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                  {!notification.isRead && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleMarkAsRead(notification.id)
                      }}
                      style={{
                        padding: '4px 8px',
                        fontSize: 'var(--font-size-xs)',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                      title="Mark as read"
                    >
                      ✓
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(notification.id)
                    }}
                    style={{
                      padding: '4px 8px',
                      fontSize: 'var(--font-size-xs)',
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--color-error)',
                      cursor: 'pointer'
                    }}
                    title="Delete"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Notifications
