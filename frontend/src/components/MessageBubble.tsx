import React from 'react'

interface MessageBubbleProps {
  message: {
    id: string
    content: string
    audioUrl?: string
    messageType?: 'text' | 'audio' | 'image'
    createdAt: string
    sender: {
      name: string
    }
    isRead: boolean
  }
  isOwn: boolean
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isOwn }) => {
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  return (
    <div className={`message-bubble ${isOwn ? 'own' : 'other'}`}>
      {!isOwn && (
        <div className="message-sender">{message.sender.name}</div>
      )}
      <div className="message-content">
        {message.audioUrl ? (
          <div className="audio-message">
            <audio 
              controls 
              src={`${(import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '')}${message.audioUrl}`} 
              style={{ maxWidth: '200px', height: '40px' }} 
            />
            {message.content && message.content !== '[Voice Message]' && (
              <div style={{ marginTop: '0.5rem' }}>{message.content}</div>
            )}
          </div>
        ) : (
          message.content
        )}
      </div>
      <div className="message-meta">
        <span className="message-time">{formatTime(message.createdAt)}</span>
        {isOwn && (
          <span className="message-status">
            {message.isRead ? '✓✓' : '✓'}
          </span>
        )}
      </div>
    </div>
  )
}

export default MessageBubble
