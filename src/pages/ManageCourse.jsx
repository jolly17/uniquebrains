import { useState, useEffect } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import ManageSessions from './ManageSessions'
import CourseStudents from './CourseStudents'
import CourseHomework from './CourseHomework'
import CourseResources from './CourseResources'
import CourseChat from './CourseChat'
import TimeInput from '../components/TimeInput'
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
  
  // Course settings editing state
  const [isEditingSettings, setIsEditingSettings] = useState(false)
  const [settingsData, setSettingsData] = useState({
    sessionTime: '',
    selectedDays: [],
    sessionDuration: ''
  })
  
  const activeTab = searchParams.get('tab') || 'sessions'

  // Fetch course data, sessions, and enrollments
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
        
        // Initialize settings data
        setSettingsData({
          sessionTime: courseData.session_time || '',
          selectedDays: courseData.selected_days || [],
          sessionDuration: courseData.session_duration || ''
        })
        
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

  const toggleDay = (day) => {
    const currentDays = settingsData.selectedDays
    if (currentDays.includes(day)) {
      setSettingsData({
        ...settingsData,
        selectedDays: currentDays.filter(d => d !== day)
      })
    } else {
      setSettingsData({
        ...settingsData,
        selectedDays: [...currentDays, day]
      })
    }
  }

  const handleSaveSettings = async () => {
    try {
      // Validate required fields
      if (!settingsData.sessionTime || !settingsData.sessionDuration || settingsData.selectedDays.length === 0) {
        alert('Please fill in all schedule fields')
        return
      }

      // Update course with new settings
      await handleApiCall(api.courses.update, courseId, {
        session_time: settingsData.sessionTime,
        selected_days: settingsData.selectedDays,
        session_duration: settingsData.sessionDuration
      }, user.id)

      // Update local state
      setCourse({
        ...course,
        session_time: settingsData.sessionTime,
        selected_days: settingsData.selectedDays,
        session_duration: settingsData.sessionDuration
      })

      setIsEditingSettings(false)
      alert('Course schedule updated successfully')
    } catch (err) {
      console.error('Error updating course settings:', err)
      alert('Failed to update course settings')
    }
  }

  const handleCancelSettings = () => {
    // Reset to current course data
    setSettingsData({
      sessionTime: course.session_time || '',
      selectedDays: course.selected_days || [],
      sessionDuration: course.session_duration || ''
    })
    setIsEditingSettings(false)
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

      {/* Course Settings Section - Only for group courses */}
      {course.course_type === 'group' && (
        <div className="course-meeting-link-section" style={{ marginTop: '1.5rem' }}>
          <h3>⚙️ Course Schedule Settings</h3>
          <p className="meeting-link-description">Update course time, days, and session duration</p>
          {isEditingSettings ? (
            <div className="meeting-link-edit">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Session Time *</label>
                  <TimeInput
                    value={settingsData.sessionTime}
                    onChange={(e) => setSettingsData({ ...settingsData, sessionTime: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Duration (minutes) *</label>
                  <input
                    type="number"
                    value={settingsData.sessionDuration}
                    onChange={(e) => setSettingsData({ ...settingsData, sessionDuration: e.target.value })}
                    min="15"
                    step="15"
                    placeholder="60"
                    className="meeting-link-input"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>Days *</label>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      style={{
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        border: '2px solid',
                        borderColor: settingsData.selectedDays.includes(day) ? '#3b82f6' : '#d1d5db',
                        background: settingsData.selectedDays.includes(day) ? '#3b82f6' : 'white',
                        color: settingsData.selectedDays.includes(day) ? 'white' : '#374151',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: '500'
                      }}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="meeting-link-actions">
                <button onClick={handleSaveSettings} className="btn-primary btn-sm">
                  Save Settings
                </button>
                <button onClick={handleCancelSettings} className="btn-secondary btn-sm">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="meeting-link-display-section">
              <div className="meeting-link-value">
                📅 {course.selected_days?.join(', ') || 'No days set'} at {course.session_time || 'No time set'} ({course.session_duration || 0} min)
              </div>
              <button onClick={() => setIsEditingSettings(true)} className="btn-secondary btn-sm">
                Edit Schedule
              </button>
            </div>
          )}
        </div>
      )}

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
