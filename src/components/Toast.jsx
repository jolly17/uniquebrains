import { useState, useEffect, createContext, useContext, useCallback } from 'react'
import { createPortal } from 'react-dom'
import './Toast.css'

// Toast Context for global toast management
const ToastContext = createContext(null)

/**
 * Toast Provider Component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    const newToast = {
      id,
      duration: 5000,
      ...toast
    }
    
    setToasts(prev => [...prev, newToast])
    
    // Auto-remove toast after duration
    if (newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, newToast.duration)
    }
    
    return id
  }, [])

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  // Convenience methods
  const toast = {
    show: (message, options = {}) => addToast({ message, type: 'default', ...options }),
    success: (message, options = {}) => addToast({ message, type: 'success', ...options }),
    error: (message, options = {}) => addToast({ message, type: 'error', ...options }),
    warning: (message, options = {}) => addToast({ message, type: 'warning', ...options }),
    info: (message, options = {}) => addToast({ message, type: 'info', ...options }),
  }

  return (
    <ToastContext.Provider value={{ toast, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

/**
 * useToast Hook
 * Access toast functions from any component
 */
export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context.toast
}

/**
 * Toast Container Component
 * Renders all active toasts
 */
function ToastContainer({ toasts, onRemove }) {
  if (toasts.length === 0) return null

  return createPortal(
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map(toast => (
        <ToastItem 
          key={toast.id} 
          toast={toast} 
          onClose={() => onRemove(toast.id)} 
        />
      ))}
    </div>,
    document.body
  )
}

/**
 * Toast Item Component
 * Individual toast notification
 */
function ToastItem({ toast, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(onClose, 200) // Wait for exit animation
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
        return '💬'
    }
  }

  return (
    <div 
      className={`toast toast-${toast.type} ${isExiting ? 'toast-exit' : ''}`}
      role="alert"
      aria-live={toast.type === 'error' ? 'assertive' : 'polite'}
    >
      <span className="toast-icon" aria-hidden="true">{getIcon()}</span>
      <div className="toast-content">
        {toast.title && <strong className="toast-title">{toast.title}</strong>}
        <p className="toast-message">{toast.message}</p>
      </div>
      <button 
        className="toast-close" 
        onClick={handleClose}
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  )
}

/**
 * Standalone Toast Component
 * For use without the provider (controlled mode)
 */
export function Toast({ 
  type = 'default',
  title,
  message,
  icon,
  isVisible = true,
  onClose,
  duration = 5000,
  position = 'top-right'
}) {
  const [show, setShow] = useState(isVisible)

  useEffect(() => {
    setShow(isVisible)
  }, [isVisible])

  useEffect(() => {
    if (show && duration > 0) {
      const timer = setTimeout(() => {
        setShow(false)
        onClose?.()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show) return null

  const getIcon = () => {
    if (icon) return icon
    switch (type) {
      case 'success': return '✅'
      case 'error': return '❌'
      case 'warning': return '⚠️'
      case 'info': return 'ℹ️'
      default: return '💬'
    }
  }

  return createPortal(
    <div className={`toast-standalone toast-position-${position}`}>
      <div 
        className={`toast toast-${type}`}
        role="alert"
        aria-live={type === 'error' ? 'assertive' : 'polite'}
      >
        <span className="toast-icon" aria-hidden="true">{getIcon()}</span>
        <div className="toast-content">
          {title && <strong className="toast-title">{title}</strong>}
          <p className="toast-message">{message}</p>
        </div>
        {onClose && (
          <button 
            className="toast-close" 
            onClick={onClose}
            aria-label="Dismiss notification"
          >
            ×
          </button>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Toast