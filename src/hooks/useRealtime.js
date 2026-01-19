import { useEffect, useRef, useState } from 'react'
import {
  setupCourseMessageChannel,
  setupNotificationChannel,
  setupPresenceTracking,
  initializeConnectionManager,
  cleanupOnUnload
} from '../services/realtimeService'

/**
 * React hook for course message realtime updates
 * @param {string} courseId - Course ID
 * @param {Object} callbacks - Event callbacks
 * @returns {Object} Channel state and controls
 */
export function useCourseMessages(courseId, callbacks = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!courseId) return

    // Set up channel
    try {
      channelRef.current = setupCourseMessageChannel(courseId, callbacks)
      setIsConnected(true)
    } catch (error) {
      console.error('Error setting up course message channel:', error)
      setIsConnected(false)
    }

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [courseId]) // Only re-run if courseId changes

  return {
    isConnected,
    channel: channelRef.current
  }
}

/**
 * React hook for user notifications realtime updates
 * @param {string} userId - User ID
 * @param {Function} onNotification - Callback for new notifications
 * @returns {Object} Channel state and controls
 */
export function useNotifications(userId, onNotification) {
  const [isConnected, setIsConnected] = useState(false)
  const channelRef = useRef(null)

  useEffect(() => {
    if (!userId) return

    // Set up channel
    try {
      channelRef.current = setupNotificationChannel(userId, onNotification)
      setIsConnected(true)
    } catch (error) {
      console.error('Error setting up notification channel:', error)
      setIsConnected(false)
    }

    // Cleanup on unmount
    return () => {
      if (channelRef.current) {
        channelRef.current.unsubscribe()
        channelRef.current = null
        setIsConnected(false)
      }
    }
  }, [userId]) // Only re-run if userId changes

  return {
    isConnected,
    channel: channelRef.current
  }
}

/**
 * React hook for presence tracking
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @param {Object} userInfo - User information to share
 * @param {Object} callbacks - Event callbacks
 * @returns {Object} Presence state and controls
 */
export function usePresence(courseId, userId, userInfo = {}, callbacks = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [presenceState, setPresenceState] = useState({})
  const presenceRef = useRef(null)

  useEffect(() => {
    if (!courseId || !userId) return

    // Set up presence tracking
    try {
      presenceRef.current = setupPresenceTracking(courseId, userId, userInfo, {
        ...callbacks,
        onSync: (state) => {
          setPresenceState(state)
          if (callbacks.onSync) {
            callbacks.onSync(state)
          }
        }
      })
      setIsConnected(true)
    } catch (error) {
      console.error('Error setting up presence tracking:', error)
      setIsConnected(false)
    }

    // Cleanup on unmount
    return () => {
      if (presenceRef.current) {
        presenceRef.current.unsubscribe()
        presenceRef.current = null
        setIsConnected(false)
        setPresenceState({})
      }
    }
  }, [courseId, userId]) // Only re-run if courseId or userId changes

  return {
    isConnected,
    presenceState,
    presence: presenceRef.current
  }
}

/**
 * React hook for connection management
 * @param {Object} options - Configuration options
 * @returns {Object} Connection state and controls
 */
export function useConnectionManager(options = {}) {
  const [connectionState, setConnectionState] = useState('disconnected')
  const managerRef = useRef(null)

  useEffect(() => {
    // Initialize connection manager
    managerRef.current = initializeConnectionManager({
      ...options,
      onStateChange: (newState, oldState) => {
        setConnectionState(newState)
        if (options.onStateChange) {
          options.onStateChange(newState, oldState)
        }
      }
    })

    // Cleanup on unmount
    return () => {
      if (managerRef.current) {
        managerRef.current.cleanup()
        managerRef.current = null
      }
      cleanupOnUnload()
    }
  }, []) // Only run once on mount

  return {
    connectionState,
    disconnect: () => managerRef.current?.disconnect(),
    reconnect: () => managerRef.current?.reconnect(),
    isConnected: connectionState === 'connected',
    isConnecting: connectionState === 'connecting',
    hasError: connectionState === 'error'
  }
}
