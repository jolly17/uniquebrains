import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import StudentHomework from './StudentHomework'
import StudentResources from './StudentResources'
import StudentChat from './StudentChat'
import HomeworkSubmissionModal from '../components/HomeworkSubmissionModal'
import HomeworkDetailsModal from '../components/HomeworkDetailsModal'
import './StudentCourseView.css'

function StudentCourseView() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user, activeStudent } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const activeTab = searchParams.get('tab') || 'sessions'

  // State for notification badges
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [newHomework, setNewHomework] = useState(0)
  const [newResources, setNewResources] = useState(0)

  // State for homework submission modal
  const [showSubmissionModal, setShowSubmissionModal] = useState(false)
  const [selectedHomework, setSelectedHomework] = useState(null)

  // State for homework details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState(null)

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return
      
      try {
        setLoading(true)
        setError('')
        
        console.log('📚 Fetching course:', courseId)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        console.log('✅ Course fetched:', courseData)
        
        setCourse(courseData)
        
        // Determine the correct user ID (child profile or direct user)
        const studentId = activeStudent?.id || user.id
        
        // Fetch sessions
        const sessionsData = await handleApiCall(api.sessions.getCourse, courseId, studentId)
        console.log('✅ Sessions fetched:', sessionsData)
        setSessions(sessionsData || [])
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    fetchCourse()
  }, [courseId, user, activeStudent])

  useEffect(() => {
    // Check for new content indicators
    checkForNewContent()
    
    // Poll for updates every 5 seconds
    const interval = setInterval(checkForNewContent, 5000)
    return () => clearInterval(interval)
  }, [courseId, user.id, activeTab])

  useEffect(() => {
    // Listen for homework submission modal events
    const handleOpenSubmissionModal = (e) => {
      setSelectedHomework(e.detail.homework)
      setShowSubmissionModal(true)
    }

    const handleViewSubmissionDetails = (e) => {
      setSelectedHomework(e.detail.homework)
      setSelectedSubmission(e.detail.submission)
      setShowDetailsModal(true)
    }

    window.addEventListener('openSubmissionModal', handleOpenSubmissionModal)
    window.addEventListener('viewSubmissionDetails', handleViewSubmissionDetails)
    
    return () => {
      window.removeEventListener('openSubmissionModal', handleOpenSubmissionModal)
      window.removeEventListener('viewSubmissionDetails', handleViewSubmissionDetails)
    }
  }, [])

  const checkForNewContent = () => {
    // Check unread messages
    const storedMessages = localStorage.getItem(`chat_${courseId}`)
    if (storedMessages) {
      const messages = JSON.parse(storedMessages)
      const unread = messages.filter(msg => 
        msg.senderRole === 'instructor' && !msg.readBy.includes(user.id)
      ).length
      setUnreadMessages(unread)
    }

    // Check new homework
    const viewedHomework = JSON.parse(localStorage.getItem(`viewed_homework_${courseId}_${user.id}`) || '[]')
    const storedHomework = JSON.parse(localStorage.getItem(`homework_${courseId}`) || '[]')
    const newHw = storedHomework.filter(hw => !viewedHomework.includes(hw.id)).length
    setNewHomework(newHw)

    // Check new resources
    const viewedResources = JSON.parse(localStorage.getItem(`viewed_resources_${courseId}_${user.id}`) || '[]')
    const storedResources = JSON.parse(localStorage.getItem(`resources_${courseId}`) || '[]')
    const newRes = storedResources.filter(res => !viewedResources.includes(res.id)).length
    setNewResources(newRes)
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
    
    // Clear badges when viewing the tab
    if (tab === 'chat') {
      setUnreadMessages(0)
      // Mark messages as read
      const storedMessages = localStorage.getItem(`chat_${courseId}`)
      if (storedMessages) {
        const messages = JSON.parse(storedMessages)
        const updatedMessages = messages.map(msg => ({
          ...msg,
          readBy: msg.readBy.includes(user.id) ? msg.readBy : [...msg.readBy, user.id]
        }))
        localStorage.setItem(`chat_${courseId}`, JSON.stringify(updatedMessages))
      }
    } else if (tab === 'homework') {
      setNewHomework(0)
      // Mark homework as viewed
      const storedHomework = JSON.parse(localStorage.getItem(`homework_${courseId}`) || '[]')
      const homeworkIds = storedHomework.map(hw => hw.id)
      localStorage.setItem(`viewed_homework_${courseId}_${user.id}`, JSON.stringify(homeworkIds))
    } else if (tab === 'resources') {
      setNewResources(0)
      // Mark resources as viewed
      const storedResources = JSON.parse(localStorage.getItem(`resources_${courseId}`) || '[]')
      const resourceIds = storedResources.map(res => res.id)
      localStorage.setItem(`viewed_resources_${courseId}_${user.id}`, JSON.stringify(resourceIds))
    }
  }

  const handleHomeworkSubmit = (submission) => {
    // Save submission to localStorage
    const submissions = JSON.parse(localStorage.getItem(`submissions_${courseId}_${user.id}`) || '{}')
    submissions[submission.homeworkId] = submission
    localStorage.setItem(`submissions_${courseId}_${user.id}`, JSON.stringify(submissions))

    // Close modal
    setShowSubmissionModal(false)
    setSelectedHomework(null)

    // Trigger a re-check of new content
    checkForNewContent()
  }

  if (loading) {
    return (
      <div className="student-course-view">
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading course...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="student-course-view">
        <div className="error-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/my-courses')} className="btn-primary" style={{ marginTop: '1rem' }}>
            ← Back to My Courses
          </button>
        </div>
      </div>
    )
  }

  // Calculate completion percentage based on sessions passed
  const now = new Date()
  const totalSessions = sessions.length
  const completedSessions = sessions.filter(s => new Date(s.session_date) < now).length
  const completionPercentage = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0

  // Helper function to format session date and time
  const formatSessionDateTime = (session) => {
    const date = new Date(session.session_date)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }

  return (
    <div className="student-course-view">
      <div className="student-course-header">
        <button onClick={() => navigate('/my-courses')} className="back-button">
          ← Back to My Courses
        </button>
        <h1>{course.title}</h1>
        <p className="course-instructor">with {course.instructorName}</p>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => handleTabChange('sessions')}
        >
          📅 Sessions
        </button>
        <button
          className={`tab-button ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleTabChange('homework')}
        >
          📝 Homework
          {newHomework > 0 && <span className="notification-badge">{newHomework}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          📚 Resources
          {newResources > 0 && <span className="notification-badge">{newResources}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          💬 Chat
          {unreadMessages > 0 && <span className="notification-badge">{unreadMessages}</span>}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sessions' && (
          <div className="tab-panel">
            <h2>Sessions</h2>
            
            {/* Course Progress */}
            {totalSessions > 0 && (
              <div className="course-progress-section">
                <div className="progress-header">
                  <span className="progress-label">Course Progress</span>
                  <span className="progress-percentage">{completionPercentage}% Complete</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
                </div>
                <div className="progress-stats">
                  <span>{completedSessions} of {totalSessions} sessions completed</span>
                </div>
              </div>
            )}
            
            {/* Course Schedule Information */}
            {course.course_type === 'group' && course.selected_days && course.selected_days.length > 0 && (
              <div className="course-schedule-info">
                <h3>📅 Class Schedule</h3>
                <div className="schedule-details-grid">
                  <div className="schedule-detail">
                    <span className="detail-label">Days:</span>
                    <span className="detail-value">{course.selected_days.join(', ')}</span>
                  </div>
                  <div className="schedule-detail">
                    <span className="detail-label">Time:</span>
                    <span className="detail-value">{course.session_time || 'To be announced'}</span>
                  </div>
                  <div className="schedule-detail">
                    <span className="detail-label">Duration:</span>
                    <span className="detail-value">{course.session_duration} minutes</span>
                  </div>
                  <div className="schedule-detail">
                    <span className="detail-label">Frequency:</span>
                    <span className="detail-value">{course.frequency || 'Weekly'}</span>
                  </div>
                </div>
                {course.start_date && (
                  <div className="schedule-dates">
                    <span className="detail-label">Start Date:</span>
                    <span className="detail-value">{new Date(course.start_date).toLocaleDateString('en-US')}</span>
                    {course.has_end_date && course.end_date && (
                      <>
                        <span className="detail-label" style={{ marginLeft: '2rem' }}>End Date:</span>
                        <span className="detail-value">{new Date(course.end_date).toLocaleDateString('en-US')}</span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {course.course_type === 'one-on-one' && (
              <div className="course-schedule-info">
                <h3>📅 Class Schedule</h3>
                <p className="schedule-note">
                  📝 Your class schedule will be arranged directly with your instructor after enrollment. 
                  They will reach out to you to find times that work best for both of you.
                </p>
              </div>
            )}
            
            {/* Sessions List */}
            {sessions.length > 0 ? (
              <div className="sessions-list-student">
                <h3>All Sessions</h3>
                {sessions.map(session => {
                  const { date, time } = formatSessionDateTime(session)
                  const isPast = new Date(session.session_date) < now
                  const meetingLink = session.meeting_link || course.meeting_link
                  
                  return (
                    <div key={session.id} className={`session-item-student ${isPast ? 'past' : 'upcoming'}`}>
                      <div className="session-date-time">
                        <div className="session-date">{date}</div>
                        <div className="session-time">{time}</div>
                        <div className="session-duration">{session.duration_minutes} min</div>
                      </div>
                      <div className="session-details">
                        <div className="session-title">
                          {session.title || 'Session'}
                        </div>
                        {meetingLink && (
                          <a 
                            href={meetingLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="meeting-link-button"
                          >
                            🔗 Join Meeting
                          </a>
                        )}
                      </div>
                      <div className="session-status">
                        {isPast ? (
                          <span className="status-badge completed">✓ Completed</span>
                        ) : (
                          <span className="status-badge upcoming">Upcoming</span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="info-banner">
                <span className="info-icon">ℹ️</span>
                <p>Your upcoming class sessions will appear here. Check back soon!</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'homework' && (
          <div className="tab-panel">
            <StudentHomework courseId={courseId} userId={user.id} />
          </div>
        )}
        
        {activeTab === 'resources' && (
          <div className="tab-panel">
            <StudentResources courseId={courseId} userId={user.id} />
          </div>
        )}
        
        {activeTab === 'chat' && (
          <div className="tab-panel">
            <StudentChat courseId={courseId} userId={user.id} course={course} />
          </div>
        )}
      </div>

      {/* Homework Submission Modal */}
      {showSubmissionModal && selectedHomework && (
        <HomeworkSubmissionModal
          homework={selectedHomework}
          onClose={() => {
            setShowSubmissionModal(false)
            setSelectedHomework(null)
          }}
          onSubmit={handleHomeworkSubmit}
        />
      )}

      {/* Homework Details Modal */}
      {showDetailsModal && selectedHomework && selectedSubmission && (
        <HomeworkDetailsModal
          homework={selectedHomework}
          submission={selectedSubmission}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedHomework(null)
            setSelectedSubmission(null)
          }}
        />
      )}
    </div>
  )
}

export default StudentCourseView
