import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { mockCourses, mockHomework } from '../data/mockData'
import StarRating from '../components/StarRating'
import './CourseView.css'

function CourseView() {
  const { courseId } = useParams()
  const course = mockCourses.find(c => c.id === courseId)
  const homework = mockHomework.filter(h => h.courseId === courseId)
  
  const [activeTab, setActiveTab] = useState('schedule')
  const [showRating, setShowRating] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [homeworkFile, setHomeworkFile] = useState(null)

  if (!course) return <div>Course not found</div>

  // Mock data for live sessions - topics are set by instructor based on student progress
  const upcomingSessions = [
    { id: 1, date: '2024-01-15', time: '10:00 AM', topic: 'Review scales and introduce new piece', status: 'upcoming', topicSet: true, meetingLink: 'https://zoom.us/j/123456789' },
    { id: 2, date: '2024-01-17', time: '10:00 AM', topic: null, status: 'upcoming', topicSet: false, meetingLink: '' },
    { id: 3, date: '2024-01-12', time: '10:00 AM', topic: 'Hand position and finger exercises', status: 'completed', topicSet: true, meetingLink: '' },
  ]

  const handleJoinClass = (meetingLink) => {
    if (meetingLink) {
      window.open(meetingLink, '_blank')
    } else {
      alert('Meeting link not available yet. Your instructor will add it soon.')
    }
  }

  const chatMessages = [
    { id: 1, sender: 'Instructor', message: 'Welcome to the course! Feel free to ask questions.', time: '9:30 AM' },
    { id: 2, sender: 'Student', message: 'Thank you! Excited to learn.', time: '9:35 AM' },
  ]

  const resources = [
    { id: 1, name: 'Fraction Practice Worksheet.pdf', type: 'PDF', size: '2.3 MB' },
    { id: 2, name: 'Visual Fraction Guide.pdf', type: 'PDF', size: '1.8 MB' },
    { id: 3, name: 'Interactive Fraction Game', type: 'Link', url: '#' },
  ]

  const feedback = [
    { id: 1, homework: 'Fraction Worksheet 1', grade: 'A', comment: 'Excellent work! You understood the concept well.', date: '2024-01-10' },
    { id: 2, homework: 'Number Line Exercise', grade: 'B+', comment: 'Good effort. Review the negative numbers section.', date: '2024-01-08' },
  ]

  const handleSubmitRating = () => {
    alert(`Rating submitted: ${rating} stars`)
    setShowRating(false)
  }

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      alert(`Message sent: ${chatMessage}`)
      setChatMessage('')
    }
  }

  const handleHomeworkSubmit = (hwId) => {
    if (homeworkFile) {
      alert(`Homework submitted for assignment ${hwId}`)
      setHomeworkFile(null)
    } else {
      alert('Please select a file to submit')
    }
  }

  return (
    <div className="course-view">
      <div className="course-header">
        <div className="course-header-info">
          <h1>{course.title}</h1>
          <p className="course-instructor">Instructor: {course.instructorName}</p>
        </div>
        <button onClick={() => setShowRating(true)} className="btn-secondary">
          Rate Course
        </button>
      </div>

      <div className="course-tabs">
        <button 
          className={`tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
          onClick={() => setActiveTab('schedule')}
        >
          📅 Schedule & Join
        </button>
        <button 
          className={`tab-btn ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => setActiveTab('homework')}
        >
          📝 Homework
        </button>
        <button 
          className={`tab-btn ${activeTab === 'feedback' ? 'active' : ''}`}
          onClick={() => setActiveTab('feedback')}
        >
          ⭐ Feedback
        </button>
        <button 
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => setActiveTab('chat')}
        >
          💬 Chat
        </button>
        <button 
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          📚 Resources
        </button>
      </div>

      <div className="course-content">
        {/* Schedule & Join Tab */}
        {activeTab === 'schedule' && (
          <div className="tab-content">
            <h2>Live Class Schedule</h2>
            <div className="schedule-note">
              <p>💡 Your instructor sets session topics based on your individual progress and learning pace.</p>
            </div>
            <div className="sessions-list">
              {upcomingSessions.map(session => (
                <div key={session.id} className={`session-card ${session.status}`}>
                  <div className="session-info">
                    <h3>
                      {session.topicSet && session.topic 
                        ? session.topic 
                        : session.status === 'upcoming' 
                          ? 'Topic to be announced' 
                          : 'Session completed'}
                    </h3>
                    {!session.topicSet && session.status === 'upcoming' && (
                      <p className="topic-pending">Your instructor will set the topic before class</p>
                    )}
                    <div className="session-meta">
                      <span>📅 {new Date(session.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                      <span>🕐 {session.time}</span>
                    </div>
                  </div>
                  <div className="session-actions">
                    {session.status === 'upcoming' && (
                      <button 
                        className="btn-primary"
                        onClick={() => handleJoinClass(session.meetingLink)}
                      >
                        {session.meetingLink ? '🎥 Join Class' : 'Join Class'}
                      </button>
                    )}
                    {session.status === 'completed' && (
                      <span className="status-badge completed">Completed</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Homework Tab */}
        {activeTab === 'homework' && (
          <div className="tab-content">
            <h2>Homework Assignments</h2>
            {homework.length > 0 ? (
              <div className="homework-list">
                {homework.map(hw => (
                  <div key={hw.id} className="homework-card">
                    <div className="homework-header">
                      <h3>{hw.title}</h3>
                      <span className={`status-badge ${hw.status}`}>{hw.status}</span>
                    </div>
                    <p className="homework-description">{hw.description}</p>
                    <div className="homework-meta">
                      <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString('en-US')}</span>
                      <span>📎 Type: {hw.submissionType}</span>
                    </div>
                    {hw.status === 'pending' && (
                      <div className="homework-submit">
                        <input 
                          type="file" 
                          onChange={(e) => setHomeworkFile(e.target.files[0])}
                          className="file-input"
                        />
                        <button 
                          className="btn-primary"
                          onClick={() => handleHomeworkSubmit(hw.id)}
                        >
                          Submit Homework
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No homework assignments yet.</p>
            )}
          </div>
        )}

        {/* Feedback Tab */}
        {activeTab === 'feedback' && (
          <div className="tab-content">
            <h2>Instructor Feedback</h2>
            {feedback.length > 0 ? (
              <div className="feedback-list">
                {feedback.map(fb => (
                  <div key={fb.id} className="feedback-card">
                    <div className="feedback-header">
                      <h3>{fb.homework}</h3>
                      <span className="grade-badge">{fb.grade}</span>
                    </div>
                    <p className="feedback-comment">{fb.comment}</p>
                    <p className="feedback-date">Received: {new Date(fb.date).toLocaleDateString('en-US')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">No feedback yet.</p>
            )}
          </div>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div className="tab-content">
            <h2>Course Chat</h2>
            <div className="chat-container">
              <div className="chat-messages">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`chat-message ${msg.sender === 'Student' ? 'own' : ''}`}>
                    <div className="message-sender">{msg.sender}</div>
                    <div className="message-content">{msg.message}</div>
                    <div className="message-time">{msg.time}</div>
                  </div>
                ))}
              </div>
              <div className="chat-input-container">
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="chat-input"
                />
                <button onClick={handleSendMessage} className="btn-primary">
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Resources Tab */}
        {activeTab === 'resources' && (
          <div className="tab-content">
            <h2>Course Resources</h2>
            <div className="resources-list">
              {resources.map(resource => (
                <div key={resource.id} className="resource-card">
                  <div className="resource-icon">
                    {resource.type === 'PDF' ? '📄' : '🔗'}
                  </div>
                  <div className="resource-info">
                    <h3>{resource.name}</h3>
                    <p className="resource-meta">
                      {resource.type} {resource.size && `• ${resource.size}`}
                    </p>
                  </div>
                  <button className="btn-secondary">Download</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showRating && (
        <div className="modal-overlay" onClick={() => setShowRating(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Rate This Course</h2>
            <div className="rating-input">
              <StarRating rating={rating} onRate={setRating} size="large" />
            </div>
            <textarea
              placeholder="Write your review (optional)"
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows="4"
            />
            <div className="modal-actions">
              <button onClick={() => setShowRating(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSubmitRating} className="btn-primary">
                Submit Rating
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseView
