import api from '../utils/api'
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
    const response = await api.get<MessageListResponse>(`/messages/conversations/${conversationId}/messages`, {
      params: { page, limit }
    })
    return response.data
  },

  // Send a message to a conversation
  sendMessage: async (conversationId: string, content: string): Promise<Message> => {
    const response = await api.post<MessageResponse>(`/messages/conversations/${conversationId}/messages`, {
      content
    })
    return response.data.data
  },

  // Create or get conversation (requires product listing)
  createConversation: async (listingId: string) => {
    const response = await api.post('/messages/conversations', {
      listing_id: listingId
    })
    return response.data
  },

  // Mark conversation as read
  markConversationAsRead: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/read`)
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; unreadCount: number }>('/messages/unread-count')
    return response.data.unreadCount
  },

  // Delete conversation
  deleteConversation: async (conversationId: string): Promise<void> => {
    await api.delete(`/messages/conversations/${conversationId}`)
  },

  // Archive conversation
  archiveConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/archive`)
  },

  // Unarchive conversation
  unarchiveConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/unarchive`)
  },

  // Mute conversation
  muteConversation: async (conversationId: string): Promise<void> => {
    await api.patch(`/messages/conversations/${conversationId}/mute`)
  }
}

export default messageService
