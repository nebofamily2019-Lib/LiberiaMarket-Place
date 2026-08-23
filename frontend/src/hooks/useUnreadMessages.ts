import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import messageService from '../services/messageService'

/**
 * Shared polling store: BottomNav, HamburgerMenu, and Dashboard all render
 * at once on most pages and each used to call this hook independently,
 * tripling the /messages/unread-count polling traffic. All instances now
 * share one interval/fetch via this module-level store, keyed by subscriber
 * count, so there's exactly one poller no matter how many components mount.
 */
let sharedCount = 0
const subscribers = new Set<(n: number) => void>()
let intervalId: ReturnType<typeof setInterval> | undefined
let activePollIntervalMs: number | undefined

const notify = (n: number) => {
  sharedCount = n
  subscribers.forEach((cb) => cb(n))
}

const fetchCount = async () => {
  try {
    const n = await messageService.getUnreadCount()
    notify(n)
  } catch {
    // silently ignore – don't crash the page if the endpoint is unreachable
  }
}

const startPolling = (pollIntervalMs: number) => {
  if (intervalId && activePollIntervalMs === pollIntervalMs) return
  if (intervalId) clearInterval(intervalId)
  activePollIntervalMs = pollIntervalMs
  fetchCount()
  intervalId = setInterval(fetchCount, pollIntervalMs)
}

const stopPolling = () => {
  if (intervalId) clearInterval(intervalId)
  intervalId = undefined
  activePollIntervalMs = undefined
}

/**
 * Returns the current unread message count, polling
 * /messages/unread-count on a shared interval. Returns 0 when the user is
 * not authenticated.
 */
const useUnreadMessages = (pollIntervalMs = 60_000): number => {
  const { isAuthenticated } = useAuth()
  const [count, setCount] = useState(sharedCount)

  useEffect(() => {
    if (!isAuthenticated) {
      setCount(0)
      return
    }

    subscribers.add(setCount)
    setCount(sharedCount)
    startPolling(pollIntervalMs)

    return () => {
      subscribers.delete(setCount)
      if (subscribers.size === 0) stopPolling()
    }
  }, [isAuthenticated, pollIntervalMs])

  return count
}

export default useUnreadMessages
