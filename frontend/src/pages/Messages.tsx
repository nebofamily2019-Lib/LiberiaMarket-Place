import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import { getImageUrl } from '../utils/env'
import { formatPriceWithCurrency } from '../utils/currency'
import { useToast } from '../context/ToastContext'
import '../styles/Messages.css'
import { getCurrentUser } from '../utils/user'
import { MessageSquare, Edit, AlertTriangle, RefreshCw, VolumeX } from 'lucide-react'

interface Conversation {
  id: string
  buyer: { id: string; name: string; phone: string }
  seller: { id: string; name: string; phone: string }
  listing: {
    id: string
    title: string
    price: number
    images: string[] | null
    status: string
  }
  messages: Array<{
    id: string
    content: string
    isRead: boolean
    createdAt: string
    sender_id: string
  }>
  lastMessageAt: string
  createdAt?: string
  unreadCount: number
  isActive?: boolean
  isMuted?: boolean
}

type FilterType = 'all' | 'unread' | 'archived'

const Messages = () => {
  const navigate = useNavigate()
  const toast = useToast()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<FilterType>('all')
  const [showNewConversationModal, setShowNewConversationModal] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/messages/conversations')

      if (response.data.success) {
        setConversations(response.data.data)
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err)

      // Provide user-friendly error messages
      let errorMessage = 'Failed to load conversations'

      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.'
      } else if (err.status === 401) {
        errorMessage = 'Session expired. Please log in again.'
      } else if (err.status === 500) {
        errorMessage = 'Server error. Please try again later.'
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    fetchConversations()
  }

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`)
  }

  // Filter and search conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations

    // Apply filter
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(conv => conv.unreadCount > 0)
        break
      case 'archived':
        filtered = filtered.filter(conv => conv.isActive === false)
        break
      case 'all':
      default:
        filtered = filtered.filter(conv => conv.isActive !== false)
        break
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(conv => {
        const currentUser = getCurrentUser()
        const otherUser = conv.buyer.id === currentUser?.id ? conv.seller : conv.buyer

        return (
          otherUser.name.toLowerCase().includes(query) ||
          conv.listing.title.toLowerCase().includes(query) ||
          conv.messages?.[0]?.content?.toLowerCase().includes(query)
        )
      })
    }

    return filtered
  }, [conversations, activeFilter, searchQuery])

  // Archive conversation
  const handleArchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/conversations/${conversationId}/archive`)
      toast.success('Conversation archived')
      fetchConversations()
    } catch (err: any) {
      toast.error('Failed to archive conversation')
    }
  }

  // Delete conversation
  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this conversation? This cannot be undone.')) {
      return
    }
    try {
      await api.delete(`/conversations/${conversationId}`)
      toast.success('Conversation deleted')
      fetchConversations()
    } catch (err: any) {
      toast.error('Failed to delete conversation')
    }
  }

  // Mute conversation
  const handleMute = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/conversations/${conversationId}/mute`)
      toast.success('Conversation muted')
      fetchConversations()
    } catch (err: any) {
      toast.error('Failed to mute conversation')
    }
  }

  // Unarchive conversation
  const handleUnarchive = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await api.patch(`/conversations/${conversationId}/unarchive`)
      toast.success('Conversation restored')
      fetchConversations()
    } catch (err: any) {
      toast.error('Failed to restore conversation')
    }
  }

  const toggleConversationMenu = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedConversation(prev => prev === conversationId ? null : conversationId)
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setSelectedConversation(null)
    if (selectedConversation) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [selectedConversation])

  if (loading) {
    return (
      <div className="messages-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="messages-container">
      <HamburgerMenu />
      
      <div className="messages-content">
        {/* Header with Actions */}
        <div className="messages-header">
          <h1><MessageSquare size={28} /> My Messages</h1>
          <button
            className="btn-new-conversation"
            onClick={() => setShowNewConversationModal(true)}
          >
            <Edit size={16} /> New Message
          </button>
        </div>

        {/* Search Bar */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search conversations, products, or messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          {searchQuery && (
            <button
              className="search-clear"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
            <span className="filter-count">
              {conversations.filter(c => c.isActive !== false).length}
            </span>
          </button>
          <button
            className={`filter-tab ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            Unread
            <span className="filter-count">
              {conversations.filter(c => c.unreadCount > 0).length}
            </span>
          </button>
          <button
            className={`filter-tab ${activeFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveFilter('archived')}
          >
            Archived
            <span className="filter-count">
              {conversations.filter(c => c.isActive === false).length}
            </span>
          </button>
        </div>

        {error && (
          <div className="error-message">
            <span><AlertTriangle size={16} /></span>
            <span>{error}</span>
            <button
              onClick={handleRetry}
              className="retry-btn"
            >
              <RefreshCw size={16} /> Retry
            </button>
          </div>
        )}

        {filteredConversations.length > 0 ? (
          <div className="conversations-list">
            {filteredConversations.map((conv) => {
              const lastMessage = conv.messages?.[0]
              const currentUser = getCurrentUser()
              const otherUser = conv.buyer.id === currentUser?.id
                ? conv.seller
                : conv.buyer

              return (
                <div
                  key={conv.id}
                  className={`conversation-card ${conv.unreadCount > 0 ? 'unread' : ''} ${conv.isMuted ? 'muted' : ''}`}
                  onClick={() => handleConversationClick(conv.id)}
                >
                  <div className="conversation-product-image">
                    {conv.listing.images?.[0] ? (
                      <img
                        src={getImageUrl(conv.listing.images[0])}
                        alt={conv.listing.title}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header">
                      <div className="conversation-title">
                        <h3>{conv.listing.title}</h3>
                        <p className="product-price">{formatPriceWithCurrency(conv.listing.price).primary}</p>
                      </div>
                      <div className="conversation-badges">
                        <span className="product-status-badge" data-status={conv.listing.status}>
                          {conv.listing.status}
                        </span>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                        {conv.isMuted && (
                          <span className="muted-badge" title="Muted"><VolumeX size={14} /></span>
                        )}
                      </div>
                    </div>

                    <p className="conversation-user">
                      <span className="user-avatar-small">
                        {otherUser.name.charAt(0).toUpperCase()}
                      </span>
                      {otherUser.name}
                    </p>

                    {lastMessage && (
                      <p className="last-message">
                        {lastMessage.sender_id === currentUser?.id && <span className="you-prefix">You: </span>}
                        {lastMessage.content.substring(0, 60)}
                        {lastMessage.content.length > 60 ? '...' : ''}
                      </p>
                    )}

                    <p className="conversation-time">
                      {(() => {
                        try {
                          const date = new Date(conv.lastMessageAt || conv.createdAt || Date.now())
                          if (isNaN(date.getTime())) return 'Recently'

                          const now = new Date()
                          const diffMs = now.getTime() - date.getTime()
                          const diffMins = Math.floor(diffMs / 60000)
                          const diffHours = Math.floor(diffMs / 3600000)
                          const diffDays = Math.floor(diffMs / 86400000)

                          if (diffMins < 1) return 'Just now'
                          if (diffMins < 60) return `${diffMins}m ago`
                          if (diffHours < 24) return `${diffHours}h ago`
                          if (diffDays < 7) return `${diffDays}d ago`
                          return date.toLocaleDateString()
                        } catch {
                          return 'Recently'
                        }
                      })()}
                    </p>
                  </div>

                  {/* Action Menu */}
                  <div className="conversation-actions">
                    <button
                      className="action-menu-btn"
                      onClick={(e) => toggleConversationMenu(conv.id, e)}
                    >
                      ⋮
                    </button>
                    {selectedConversation === conv.id && (
                      <div className="action-menu">
                        {activeFilter !== 'archived' ? (
                          <>
                            <button onClick={(e) => handleArchive(conv.id, e)}>
                              📦 Archive
                            </button>
                            <button onClick={(e) => handleMute(conv.id, e)}>
                              {conv.isMuted ? '🔔 Unmute' : '🔇 Mute'}
                            </button>
                          </>
                        ) : (
                          <button onClick={(e) => handleUnarchive(conv.id, e)}>
                            📤 Unarchive
                          </button>
                        )}
                        <button onClick={(e) => handleDelete(conv.id, e)} className="delete-action">
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>
              {searchQuery ? 'No conversations found' :
               activeFilter === 'unread' ? 'No unread messages' :
               activeFilter === 'archived' ? 'No archived conversations' :
               'No conversations yet'}
            </h2>
            <p>
              {searchQuery ? `No results for "${searchQuery}"` :
               activeFilter === 'unread' ? 'All caught up! No unread messages.' :
               activeFilter === 'archived' ? 'No archived conversations.' :
               'Start a conversation by messaging a seller about their product'}
            </p>
            {!searchQuery && activeFilter === 'all' && (
              <button
                className="btn-primary"
                onClick={() => navigate('/products')}
              >
                Browse Products
              </button>
            )}
            {searchQuery && (
              <button
                className="btn-secondary"
                onClick={() => setSearchQuery('')}
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversationModal && (
        <NewConversationModal
          onClose={() => setShowNewConversationModal(false)}
          onSuccess={(conversationId) => {
            setShowNewConversationModal(false)
            navigate(`/messages/${conversationId}`)
          }}
        />
      )}
    </div>
  )
}

// New Conversation Modal Component
const NewConversationModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: (id: string) => void }) => {
  const toast = useToast()
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await api.get('/products?limit=50&status=active')
      if (response.data.success) {
        setProducts(response.data.data)
      }
    } catch (err) {
      toast.error('Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleStartConversation = async (productId: string) => {
    try {
      const response = await api.post('/messages/conversations', { listing_id: productId })
      if (response.data.success) {
        toast.success('Conversation started!')
        onSuccess(response.data.data.id)
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to start conversation')
    }
  }

  const filteredProducts = products.filter(product =>
    product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.seller?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>✏️ Start New Conversation</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="modal-search"
          />

          {loading ? (
            <div className="modal-loading">Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <div className="products-grid">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="product-card-modal"
                  onClick={() => handleStartConversation(product.id)}
                >
                  {product.images?.[0] ? (
                    <img src={getImageUrl(product.images[0])} alt={product.title} />
                  ) : (
                    <div className="product-placeholder">No Image</div>
                  )}
                  <div className="product-info-modal">
                    <h4>{product.title}</h4>
                    <p className="product-price-modal">{formatPriceWithCurrency(product.price).primary}</p>
                    <p className="product-seller">by {product.seller?.name}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="modal-empty">
              <p>No products found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Messages
