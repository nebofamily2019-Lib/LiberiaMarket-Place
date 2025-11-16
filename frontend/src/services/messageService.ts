import api from './api'
import { User } from './authService'

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  recipient_id: string
  content: string
  isRead: boolean
  created_at: string
  sender?: User
  recipient?: User
}

export interface Conversation {
  id: string
  participant1_id: string
  participant2_id: string
  lastMessage?: Message
  unreadCount: number
  created_at: string
  updated_at: string
  otherUser?: User
}

export interface ConversationListResponse {
  success: boolean
  count: number
  data: Conversation[]
}

export interface MessageListResponse {
  success: boolean
  count: number
  data: Message[]
}

export interface MessageResponse {
  success: boolean
  data: Message
  message?: string
}

const messageService = {
  // Get user's conversations
  getConversations: async (): Promise<ConversationListResponse> => {
    const response = await api.get<ConversationListResponse>('/messages/conversations')
    return response.data
  },

  // Get messages in a conversation
  getMessages: async (conversationId: string, page = 1, limit = 50): Promise<MessageListResponse> => {
    const response = await api.get<MessageListResponse>(`/messages/conversation/${conversationId}`, {
      params: { page, limit }
    })
    return response.data
  },

  // Send a message
  sendMessage: async (recipientId: string, content: string): Promise<Message> => {
    const response = await api.post<MessageResponse>('/messages', {
      recipient_id: recipientId,
      content
    })
    return response.data.data
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversation/${conversationId}/read`)
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; count: number }>('/messages/unread-count')
    return response.data.count
  },

  // Delete conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/messages/conversation/${conversationId}`)
  }
}

export default messageService
