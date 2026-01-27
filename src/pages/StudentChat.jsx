import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import { setupCourseMessageChannel, setupPresenceTracking } from '../services/realtimeService'
import './StudentChat.css'

function StudentChat({ courseId, course }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [onlineUsers, setOnlineUsers] = useState(new Set())
  const messagesEndRef = useRef(null)
  const messageChannelRef = useRef(null)
  const presenceChannelRef = useRef(null)

  const isGroupCourse = course?.course_type === 'group'

  // Load messages and set up realtime
  useEffect(() => {
    if (courseId && user) {
      loadMessages()
      setupRealtimeSubscriptions()
    }

    return () => {
      // Cleanup subscriptions
      if (messageChannelRef.current) {
        messageChannelRef.current.unsubscribe()
      }
      if (presenceChannelRef.current) {
        presenceChannelRef.current.unsubscribe()
      }
    }
  }, [courseId, user])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError('')

      let messagesData
      if (isGroupCourse) {
        // Load group messages
        messagesData = await handleApiCall(api.messages.getCourse, courseId, user.id)
      } else {
        // Load 1-on-1 conversation with instructor
        messagesData = await handleApiCall(api.messages.getConversation, courseId, user.id, course.instructor_id)
      }

      setMessages(messagesData || [])
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Set up message channel
    messageChannelRef.current = setupCourseMessageChannel(courseId, {
      onMessage: (newMessage) => {
        console.log('📨 Received new message:', newMessage)

        // Add message if it's relevant to current view
        if (isGroupCourse && !newMessage.recipient_id) {
          // Group message
          setMessages(prev => [...prev, newMessage])
        } else if (!isGroupCourse) {
          // 1-on-1 message for this student
          if (
            (newMessage.sender_id === course.instructor_id && newMessage.recipient_id === user.id) ||
            (newMessage.sender_id === user.id && newMessage.recipient_id === course.instructor_id)
          ) {
            setMessages(prev => [...prev, newMessage])
          }
        }
      }
    })

    // Set up presence tracking
    presenceChannelRef.current = setupPresenceTracking(
      courseId,
      user.id,
      {
        name: user.full_name || `${user.firstName} ${user.lastName}`,
        role: 'student'
      },
      {
        onSync: (state) => {
          const online = new Set()
          Object.values(state).forEach(presences => {
            presences.forEach(presence => {
              if (presence.user_id !== user.id) {
                online.add(presence.user_id)
              }
            })
          })
          setOnlineUsers(online)
        }
      }
    )
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || sending) return

    try {
      setSending(true)

      const messageData = {
        content: newMessage.trim(),
        recipient_id: !isGroupCourse ? course.instructor_id : null
      }

      await handleApiCall(api.messages.send, courseId, messageData, user.id)

      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      })
    }
  }

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  const isInstructorOnline = () => {
    return isUserOnline(course?.instructor_id)
  }

  if (loading) {
    return (
      <div className="student-chat">
        <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="student-chat">
        <div className="error-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadMessages} className="btn-primary" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="student-chat">
      <h2>
        {isGroupCourse ? '💬 Class Chat' : '💬 Chat with Your Instructor'}
        {!isGroupCourse && isInstructorOnline() && (
          <span className="online-indicator" title="Instructor is online">🟢</span>
        )}
      </h2>

      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <p>
          {isGroupCourse
            ? 'Chat with your instructor and classmates'
            : 'Private conversation - only you and your instructor can see these messages'}
        </p>
      </div>

      <div className="chat-container">
        <div className="chat-messages">
          {messages.length > 0 ? (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`chat-message ${msg.sender_id === user.id ? 'own' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.sender_id === user.id ? 'You' : msg.profiles?.full_name || 'Instructor'}
                      {msg.sender_id === course.instructor_id && ' (Instructor)'}
                      {msg.sender_id !== user.id && isUserOnline(msg.sender_id) && (
                        <span className="online-indicator" title="Online">🟢</span>
                      )}
                    </span>
                    <span className="message-time">{formatTime(msg.created_at)}</span>
                  </div>
                  <div className="message-content">{msg.content}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </>
          ) : (
            <div className="empty-chat">
              <p>No messages yet. Start the conversation!</p>
            </div>
          )}
        </div>

        <div className="chat-input-container">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage(e)
              }
            }}
            placeholder="Type your message..."
            className="chat-input"
            rows="3"
            disabled={sending}
          />
          <button
            onClick={handleSendMessage}
            className="btn-primary send-button"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentChat
