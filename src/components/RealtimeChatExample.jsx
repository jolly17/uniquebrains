import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCourseMessages, usePresence } from '../hooks/useRealtime'
import { sendMessage, getCourseMessages } from '../services/messageService'

/**
 * Example component demonstrating realtime chat with Supabase
 * This replaces the polling-based approach with true realtime updates
 */
function RealtimeChatExample({ courseId }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const messagesEndRef = useRef(null)

  // Set up realtime message channel
  const { isConnected: isMessageChannelConnected } = useCourseMessages(courseId, {
    onMessage: (newMsg) => {
      console.log('✅ New message received via realtime:', newMsg)
      // Add new message to state
      setMessages(prev => {
        // Check if message already exists (avoid duplicates)
        if (prev.some(m => m.id === newMsg.id)) {
          console.log('Message already exists, skipping')
          return prev
        }
        console.log('Adding new message to state')
        return [...prev, newMsg]
      })
      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }, 100)
    },
    onUpdate: (updatedMsg) => {
      console.log('Message updated via realtime:', updatedMsg)
      // Update message in state
      setMessages(prev => 
        prev.map(msg => msg.id === updatedMsg.id ? updatedMsg : msg)
      )
    },
    onDelete: (deletedMsg) => {
      console.log('Message deleted via realtime:', deletedMsg)
      // Remove message from state
      setMessages(prev => prev.filter(msg => msg.id !== deletedMsg.id))
    }
  })

  // Log connection status
  useEffect(() => {
    console.log('Message channel connected:', isMessageChannelConnected)
  }, [isMessageChannelConnected])

  // Set up presence tracking
  const { isConnected: isPresenceConnected, presenceState } = usePresence(
    courseId,
    user?.id,
    {
      full_name: user?.firstName + ' ' + user?.lastName,
      role: user?.role
    },
    {
      onJoin: (key, newPresences) => {
        console.log('User joined:', newPresences)
      },
      onLeave: (key, leftPresences) => {
        console.log('User left:', leftPresences)
      }
    }
  )

  // Load initial messages
  useEffect(() => {
    if (!courseId || !user?.id) return

    const loadMessages = async () => {
      try {
        setIsLoading(true)
        const msgs = await getCourseMessages(courseId, user.id, 50)
        setMessages(msgs)
      } catch (error) {
        console.error('Error loading messages:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [courseId, user?.id])

  // Scroll to bottom on initial load
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [isLoading, messages.length])

  const handleSendMessage = async (e) => {
    e.preventDefault()
    
    if (!newMessage.trim() || !user?.id) return

    try {
      // Send message - it will be broadcast automatically
      await sendMessage(courseId, {
        content: newMessage.trim()
      }, user.id)
      
      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message: ' + error.message)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Get online users count
  const onlineUsers = Object.keys(presenceState).length

  if (isLoading) {
    return <div>Loading messages...</div>
  }

  return (
    <div className="realtime-chat-example">
      <div className="chat-header">
        <h2>💬 Realtime Chat</h2>
        <div className="connection-status">
          <span className={isMessageChannelConnected ? 'connected' : 'disconnected'}>
            {isMessageChannelConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </span>
          {isPresenceConnected && (
            <span className="online-count">
              👥 {onlineUsers} online
            </span>
          )}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`message ${msg.sender_id === user?.id ? 'own-message' : ''}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {msg.profiles?.full_name || 'Unknown'}
                  {msg.profiles?.role === 'instructor' && ' (Instructor)'}
                </span>
                <span className="message-time">{formatTime(msg.created_at)}</span>
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="chat-input"
          disabled={!isMessageChannelConnected}
        />
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={!newMessage.trim() || !isMessageChannelConnected}
        >
          Send
        </button>
      </form>

      <div className="realtime-info">
        <p>
          ✨ This chat uses Supabase Realtime for instant message delivery.
          No polling required!
        </p>
      </div>
    </div>
  )
}

export default RealtimeChatExample
