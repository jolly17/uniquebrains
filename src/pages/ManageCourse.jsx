import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import ManageSessions from './ManageSessions'
import CourseStudents from './CourseStudents'
import CourseHomework from './CourseHomework'
import CourseResources from './CourseResources'
import CourseChat from './CourseChat'
import './ManageCourse.css'

function ManageCourse() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const [course, setCourse] = useState(null)
  const [sessions, setSessions] = useState([])
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const activeTab = searchParams.get('tab') || 'sessions'

  // Fetch course data, sessions, and enrollments
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
        
        // Fetch sessions
        const sessionsData = await handleApiCall(api.sessions.getCourse, courseId, user.id)
        setSessions(sessionsData || [])
        
        // Fetch enrolled students
        const enrollmentsData = await handleApiCall(api.enrollments.getCourse, courseId, user.id)
        setEnrolledStudents(enrollmentsData || [])
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourseData()
    }
  }, [courseId, user])

  // Check for unread messages
  useEffect(() => {
    const checkUnreadMessages = () => {
      const storedMessages = localStorage.getItem(`chat_${courseId}`)
      if (storedMessages) {
        const messages = JSON.parse(storedMessages)
        const unread = messages.filter(msg => 
          msg.senderRole !== 'instructor' && !msg.readBy.includes(user.id)
        ).length
        setUnreadCount(unread)
      }
    }

    checkUnreadMessages()
    // Poll for unread messages every 5 seconds
    const interval = setInterval(checkUnreadMessages, 5000)

    return () => clearInterval(interval)
  }, [courseId, user.id, activeTab])

  if (loading) {
    return (
      <div className="manage-course">
        <div className="loading-state">Loading course...</div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="manage-course">
        <div className="error-state">
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/instructor/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleTabChange = (tab) => {
    setSearchParams({ tab })
    // Clear unread count when opening chat tab
    if (tab === 'chat') {
      setUnreadCount(0)
    }
  }

  // Calculate stats
  const enrolledCount = enrolledStudents.length
  const maxCapacity = course?.enrollment_limit || 0
  const spotsRemaining = maxCapacity > 0 ? Math.max(0, maxCapacity - enrolledCount) : '∞'
  
  // Count upcoming sessions (sessions after current date/time)
  const now = new Date()
  const upcomingSessions = sessions.filter(s => new Date(s.session_date) > now).length

  return (
    <div className="manage-course">
      <div className="manage-course-header">
        <button onClick={() => navigate('/instructor/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>{course.title}</h1>
        <p className="course-subtitle">Manage your course content and students</p>
      </div>

      {/* Course Stats Cards */}
      <div className="course-stats">
        <div className="stat-card">
          <div className="stat-value">{enrolledCount}</div>
          <div className="stat-label">Enrolled Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{spotsRemaining}</div>
          <div className="stat-label">Spots Remaining</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcomingSessions}</div>
          <div className="stat-label">Upcoming Sessions</div>
        </div>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => handleTabChange('sessions')}
        >
          📅 Sessions
        </button>
        <button
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => handleTabChange('students')}
        >
          👥 Students
        </button>
        <button
          className={`tab-button ${activeTab === 'homework' ? 'active' : ''}`}
          onClick={() => handleTabChange('homework')}
        >
          📝 Homework
        </button>
        <button
          className={`tab-button ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => handleTabChange('resources')}
        >
          📚 Resources
        </button>
        <button
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => handleTabChange('chat')}
        >
          💬 Chat
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'sessions' && <ManageSessions />}
        {activeTab === 'students' && <CourseStudents course={course} />}
        {activeTab === 'homework' && <CourseHomework course={course} />}
        {activeTab === 'resources' && <CourseResources course={course} />}
        {activeTab === 'chat' && <CourseChat course={course} />}
      </div>
    </div>
  )
}

export default ManageCourse
