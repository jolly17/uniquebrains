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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const activeTab = searchParams.get('tab') || 'sessions'

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

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

  return (
    <div className="manage-course">
      <div className="manage-course-header">
        <button onClick={() => navigate('/instructor/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>
        <h1>{course.title}</h1>
        <p className="course-subtitle">Manage your course content and students</p>
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
