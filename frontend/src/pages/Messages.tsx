import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import '../styles/Messages.css'
import { getCurrentUser } from '../utils/user'

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
  unreadCount: number
}

const Messages = () => {
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await api.get('/conversations')
      
      if (response.data.success) {
        setConversations(response.data.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`)
  }

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
        <h1>💬 My Messages</h1>

        {error && (
          <div className="error-message">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {conversations.length > 0 ? (
          <div className="conversations-list">
            {conversations.map((conv) => {
              const lastMessage = conv.messages?.[0]
              const currentUser = getCurrentUser()
              const otherUser = conv.buyer.id === currentUser?.id
                ? conv.seller
                : conv.buyer

              return (
                <div
                  key={conv.id}
                  className={`conversation-card ${conv.unreadCount > 0 ? 'unread' : ''}`}
                  onClick={() => handleConversationClick(conv.id)}
                >
                  <div className="conversation-product">
                    {conv.listing.images?.[0] ? (
                      <img 
                        src={`http://localhost:5000${conv.listing.images[0]}`} 
                        alt={conv.listing.title}
                      />
                    ) : (
                      <div className="no-image">📦</div>
                    )}
                  </div>

                  <div className="conversation-info">
                    <div className="conversation-header">
                      <h3>{conv.listing.title}</h3>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                    
                    <p className="conversation-user">
                      💬 with {otherUser.name}
                    </p>

                    {lastMessage && (
                      <p className="last-message">
                        {lastMessage.content.substring(0, 80)}
                        {lastMessage.content.length > 80 ? '...' : ''}
                      </p>
                    )}

                    <p className="conversation-time">
                      {new Date(conv.lastMessageAt || conv.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h2>No conversations yet</h2>
            <p>Start a conversation by messaging a seller about their product</p>
            <button 
              className="btn-primary"
              onClick={() => navigate('/products')}
            >
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Messages
