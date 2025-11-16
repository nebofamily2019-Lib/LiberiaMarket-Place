import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import messageService, { Conversation, Message } from '../services/messageService'
import VoiceButton from '../components/VoiceButton'

const Inbox = () => {
  const { user, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMessage, setSendingMessage] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    fetchConversations()
  }, [isAuthenticated, navigate])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const response = await messageService.getConversations()
      setConversations(response.data)
    } catch (error) {
      console.error('Error fetching conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await messageService.getMessages(conversationId)
      setMessages(response.data)
      // Mark as read
      await messageService.markConversationAsRead(conversationId)
      // Update conversation unread count
      setConversations(conversations.map(c =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      ))
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      const otherUserId = selectedConversation.participant1_id === user?.id
        ? selectedConversation.participant2_id
        : selectedConversation.participant1_id

      const message = await messageService.sendMessage(otherUserId, newMessage.trim())
      setMessages([...messages, message])
      setNewMessage('')
      // Refresh conversations to update last message
      fetchConversations()
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSendingMessage(false)
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '40px', textAlign: 'center' }}>
        <h2>Loading messages...</h2>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '40px', paddingBottom: '80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', marginBottom: 'var(--space-sm)' }}>
          Inbox 💬
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-lg)' }}>
          Your messages and conversations
        </p>
      </div>

      {/* Messages Interface */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedConversation ? '1fr 2fr' : '1fr', gap: 'var(--space-lg)', minHeight: '500px' }}>
        {/* Conversations List */}
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', margin: 0 }}>
              Conversations
            </h3>
          </div>

          {conversations.length === 0 ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: 'var(--space-md)' }}>💬</div>
              <p style={{ color: 'var(--color-text-secondary)' }}>
                No conversations yet
              </p>
            </div>
          ) : (
            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setSelectedConversation(conversation)}
                  style={{
                    padding: 'var(--space-lg)',
                    borderBottom: '1px solid var(--color-border)',
                    cursor: 'pointer',
                    backgroundColor: selectedConversation?.id === conversation.id ? '#f0f8ff' : 'transparent',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation?.id !== conversation.id) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation?.id !== conversation.id) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: 'var(--space-xs)' }}>
                    <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 'bold', margin: 0 }}>
                      {conversation.otherUser?.name || 'Unknown User'}
                    </h4>
                    {conversation.unreadCount > 0 && (
                      <span
                        style={{
                          backgroundColor: 'var(--color-primary)',
                          color: 'white',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: 'bold'
                        }}
                      >
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  {conversation.lastMessage && (
                    <>
                      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)', margin: 0, marginBottom: 'var(--space-xs)' }}>
                        {conversation.lastMessage.content.length > 50
                          ? `${conversation.lastMessage.content.substring(0, 50)}...`
                          : conversation.lastMessage.content}
                      </p>
                      <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-tertiary)', margin: 0 }}>
                        {new Date(conversation.lastMessage.created_at).toLocaleString()}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Thread */}
        {selectedConversation && (
          <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column', maxHeight: '650px' }}>
            {/* Thread Header */}
            <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-tertiary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'bold', margin: 0 }}>
                    {selectedConversation.otherUser?.name || 'Unknown User'}
                  </h3>
                  <VoiceButton
                    text={`Conversation with ${selectedConversation.otherUser?.name || 'Unknown User'}`}
                    size="small"
                    ariaLabel="Listen to conversation info"
                  />
                </div>
                <button
                  onClick={() => setSelectedConversation(null)}
                  style={{
                    padding: '4px 8px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'var(--font-size-lg)'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, padding: 'var(--space-lg)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>
                  <p style={{ color: 'var(--color-text-secondary)' }}>
                    No messages yet. Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isOwnMessage = message.sender_id === user?.id
                  return (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        justifyContent: isOwnMessage ? 'flex-end' : 'flex-start'
                      }}
                    >
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: 'var(--space-md)',
                          borderRadius: '12px',
                          backgroundColor: isOwnMessage ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                          color: isOwnMessage ? 'white' : 'var(--color-text-primary)'
                        }}
                      >
                        <p style={{ fontSize: 'var(--font-size-md)', margin: 0, marginBottom: 'var(--space-xs)' }}>
                          {message.content}
                        </p>
                        <p style={{
                          fontSize: 'var(--font-size-xs)',
                          margin: 0,
                          opacity: 0.8,
                          textAlign: 'right'
                        }}>
                          {new Date(message.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  disabled={sendingMessage}
                  style={{ flex: 1 }}
                />
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={!newMessage.trim() || sendingMessage}
                >
                  {sendingMessage ? 'Sending...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default Inbox
