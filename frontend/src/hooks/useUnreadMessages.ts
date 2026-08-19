import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import messageService from '../services/messageService'

/**
 * Polls the /messages/unread-count endpoint and returns the current count.
 * Returns 0 when the user is not authenticated.
 */
const useUnreadMessages = (pollIntervalMs = 60_000): number => {
  const { isAuthenticated } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0)
      return
    }

    let cancelled = false

    const fetchCount = async () => {
      try {
        const n = await messageService.getUnreadCount()
        if (!cancelled) setCount(n)
      } catch {
        // silently ignore – don't crash the page if the endpoint is unreachable
      }
    }

    fetchCount()
    const timer = setInterval(fetchCount, pollIntervalMs)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [isAuthenticated, pollIntervalMs])

  return count
}

export default useUnreadMessages
