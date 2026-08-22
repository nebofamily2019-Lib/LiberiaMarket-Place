import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useSocket } from '../hooks/useSocket'
import api from '../utils/api'
import { getThumbnailUrl } from '../utils/env'
import { formatPriceWithCurrency } from '../utils/currency'
import HamburgerMenu from '../components/HamburgerMenu'
import MessageBubble from '../components/MessageBubble'
import VoiceRecorder from '../components/VoiceRecorder'
import '../styles/MessageThread.css'

interface Message {
  id: string
  conversation_id: string
  sender_id: string
  content: string
  audioUrl?: string
  messageType?: 'text' | 'audio' | 'image'
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
  const {
    isConnected,
    joinConversation,
    leaveConversation,
    onNewMessage,
    offNewMessage,
    sendTypingStart,
    sendTypingStop,
    onUserTyping,
    offUserTyping,
    onUserStatus,
    offUserStatus
  } = useSocket()
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false)
  const [isOtherUserOnline, setIsOtherUserOnline] = useState(false)
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [audioUrl, setAudioUrl] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial data
  useEffect(() => {
    if (id) {
      fetchConversation()
      fetchMessages()
    }
  }, [id])

  // Join/leave conversation room via WebSocket
  useEffect(() => {
    if (id && isConnected) {
      joinConversation(id)
      console.log('✅ Joined conversation via WebSocket:', id)

      return () => {
        leaveConversation(id)
        console.log('👋 Left conversation:', id)
      }
    }
  }, [id, isConnected, joinConversation, leaveConversation])

  // Listen for new messages via WebSocket
  useEffect(() => {
    const handleNewMessage = (data: { conversationId: string; message: any }) => {
      if (data.conversationId === id) {
        // Skip our own messages - they're already added via the optimistic
        // update + API response in handleSendMessage. Without this, our own
        // sent message shows up twice (once from the optimistic/API flow,
        // once from this socket echo).
        if (data.message.sender_id === user?.id) {
          return
        }

        console.log('📨 New message received via WebSocket:', data.message)

        // Only add if not already in messages (prevent duplicates)
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === data.message.id)
          if (exists) {
            console.log('Message already exists, skipping duplicate')
            return prev
          }
          return [...prev, data.message]
        })
        scrollToBottom()
      }
    }

    onNewMessage(handleNewMessage)

    return () => {
      offNewMessage(handleNewMessage)
    }
  }, [id, user?.id, onNewMessage, offNewMessage])

  // Listen for typing indicators
  useEffect(() => {
    const handleTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === id && data.userId !== user?.id) {
        console.log('⌨️ User typing status:', data.isTyping)
        setIsOtherUserTyping(data.isTyping)
      }
    }

    onUserTyping(handleTyping)

    return () => {
      offUserTyping(handleTyping)
    }
  }, [id, user?.id, onUserTyping, offUserTyping])

  // Listen for user online/offline status
  useEffect(() => {
    const handleUserStatus = (data: { userId: string; status: string }) => {
      const otherUserId = conversation?.buyer.id === user?.id
        ? conversation?.seller.id
        : conversation?.buyer.id

      if (data.userId === otherUserId) {
        console.log('🟢 User status changed:', data.status)
        setIsOtherUserOnline(data.status === 'online')
      }
    }

    onUserStatus(handleUserStatus)

    return () => {
      offUserStatus(handleUserStatus)
    }
  }, [conversation, user?.id, onUserStatus, offUserStatus])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversation = async () => {
    try {
      const response = await api.get('/messages/conversations')
      if (response.data.success) {
        const conv = response.data.data.find((c: any) => c.id === id)
        if (conv) {
          setConversation(conv)
        } else {
          setError('Conversation not found')
        }
      }
    } catch (err: any) {
      console.error('Failed to load conversation', err)

      let errorMessage = 'Failed to load conversation'
      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Please check your network.'
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to view this conversation.'
      } else if (err.status === 404) {
        errorMessage = 'Conversation not found.'
      }

      setError(errorMessage)
    }
  }

  const fetchMessages = async (silent = false) => {
    try {
      if (!silent) setLoading(true)

      const response = await api.get(`/messages/conversations/${id}/messages`)

      if (response.data.success) {
        setMessages(response.data.data)
        // Clear any previous errors on successful fetch
        if (!silent) setError('')
      }
    } catch (err: any) {
      if (!silent) {
        console.error('Failed to load messages', err)

        let errorMessage = 'Failed to load messages'
        if (!navigator.onLine) {
          errorMessage = 'No internet connection. Please check your network.'
        } else if (err.status === 403) {
          errorMessage = 'You do not have permission to view these messages.'
        } else if (err.status === 404) {
          errorMessage = 'Conversation not found.'
        } else if (err.message) {
          errorMessage = err.message
        }

        setError(errorMessage)
      }
    } finally {
      if (!silent) setLoading(false)
    }
  }

  const handleRetryMessages = () => {
    setError('')
    fetchMessages(false)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value)

    // Send typing indicator
    if (id) {
      sendTypingStart(id)

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        sendTypingStop(id)
      }, 2000)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if ((!newMessage.trim() && !audioBlob) || sending) return

    // Stop typing indicator
    if (id) {
      sendTypingStop(id)
    }

    // Check internet connection before sending
    if (!navigator.onLine) {
      toast.error('No internet connection. Please check your network.')
      return
    }

    const messageContent = newMessage.trim()
    const tempId = `temp-${Date.now()}`

    // Optimistically add message to UI immediately (only for text)
    if (messageContent && !audioBlob) {
      const optimisticMessage: Message = {
        id: tempId,
        conversation_id: id!,
        sender_id: user!.id,
        content: messageContent,
        isRead: false,
        createdAt: new Date().toISOString(),
        sender: {
          id: user!.id,
          name: user!.name
        }
      }
      setMessages(prev => [...prev, optimisticMessage])
      setNewMessage('')
      scrollToBottom()
    }

    try {
      setSending(true)
      setError('')

      let response;
      
      if (audioBlob) {
        const formData = new FormData()
        if (messageContent) formData.append('content', messageContent)
        formData.append('audio', audioBlob, 'voice-note.webm')
        
        response = await api.post(`/messages/conversations/${id}/messages`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
      } else {
        response = await api.post(`/messages/conversations/${id}/messages`, {
          content: messageContent
        })
      }

      if (response.data.success) {
        const realMessage = response.data.data;
        
        if (messageContent && !audioBlob) {
          // Replace temporary message with real one from server
          setMessages(prev =>
            prev.map(msg =>
              msg.id === tempId ? realMessage : msg
            )
          )
        } else {
          // For audio (no optimistic update), just add it
          setMessages(prev => [...prev, realMessage])
          setNewMessage('')
          setAudioBlob(null)
          setAudioUrl('')
          setShowVoiceRecorder(false)
        }
        scrollToBottom()
      }
    } catch (err: any) {
      console.error('Failed to send message', err)

      // Remove the optimistic message on failure
      if (newMessage.trim() && !audioBlob) {
        setMessages(prev => prev.filter(msg => msg.id !== tempId))
      }

      let errorMessage = 'Failed to send message'

      if (!navigator.onLine) {
        errorMessage = 'No internet connection. Message not sent.'
      } else if (err.status === 400) {
        errorMessage = err.message || 'Invalid message content'
      } else if (err.status === 403) {
        errorMessage = 'You do not have permission to send messages in this conversation.'
      } else if (err.message) {
        errorMessage = err.message
      }

      toast.error(errorMessage)
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
              <div className="user-avatar-container">
                <div className="user-avatar">
                  {otherUser?.name.charAt(0).toUpperCase()}
                </div>
                {isOtherUserOnline && (
                  <span className="online-indicator" title="Online"></span>
                )}
              </div>
              <div>
                <h2>{otherUser?.name}</h2>
                <p>{otherUser?.phone}</p>
                {isOtherUserOnline && (
                  <span className="status-text">Online</span>
                )}
              </div>
            </div>
            
            <div className="thread-product" onClick={() => navigate(`/products/${conversation.listing.id}`)}>
              {conversation.listing.images?.[0] ? (
                <img
                  src={getThumbnailUrl(conversation.listing.images[0])}
                  alt={conversation.listing.title}
                />
              ) : (
                <div className="no-image">No Image</div>
              )}
              <div>
                <h4>{conversation.listing.title}</h4>
                <p className="product-price">{formatPriceWithCurrency(conversation.listing.price).primary}</p>
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
              <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
                <button
                  onClick={handleRetryMessages}
                  style={{
                    padding: '0.5rem 1rem',
                    background: '#0066cc',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600
                  }}
                >
                  🔄 Retry
                </button>
                <button onClick={() => setError('')}>✕</button>
              </div>
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
              {isOtherUserTyping && (
                <div className="typing-indicator">
                  <div className="typing-bubble">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <span className="typing-text">{otherUser?.name} is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="empty-messages">
              <div className="empty-icon">💬</div>
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        {/* Voice Recorder */}
        {showVoiceRecorder && (
          <div className="voice-recorder-wrapper" style={{ padding: '0.5rem', background: '#f8f9fa', borderTop: '1px solid #dee2e6' }}>
            <VoiceRecorder
              onRecordingComplete={(blob, url) => {
                setAudioBlob(blob)
                setAudioUrl(url)
              }}
              onRecordingDelete={() => {
                setAudioBlob(null)
                setAudioUrl('')
              }}
              existingAudioUrl={audioUrl}
              label="Voice Note"
              helpText="Record a message"
            />
          </div>
        )}

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="message-input-form">
          <div className="input-wrapper">
            <button
              type="button"
              onClick={() => setShowVoiceRecorder(!showVoiceRecorder)}
              className="voice-toggle-btn"
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0 0.5rem',
                marginRight: '0.5rem',
                opacity: showVoiceRecorder ? 1 : 0.6
              }}
              title="Record Voice Note"
            >
              🎤
            </button>
            <textarea
              value={newMessage}
              onChange={handleMessageChange}
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
              disabled={sending || (!newMessage.trim() && !audioBlob)}
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
          <div className="input-footer">
            <p className="input-hint">
              Press Enter to send, Shift+Enter for new line
            </p>
            {!isConnected && (
              <span className="connection-status offline">⚠️ Real-time updates disabled - Messages will still send</span>
            )}
            {isConnected && (
              <span className="connection-status online">✅ Real-time connected</span>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default MessageThread
