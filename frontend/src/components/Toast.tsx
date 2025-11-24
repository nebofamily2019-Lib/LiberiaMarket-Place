import { useEffect, useState } from 'react'
import { Toast as ToastType, useToast } from '../context/ToastContext'
import '../styles/Toast.css'

interface ToastProps {
  toast: ToastType
}

const Toast = ({ toast }: ToastProps) => {
  const { removeToast } = useToast()
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Start exit animation before removal
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        setIsExiting(true)
        setTimeout(() => removeToast(toast.id), 300) // Match animation duration
      }, toast.duration - 300)

      return () => clearTimeout(timer)
    }
  }, [toast.id, toast.duration, removeToast])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => removeToast(toast.id), 300)
  }

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return '✅'
      case 'error':
        return '❌'
      case 'warning':
        return '⚠️'
      case 'info':
        return 'ℹ️'
      default:
        return '📢'
    }
  }

  return (
    <div className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}>
      <span className="toast-icon">{getIcon()}</span>
      <span className="toast-message">{toast.message}</span>
      <button
        onClick={handleClose}
        className="toast-close"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
