import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import { setupCourseMessageChannel, setupPresenceTracking } from '../services/realtimeService'
import './CourseChat.css'

function CourseChat({ course }) {
  const { courseId } = useParams()
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [chatThreads, setChatThreads] = useState([])
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
  }, [courseId, user, selectedStudent])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load conversation threads for 1-on-1 courses
  useEffect(() => {
    if (!isGroupCourse && courseId && user) {
      loadConversationThreads()
    }
  }, [isGroupCourse, courseId, user, messages])

  const loadMessages = async () => {
    try {
      setLoading(true)
      setError('')

      let messagesData
      if (isGroupCourse) {
        // Load group messages
        messagesData = await handleApiCall(api.messages.getCourse, courseId, user.id)
      } else if (selectedStudent) {
        // Load 1-on-1 conversation
        messagesData = await handleApiCall(api.messages.getConversation, courseId, user.id, selectedStudent)
      } else {
        messagesData = []
      }

      setMessages(messagesData || [])
    } catch (err) {
      console.error('Error loading messages:', err)
      setError('Failed to load messages')
    } finally {
      setLoading(false)
    }
  }

  const loadConversationThreads = async () => {
    try {
      const threads = await handleApiCall(api.messages.getThreads, courseId, user.id)
      setChatThreads(threads || [])
    } catch (err) {
      console.error('Error loading conversation threads:', err)
    }
  }

  const setupRealtimeSubscriptions = () => {
    // Set up message channel
    messageChannelRef.current = setupCourseMessageChannel(courseId, {
      onMessage: (newMessage) => {
        console.log('📨 Received new message:', newMessage)
        
        // Don't add if it's our own message (we already added it locally)
        if (newMessage.sender_id === user.id) {
          console.log('Skipping own message from broadcast')
          return
        }
        
        // Add message if it's relevant to current view
        if (isGroupCourse && !newMessage.recipient_id) {
          // Group message
          setMessages(prev => [...prev, newMessage])
        } else if (!isGroupCourse && selectedStudent) {
          // 1-on-1 message for selected conversation
          if (
            (newMessage.sender_id === selectedStudent && newMessage.recipient_id === user.id) ||
            (newMessage.sender_id === user.id && newMessage.recipient_id === selectedStudent)
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
        role: 'instructor'
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
        recipient_id: !isGroupCourse && selectedStudent ? selectedStudent : null
      }

      const sentMessage = await handleApiCall(api.messages.send, courseId, messageData, user.id)

      // Immediately add the sent message to the local state
      if (sentMessage) {
        setMessages(prev => [...prev, sentMessage])
      }

      setNewMessage('')
    } catch (err) {
      console.error('Error sending message:', err)
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId)
  }

  const handleBackToThreads = () => {
    setSelectedStudent(null)
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

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return ''

    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now - date) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`

    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getSenderName = (msg) => {
    // If sender is a student (child profile), use their name
    if (msg.students && msg.students.first_name) {
      return `${msg.students.first_name} ${msg.students.last_name}`
    }
    // Otherwise use profile name
    return msg.profiles?.full_name || 'Unknown'
  }

  const getSelectedStudentName = () => {
    const thread = chatThreads.find(t => t.student.id === selectedStudent)
    return thread ? thread.student.full_name : ''
  }

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId)
  }

  if (loading) {
    return (
      <div className="course-chat">
        <div className="loading-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading chat...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="course-chat">
        <div className="error-state" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>{error}</p>
          <button onClick={loadMessages} className="btn-primary" style={{ marginTop: '1rem' }}>
            Try Again
          </button>
        </div>
      </div>
    )
  }

  // Render thread list for 1-on-1 courses
  if (!isGroupCourse && !selectedStudent) {
    return (
      <div className="course-chat">
        <div className="chat-header">
          <h2>💬 Student Messages</h2>
          <div className="info-banner">
            <p>
              Private conversations with each student.
              Click on a student to view and send messages.
            </p>
          </div>
        </div>

        <div className="chat-thread-list">
          {chatThreads.length === 0 ? (
            <div className="no-threads">
              <p>No students enrolled yet.</p>
            </div>
          ) : (
            chatThreads.map((thread) => (
              <div
                key={thread.student.id}
                className="chat-thread-item"
                onClick={() => handleSelectStudent(thread.student.id)}
                role="button"
                tabIndex={0}
              >
                <div className="thread-header">
                  <div className="thread-student-info">
                    <span className="thread-icon">👤</span>
                    <span className="thread-student-name">{thread.student.full_name}</span>
                    {isUserOnline(thread.student.id) && (
                      <span className="online-indicator" title="Online">🟢</span>
                    )}
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="unread-badge">{thread.unreadCount}</span>
                  )}
                </div>
                <div className="thread-preview">
                  <span className="thread-last-message">
                    {thread.lastMessage ? thread.lastMessage.content : 'No messages yet'}
                  </span>
                  {thread.lastMessage && (
                    <span className="thread-time">
                      {formatRelativeTime(thread.lastMessage.created_at)}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="thread-list-footer">
          <p>Click a student to open chat</p>
        </div>
      </div>
    )
  }

  // Render individual chat view for 1-on-1 courses
  if (!isGroupCourse && selectedStudent) {
    const selectedThread = chatThreads.find(t => t.student.id === selectedStudent)
    const isStudentOnline = isUserOnline(selectedStudent)

    return (
      <div className="course-chat">
        <div className="chat-header">
          <button
            onClick={handleBackToThreads}
            className="back-button"
            aria-label="Back to messages"
          >
            ← Back to Messages
          </button>
          <h2>
            💬 Chat with {getSelectedStudentName()}
            {isStudentOnline && <span className="online-indicator" title="Online">🟢</span>}
          </h2>
          <div className="info-banner">
            <p>
              Private conversation - only you and {getSelectedStudentName()} can see these messages.
            </p>
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
                className={`message ${msg.sender_id === user.id ? 'instructor-message' : 'student-message'}`}
              >
                <div className="message-header">
                  <span className="sender-name">
                    {msg.sender_id === user.id ? 'You' : getSenderName(msg)}
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
            aria-label="Message input"
            disabled={sending}
          />
          <button
            type="submit"
            className="btn btn-primary send-button"
            disabled={!newMessage.trim() || sending}
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    )
  }

  // Render group chat view
  return (
    <div className="course-chat">
      <div className="chat-header">
        <h2>💬 Group Chat</h2>
        <div className="info-banner">
          <p>
            All students can see these messages.
            Use this space to share updates, answer questions, and build community.
          </p>
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
              className={`message ${msg.sender_id === user.id ? 'instructor-message' : 'student-message'}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {msg.sender_id === user.id ? 'You (Instructor)' : getSenderName(msg)}
                  {isUserOnline(msg.sender_id) && msg.sender_id !== user.id && (
                    <span className="online-indicator" title="Online">🟢</span>
                  )}
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
          aria-label="Message input"
          disabled={sending}
        />
        <button
          type="submit"
          className="btn btn-primary send-button"
          disabled={!newMessage.trim() || sending}
        >
          {sending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  )
}

export default CourseChat
