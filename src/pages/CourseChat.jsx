import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { mockStudents } from '../data/mockData'
import './CourseChat.css'

function CourseChat({ course }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [chatThreads, setChatThreads] = useState([])
  const messagesEndRef = useRef(null)
  const pollingIntervalRef = useRef(null)

  // Load messages from localStorage on mount
  useEffect(() => {
    const storedMessages = localStorage.getItem(`chat_${course.id}`)
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    } else {
      // Initialize with some sample messages for group courses
      if (course.courseType === 'group') {
        const sampleMessages = [
          {
            id: '1',
            courseId: course.id,
            senderId: 'student-1',
            senderName: 'Emma Thompson',
            senderRole: 'student',
            recipientId: null,
            message: 'When is our next session?',
            sentAt: new Date(Date.now() - 3600000).toISOString(),
            readBy: [user.id]
          },
          {
            id: '2',
            courseId: course.id,
            senderId: user.id,
            senderName: `${user.firstName} ${user.lastName}`,
            senderRole: 'instructor',
            recipientId: null,
            message: 'Next session is Monday at 10 AM. See you there! 🎵',
            sentAt: new Date(Date.now() - 3300000).toISOString(),
            readBy: [user.id, 'student-1', 'student-2']
          },
          {
            id: '3',
            courseId: course.id,
            senderId: 'student-2',
            senderName: 'Liam Chen',
            senderRole: 'student',
            recipientId: null,
            message: 'Can we review scales again?',
            sentAt: new Date(Date.now() - 900000).toISOString(),
            readBy: [user.id]
          },
          {
            id: '4',
            courseId: course.id,
            senderId: user.id,
            senderName: `${user.firstName} ${user.lastName}`,
            senderRole: 'instructor',
            recipientId: null,
            message: "Absolutely! I'll add that to Monday's session.",
            sentAt: new Date(Date.now() - 600000).toISOString(),
            readBy: [user.id, 'student-2']
          }
        ]
        setMessages(sampleMessages)
        localStorage.setItem(`chat_${course.id}`, JSON.stringify(sampleMessages))
      } else if (course.courseType === 'one-on-one') {
        // Initialize with sample messages for one-on-one courses
        const sampleMessages = [
          {
            id: '1',
            courseId: course.id,
            senderId: '1',
            senderName: 'Emma Thompson',
            senderRole: 'student',
            recipientId: user.id,
            message: 'Can we reschedule Tuesday\'s lesson?',
            sentAt: new Date(Date.now() - 600000).toISOString(),
            readBy: ['1']
          },
          {
            id: '2',
            courseId: course.id,
            senderId: user.id,
            senderName: `${user.firstName} ${user.lastName}`,
            senderRole: 'instructor',
            recipientId: '1',
            message: 'Of course! What time works for you?',
            sentAt: new Date(Date.now() - 300000).toISOString(),
            readBy: [user.id, '1']
          },
          {
            id: '3',
            courseId: course.id,
            senderId: '2',
            senderName: 'Liam Chen',
            senderRole: 'student',
            recipientId: user.id,
            message: 'Thanks for the feedback!',
            sentAt: new Date(Date.now() - 7200000).toISOString(),
            readBy: [user.id, '2']
          },
          {
            id: '4',
            courseId: course.id,
            senderId: '3',
            senderName: 'Sophia Rodriguez',
            senderRole: 'student',
            recipientId: user.id,
            message: 'I have a question about the homework.',
            sentAt: new Date(Date.now() - 1800000).toISOString(),
            readBy: ['3']
          }
        ]
        setMessages(sampleMessages)
        localStorage.setItem(`chat_${course.id}`, JSON.stringify(sampleMessages))
      }
    }
  }, [course.id, course.courseType, user.id, user.firstName, user.lastName])

  // Build chat threads for one-on-one courses
  useEffect(() => {
    if (course.courseType === 'one-on-one') {
      // Get enrolled students (using mock data for now)
      const enrolledStudents = mockStudents.slice(0, course.currentEnrollment || 3)
      
      // Build thread list with last message info
      const threads = enrolledStudents.map(student => {
        // Get messages for this student
        const studentMessages = messages.filter(msg => 
          (msg.senderId === student.id && msg.recipientId === user.id) ||
          (msg.senderId === user.id && msg.recipientId === student.id)
        )
        
        // Get last message
        const lastMessage = studentMessages.length > 0 
          ? studentMessages[studentMessages.length - 1]
          : null
        
        // Count unread messages (messages from student not read by instructor)
        const unreadCount = studentMessages.filter(msg => 
          msg.senderId === student.id && !msg.readBy.includes(user.id)
        ).length
        
        return {
          id: student.id,
          studentName: `${student.firstName} ${student.lastName}`,
          lastMessage: lastMessage ? lastMessage.message : 'No messages yet',
          lastMessageAt: lastMessage ? lastMessage.sentAt : null,
          unreadCount
        }
      })
      
      // Sort by last message time (most recent first)
      threads.sort((a, b) => {
        if (!a.lastMessageAt) return 1
        if (!b.lastMessageAt) return -1
        return new Date(b.lastMessageAt) - new Date(a.lastMessageAt)
      })
      
      setChatThreads(threads)
    }
  }, [course.courseType, course.currentEnrollment, messages, user.id])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    const pollMessages = () => {
      const storedMessages = localStorage.getItem(`chat_${course.id}`)
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages)
        // Only update if there are new messages
        if (parsedMessages.length !== messages.length) {
          setMessages(parsedMessages)
          // Mark messages as read by instructor
          const updatedMessages = parsedMessages.map(msg => ({
            ...msg,
            readBy: msg.readBy.includes(user.id) ? msg.readBy : [...msg.readBy, user.id]
          }))
          localStorage.setItem(`chat_${course.id}`, JSON.stringify(updatedMessages))
        }
      }
    }

    // Start polling
    pollingIntervalRef.current = setInterval(pollMessages, 5000)

    // Cleanup on unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
    }
  }, [course.id, messages.length, user.id])

  const handleSendMessage = (e) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      return
    }

    const message = {
      id: `msg-${Date.now()}`,
      courseId: course.id,
      senderId: user.id,
      senderName: `${user.firstName} ${user.lastName}`,
      senderRole: 'instructor',
      recipientId: course.courseType === 'one-on-one' ? selectedStudent : null,
      message: newMessage.trim(),
      sentAt: new Date().toISOString(),
      readBy: [user.id]
    }

    const updatedMessages = [...messages, message]
    setMessages(updatedMessages)
    localStorage.setItem(`chat_${course.id}`, JSON.stringify(updatedMessages))
    
    setNewMessage('')
    setShowConfirmation(true)
    setTimeout(() => setShowConfirmation(false), 3000)
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

  const handleSelectStudent = (studentId) => {
    setSelectedStudent(studentId)
    
    // Mark messages from this student as read
    const updatedMessages = messages.map(msg => {
      if (msg.senderId === studentId && !msg.readBy.includes(user.id)) {
        return { ...msg, readBy: [...msg.readBy, user.id] }
      }
      return msg
    })
    setMessages(updatedMessages)
    localStorage.setItem(`chat_${course.id}`, JSON.stringify(updatedMessages))
  }

  const handleBackToThreads = () => {
    setSelectedStudent(null)
  }

  const getFilteredMessages = () => {
    if (course.courseType === 'group') {
      return messages
    } else if (course.courseType === 'one-on-one' && selectedStudent) {
      return messages.filter(msg => 
        (msg.senderId === selectedStudent && msg.recipientId === user.id) ||
        (msg.senderId === user.id && msg.recipientId === selectedStudent)
      )
    }
    return []
  }

  const getSelectedStudentName = () => {
    const thread = chatThreads.find(t => t.id === selectedStudent)
    return thread ? thread.studentName : ''
  }

  const participantCount = course.currentEnrollment || 0
  const filteredMessages = getFilteredMessages()

  // Render thread list for one-on-one courses
  if (course.courseType === 'one-on-one' && !selectedStudent) {
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
                key={thread.id}
                className="chat-thread-item"
                onClick={() => handleSelectStudent(thread.id)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleSelectStudent(thread.id)
                  }
                }}
              >
                <div className="thread-header">
                  <div className="thread-student-info">
                    <span className="thread-icon">👤</span>
                    <span className="thread-student-name">{thread.studentName}</span>
                  </div>
                  {thread.unreadCount > 0 && (
                    <span className="unread-badge">New</span>
                  )}
                </div>
                <div className="thread-preview">
                  <span className="thread-last-message">{thread.lastMessage}</span>
                  {thread.lastMessageAt && (
                    <span className="thread-time">{formatRelativeTime(thread.lastMessageAt)}</span>
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

  // Render individual chat view for one-on-one courses
  if (course.courseType === 'one-on-one' && selectedStudent) {
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
          <h2>💬 Chat with {getSelectedStudentName()}</h2>
          <div className="info-banner">
            <p>
              Private conversation - only you and {getSelectedStudentName()} can see these messages.
            </p>
          </div>
        </div>

        <div className="chat-messages">
          {filteredMessages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            filteredMessages.map((msg) => (
              <div 
                key={msg.id} 
                className={`message ${msg.senderRole === 'instructor' ? 'instructor-message' : 'student-message'}`}
              >
                <div className="message-header">
                  <span className="sender-name">
                    {msg.senderRole === 'instructor' ? 'You' : msg.senderName}
                  </span>
                  <span className="message-time">{formatTime(msg.sentAt)}</span>
                </div>
                <div className="message-content">
                  {msg.message}
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
          />
          <button 
            type="submit" 
            className="btn btn-primary send-button"
            disabled={!newMessage.trim()}
          >
            Send
          </button>
        </form>

        {showConfirmation && (
          <div className="send-confirmation">
            ✓ Message sent successfully
          </div>
        )}
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
            All {participantCount} students can see these messages. 
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
              className={`message ${msg.senderRole === 'instructor' ? 'instructor-message' : 'student-message'}`}
            >
              <div className="message-header">
                <span className="sender-name">
                  {msg.senderRole === 'instructor' ? 'You (Instructor)' : msg.senderName}
                </span>
                <span className="message-time">{formatTime(msg.sentAt)}</span>
              </div>
              <div className="message-content">
                {msg.message}
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
        />
        <button 
          type="submit" 
          className="btn btn-primary send-button"
          disabled={!newMessage.trim()}
        >
          Send
        </button>
      </form>

      {showConfirmation && (
        <div className="send-confirmation">
          ✓ Message sent successfully
        </div>
      )}
    </div>
  )
}

export default CourseChat
