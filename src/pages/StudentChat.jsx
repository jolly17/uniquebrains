import { useState, useEffect, useRef } from 'react'
import './StudentChat.css'

function StudentChat({ courseId, userId, course }) {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    loadMessages()
    // Poll for new messages every 3 seconds
    const interval = setInterval(loadMessages, 3000)
    return () => clearInterval(interval)
  }, [courseId, userId])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  const loadMessages = () => {
    const storedMessages = JSON.parse(localStorage.getItem(`chat_${courseId}`) || '[]')
    
    // Filter messages based on course type
    let filteredMessages = storedMessages
    if (course.courseType === 'one-on-one') {
      // Only show messages between this student and instructor
      filteredMessages = storedMessages.filter(msg => 
        (msg.senderId === userId || msg.recipientId === userId) ||
        (msg.senderRole === 'instructor' && msg.recipientId === userId) ||
        (msg.senderId === userId && msg.senderRole === 'student')
      )
    }
    
    setMessages(filteredMessages)
    
    // Mark messages as read
    const updatedMessages = storedMessages.map(msg => {
      if (msg.senderRole === 'instructor' && !msg.readBy.includes(userId)) {
        return { ...msg, readBy: [...msg.readBy, userId] }
      }
      return msg
    })
    localStorage.setItem(`chat_${courseId}`, JSON.stringify(updatedMessages))
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isSending) return

    setIsSending(true)

    const message = {
      id: Date.now().toString(),
      courseId,
      senderId: userId,
      senderName: 'You',
      senderRole: 'student',
      recipientId: course.courseType === 'one-on-one' ? course.instructorId : null,
      message: newMessage.trim(),
      sentAt: new Date().toISOString(),
      readBy: [userId]
    }

    // Save message
    const storedMessages = JSON.parse(localStorage.getItem(`chat_${courseId}`) || '[]')
    storedMessages.push(message)
    localStorage.setItem(`chat_${courseId}`, JSON.stringify(storedMessages))

    // Update UI
    setMessages([...messages, message])
    setNewMessage('')
    setIsSending(false)

    // Show confirmation
    setTimeout(() => {
      scrollToBottom()
    }, 100)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' ' +
             date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
  }

  return (
    <div className="student-chat">
      <h2>
        {course.courseType === 'group' ? '💬 Class Chat' : '💬 Chat with Your Instructor'}
      </h2>
      
      <div className="info-banner">
        <span className="info-icon">ℹ️</span>
        <p>
          {course.courseType === 'group' 
            ? `Chat with your instructor and classmates (${course.currentEnrollment} students total)`
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
                  className={`chat-message ${msg.senderId === userId ? 'own' : ''}`}
                >
                  <div className="message-header">
                    <span className="message-sender">
                      {msg.senderId === userId ? 'You' : msg.senderName}
                      {msg.senderRole === 'instructor' && ' (Instructor)'}
                    </span>
                    <span className="message-time">{formatTime(msg.sentAt)}</span>
                  </div>
                  <div className="message-content">{msg.message}</div>
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
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="chat-input"
            rows="3"
            disabled={isSending}
          />
          <button 
            onClick={handleSendMessage}
            className="btn-primary send-button"
            disabled={!newMessage.trim() || isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default StudentChat
