import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

interface TypingData {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

interface UserStatusData {
  userId: string;
  status: 'online' | 'offline';
  timestamp: string;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  onNotification: (callback: (notification: Notification) => void) => void;
  offNotification: (callback: (notification: Notification) => void) => void;
  // Messaging events
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onNewMessage: (callback: (data: { conversationId: string; message: Message }) => void) => void;
  offNewMessage: (callback: (data: { conversationId: string; message: Message }) => void) => void;
  // Typing indicators
  sendTypingStart: (conversationId: string) => void;
  sendTypingStop: (conversationId: string) => void;
  onUserTyping: (callback: (data: TypingData) => void) => void;
  offUserTyping: (callback: (data: TypingData) => void) => void;
  // User status
  onUserStatus: (callback: (data: UserStatusData) => void) => void;
  offUserStatus: (callback: (data: UserStatusData) => void) => void;
}

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = (): UseSocketReturn => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection
    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket.io connected:', newSocket.id);
      setIsConnected(true);
    });

    newSocket.on('connected', (data) => {
      console.log('🔌 Socket.io welcome message:', data);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket.io disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
      setIsConnected(false);
    });

    newSocket.on('error', (error) => {
      console.error('❌ Socket.io error:', error);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [isAuthenticated]);

  // Notification events
  const onNotification = useCallback((callback: (notification: Notification) => void) => {
    if (socket) {
      socket.on('notification', callback);
    }
  }, [socket]);

  const offNotification = useCallback((callback: (notification: Notification) => void) => {
    if (socket) {
      socket.off('notification', callback);
    }
  }, [socket]);

  // Join/Leave conversation rooms
  const joinConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('join_conversation', conversationId);
      console.log('🔗 Joined conversation room:', conversationId);
    }
  }, [socket, isConnected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('leave_conversation', conversationId);
      console.log('🔗 Left conversation room:', conversationId);
    }
  }, [socket, isConnected]);

  // New message events
  const onNewMessage = useCallback((callback: (data: { conversationId: string; message: Message }) => void) => {
    if (socket) {
      socket.on('new_message', callback);
    }
  }, [socket]);

  const offNewMessage = useCallback((callback: (data: { conversationId: string; message: Message }) => void) => {
    if (socket) {
      socket.off('new_message', callback);
    }
  }, [socket]);

  // Typing indicators
  const sendTypingStart = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_start', { conversationId });
    }
  }, [socket, isConnected]);

  const sendTypingStop = useCallback((conversationId: string) => {
    if (socket && isConnected) {
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket, isConnected]);

  const onUserTyping = useCallback((callback: (data: TypingData) => void) => {
    if (socket) {
      socket.on('user_typing', callback);
    }
  }, [socket]);

  const offUserTyping = useCallback((callback: (data: TypingData) => void) => {
    if (socket) {
      socket.off('user_typing', callback);
    }
  }, [socket]);

  // User status
  const onUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    if (socket) {
      socket.on('user_status', callback);
    }
  }, [socket]);

  const offUserStatus = useCallback((callback: (data: UserStatusData) => void) => {
    if (socket) {
      socket.off('user_status', callback);
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    onNotification,
    offNotification,
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
  };
};
