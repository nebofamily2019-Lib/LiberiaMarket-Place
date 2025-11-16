import api from './api'

export interface Notification {
  id: string
  user_id: string
  type: 'message' | 'product' | 'job' | 'system' | 'review'
  title: string
  message: string
  link?: string
  isRead: boolean
  created_at: string
}

export interface NotificationListResponse {
  success: boolean
  count: number
  unreadCount: number
  data: Notification[]
}

export interface NotificationResponse {
  success: boolean
  data: Notification
  message?: string
}

const notificationService = {
  // Get user's notifications
  getNotifications: async (page = 1, limit = 20): Promise<NotificationListResponse> => {
    const response = await api.get<NotificationListResponse>('/notifications', {
      params: { page, limit }
    })
    return response.data
  },

  // Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<{ success: boolean; count: number }>('/notifications/unread-count')
    return response.data.count
  },

  // Mark notification as read
  markAsRead: async (id: string): Promise<void> => {
    await api.patch(`/notifications/${id}/read`)
  },

  // Mark all as read
  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all')
  },

  // Delete notification
  deleteNotification: async (id: string): Promise<void> => {
    await api.delete(`/notifications/${id}`)
  }
}

export default notificationService
