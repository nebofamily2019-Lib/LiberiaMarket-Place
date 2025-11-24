import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import api from '../utils/api'
import HamburgerMenu from '../components/HamburgerMenu'
import MessageBubble from '../components/MessageBubble'
import '../styles/MessageThread.css'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
  }
}

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
}

const MessageThread = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (id) {
      fetchConversation()
      fetchMessages()
      
      // Poll for new messages every 5 seconds
      pollIntervalRef.current = setInterval(() => {
        fetchMessages(true) // Silent fetch (no loading state)
      }, 5000)
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
    }
  }, [id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await api.get('/conversations')
      if (response.data.success) {
        const conv = response.data.data.find((c: any) => c.id === id)
        if (conv) {
          setConversation(conv)
        }
      }
    } catch (err: any) {
      console.error('Failed to load conversation', err)
    }
  }

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      
      const response = await api.get(`/conversations/${id}/messages`)
      
      if (response.data.success) {
        setMessages(response.data.data)
      }
    } catch (err: any) {
      if (!silent) {
        setError(err.response?.data?.error || 'Failed to load messages')
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) return

    try {
      setSending(true)
      setError('')
      
      const response = await api.post(`/conversations/${id}/messages`, {
        content: newMessage.trim()
      })
      
      if (response.data.success) {
        setMessages([...messages, response.data.data])
        setNewMessage('')
        scrollToBottom()
        toast.success('Message sent! 📨')
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const otherUser = conversation 
    ? (conversation.buyer.id === user?.id ? conversation.seller : conversation.buyer)
    : null

  if (loading) {
    return (
      <div className="message-thread-container">
        <HamburgerMenu />
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading conversation...</p>
        </div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="message-thread-container">
        <HamburgerMenu />
        <div className="error-state">
          <h2>Conversation not found</h2>
          <button onClick={() => navigate('/messages')} className="btn-primary">
            Back to Messages
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="message-thread-container">
      <HamburgerMenu />
      
      <div className="message-thread-content">
        {/* Header */}
        <div className="thread-header">
          <button onClick={() => navigate('/messages')} className="back-btn">
            ← Back
          </button>
          
          <div className="thread-header-info">
            <div className="thread-user">
              <div className="user-avatar">
                {otherUser?.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2>{otherUser?.name}</h2>
                <p>{otherUser?.phone}</p>
              </div>
            </div>
            
            <div className="thread-product" onClick={() => navigate(`/products/${conversation.listing.id}`)}>
              {conversation.listing.images?.[0] ? (
                <img 
                  src={`http://localhost:5000${conversation.listing.images[0].replace('-original', '-thumbnail')}`}
                  alt={conversation.listing.title}
                />
              ) : (
                <div className="no-image">📦</div>
              )}
              <div>
                <h4>{conversation.listing.title}</h4>
                <p className="product-price">${conversation.listing.price}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div className="messages-area">
          {error && (
            <div className="error-banner">
              <span>⚠️</span>
              <span>{error}</span>
              <button onClick={() => setError('')}>✕</button>
            </div>
          )}

          {messages.length > 0 ? (
            <div className="messages-list">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={message.sender_id === user?.id}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-wrapper">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage(e)
                }
              }}
              disabled={sending}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={sending || !newMessage.trim()}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
          <p className="input-hint">
            Press Enter to send, Shift+Enter for new line
          </p>
        </form>
      </div>
    </div>
  )
}

export default MessageThread
