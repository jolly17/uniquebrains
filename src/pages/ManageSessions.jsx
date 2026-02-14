import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import TimeInput from '../components/TimeInput'
import './ManageSessions.css'

function ManageSessions() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  const [course, setCourse] = useState(null)
  const [enrolledStudents, setEnrolledStudents] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Session editing state
  const [editingSession, setEditingSession] = useState(null)
  const [sessionEditData, setSessionEditData] = useState({
    title: '',
    date: '',
    time: '',
    duration: course?.session_duration || 60
  })
  
  // New session creation state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSession, setNewSession] = useState({
    date: '',
    time: '',
    topic: ''
  })

  // Calculate next session date based on course schedule
  const calculateNextSessionDate = () => {
    if (!course?.selected_days || course.selected_days.length === 0) {
      return ''
    }

    // Find the last session date
    const lastSession = sessions.length > 0 
      ? sessions.sort((a, b) => new Date(b.session_date) - new Date(a.session_date))[0]
      : null
    
    const startDate = lastSession 
      ? new Date(new Date(lastSession.session_date).getTime() + 24 * 60 * 60 * 1000) // Day after last session
      : new Date() // Today if no sessions exist
    
    // Find the next day that matches the course schedule
    let currentDate = new Date(startDate)
    const maxDaysToCheck = 14 // Check up to 2 weeks ahead
    
    for (let i = 0; i < maxDaysToCheck; i++) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
      
      if (course.selected_days.includes(dayName)) {
        return currentDate.toISOString().split('T')[0]
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return '' // Fallback if no matching day found
  }

  const enrolledCount = enrolledStudents.length
  const maxCapacity = course?.enrollment_limit || 0

  // Load course data, sessions, and enrolled students
  useEffect(() => {
    if (courseId && user) {
      fetchCourseData()
    }
  }, [courseId, user])

  const fetchCourseData = async () => {
    try {
      setLoading(true)
      setError('')

      // Fetch course details
      const courseData = await handleApiCall(api.courses.getById, courseId)
      setCourse(courseData)

      // Fetch sessions
      const sessionsData = await handleApiCall(api.sessions.getCourse, courseId, user.id)
      
      // Auto-generate sessions if none exist
      if ((!sessionsData || sessionsData.length === 0) &&
          courseData.selected_days && 
          courseData.selected_days.length > 0 &&
          courseData.session_time &&
          courseData.start_date) {
        
        console.log('Auto-generating sessions...')
        const generatedSessions = await autoGenerateSessions(courseData)
        setSessions(generatedSessions)
      } else {
        setSessions(sessionsData || [])
      }

      // Fetch enrolled students
      const enrollmentsData = await handleApiCall(api.enrollments.getCourse, courseId, user.id)
      
      // Extract student profiles from enrollments
      const students = enrollmentsData.map(enrollment => {
        // All enrollments now use profiles (student_id)
        return enrollment.profiles ? {
          ...enrollment.profiles
        } : null
      }).filter(student => student !== null)
      
      setEnrolledStudents(students)

    } catch (err) {
      console.error('Error fetching course data:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
    }
  }
  
  // Auto-generate sessions based on course schedule
  const autoGenerateSessions = async (courseData) => {
    const generatedSessions = []
    const startDate = new Date(courseData.start_date)
    
    // For courses without end date, generate 5 sessions
    // For courses with end date, generate all sessions until end date
    const hasEndDate = courseData.has_end_date && courseData.end_date
    const endDate = hasEndDate
      ? new Date(courseData.end_date)
      : null
    
    const maxSessions = hasEndDate ? 1000 : 5 // Limit to 5 for open-ended courses
    
    const [hours, minutes] = courseData.session_time.split(':')
    let currentDate = new Date(startDate)
    let sessionNumber = 1
    let sessionsCreated = 0

    while (sessionsCreated < maxSessions && (!endDate || currentDate <= endDate)) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
      
      if (courseData.selected_days.includes(dayName)) {
        const sessionDateTime = new Date(currentDate)
        sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
        
        const sessionData = {
          title: `Session ${sessionNumber} Topics`,
          description: '',
          session_date: sessionDateTime.toISOString(),
          duration: courseData.session_duration || 60,
          meeting_link: courseData.meeting_link || '',
          student_id: null // Group session
        }
        
        try {
          const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
          generatedSessions.push(createdSession)
          sessionNumber++
          sessionsCreated++
        } catch (err) {
          console.error('Error creating session:', err)
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    console.log(`Generated ${generatedSessions.length} sessions${!hasEndDate ? ' (5 initial sessions for open-ended course)' : ''}`)
    return generatedSessions.sort((a, b) => new Date(a.session_date) - new Date(b.session_date))
  }
  
  // Generate more sessions for open-ended courses
  const generateMoreSessions = async (count) => {
    if (!course || !course.selected_days || !course.session_time) {
      alert('Course schedule information is missing')
      return
    }
    
    try {
      const generatedSessions = []
      
      // Find the last session date
      const lastSession = sessions.length > 0 
        ? sessions.sort((a, b) => new Date(b.session_date) - new Date(a.session_date))[0]
        : null
      
      const startDate = lastSession 
        ? new Date(new Date(lastSession.session_date).getTime() + 24 * 60 * 60 * 1000) // Day after last session
        : new Date(course.start_date)
      
      const [hours, minutes] = course.session_time.split(':')
      let currentDate = new Date(startDate)
      let sessionNumber = sessions.length + 1
      let sessionsCreated = 0

      while (sessionsCreated < count) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
        
        if (course.selected_days.includes(dayName)) {
          const sessionDateTime = new Date(currentDate)
          sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          
          const sessionData = {
            title: `Session ${sessionNumber} Topics`,
            description: '',
            session_date: sessionDateTime.toISOString(),
            duration_minutes: course.session_duration || 60,
            meeting_link: course.meeting_link || '',
            student_id: null
          }
          
          const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
          generatedSessions.push(createdSession)
          sessionNumber++
          sessionsCreated++
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }
      
      setSessions([...sessions, ...generatedSessions].sort((a, b) => 
        new Date(a.session_date) - new Date(b.session_date)
      ))
      
      console.log(`Added ${generatedSessions.length} more sessions`)
    } catch (err) {
      console.error('Error generating more sessions:', err)
      alert('Failed to generate more sessions')
    }
  }

  if (loading) {
    return (
      <div className="manage-sessions">
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="manage-sessions">
        <div className="error-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/instructor/dashboard')} className="btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const handleEditSession = (session) => {
    const sessionDate = new Date(session.session_date)
    setEditingSession(session.id)
    setSessionEditData({
      title: session.title || '',
      date: sessionDate.toISOString().split('T')[0],
      time: sessionDate.toTimeString().slice(0, 5),
      duration: session.duration_minutes || 60
    })
  }

  const handleSaveSession = async (sessionId) => {
    try {
      // Combine date and time into ISO string
      const sessionDateTime = new Date(`${sessionEditData.date}T${sessionEditData.time}`)
      
      const updates = {
        title: sessionEditData.title,
        session_date: sessionDateTime.toISOString(),
        duration_minutes: parseInt(sessionEditData.duration)
      }
      
      await handleApiCall(api.sessions.update, sessionId, updates, user.id)
      
      // Update local state
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, ...updates }
          : s
      ))
      
      setEditingSession(null)
      setSessionEditData({ title: '', date: '', time: '', duration: course?.session_duration || 60 })
    } catch (err) {
      console.error('Error updating session:', err)
      alert('Failed to update session')
    }
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setSessionEditData({ title: '', date: '', time: '', duration: course?.session_duration || 60 })
  }

  const handleDeleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return
    }

    try {
      await handleApiCall(api.sessions.delete, sessionId, user.id)
      
      // Remove from local state
      setSessions(sessions.filter(s => s.id !== sessionId))
      
      console.log('Session deleted successfully')
    } catch (err) {
      console.error('Error deleting session:', err)
      alert('Failed to delete session')
    }
  }

  const handleCreateSession = async () => {
    if (!newSession.date || !newSession.time) {
      alert('Please fill in date and time')
      return
    }

    try {
      // Combine date and time into ISO string
      const sessionDateTime = new Date(`${newSession.date}T${newSession.time}`)
      
      const sessionData = {
        title: newSession.topic || 'Session',
        description: '',
        session_date: sessionDateTime.toISOString(),
        duration_minutes: 60,
        meeting_link: course.meeting_link || '', // Use course meeting link
        student_id: null // All courses are group courses now
      }

      const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
      
      // Add to local state
      setSessions([...sessions, createdSession].sort((a, b) => 
        new Date(a.session_date) - new Date(b.session_date)
      ))
      
      setShowCreateModal(false)
      setNewSession({
        date: '',
        time: '',
        topic: ''
      })
    } catch (err) {
      console.error('Error creating session:', err)
      alert(err.message || 'Failed to create session')
    }
  }

  const handleCancelCreate = () => {
    setShowCreateModal(false)
    setNewSession({
      date: '',
      time: '',
      topic: ''
    })
  }

  // Helper function to format session date and time
  const formatSessionDateTime = (session) => {
    const date = new Date(session.session_date)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })
    }
  }



  return (
    <div className="manage-sessions">
      <div className="sessions-container">
        <div className="sessions-header-row">
          <h2>Group Sessions Schedule</h2>
          <div className="header-actions">
            <button 
              onClick={() => {
                setNewSession({
                  date: calculateNextSessionDate(),
                  time: course?.session_time || '',
                  topic: ''
                })
                setShowCreateModal(true)
              }} 
              className="btn-primary"
            >
              + Create Single Session
            </button>
          </div>
        </div>
        <div className="sessions-list">
          {sessions.map(session => {
            const { date, time } = formatSessionDateTime(session)
            return (
              <div key={session.id} className="session-item">
                <div className="session-date-time">
                  <div className="session-date">{date}</div>
                  <div className="session-time">{time}</div>
                  <div className="session-attendees">👥 {enrolledCount} students</div>
                </div>

                <div className="session-topic-area">
                  {editingSession === session.id ? (
                    <div className="topic-edit">
                      <div className="edit-fields">
                        <input
                          type="text"
                          value={sessionEditData.title}
                          onChange={(e) => setSessionEditData({ ...sessionEditData, title: e.target.value })}
                          placeholder="Enter session topic..."
                          className="topic-input"
                          autoFocus
                        />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                          <input
                            type="date"
                            value={sessionEditData.date}
                            onChange={(e) => setSessionEditData({ ...sessionEditData, date: e.target.value })}
                            className="topic-input"
                          />
                          <input
                            type="time"
                            value={sessionEditData.time}
                            onChange={(e) => setSessionEditData({ ...sessionEditData, time: e.target.value })}
                            className="topic-input"
                          />
                          <input
                            type="number"
                            value={sessionEditData.duration}
                            onChange={(e) => setSessionEditData({ ...sessionEditData, duration: e.target.value })}
                            placeholder="Duration (min)"
                            className="topic-input"
                            min="15"
                            step="15"
                          />
                        </div>
                      </div>
                      <div className="topic-actions">
                        <button 
                          onClick={() => handleSaveSession(session.id)}
                          className="btn-primary btn-sm"
                        >
                          Save
                        </button>
                        <button 
                          onClick={handleCancelEdit}
                          className="btn-secondary btn-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="topic-display">
                      <div className="topic-info">
                        {session.title && session.title.trim() ? (
                          <>
                            <div className="topic-text">{session.title}</div>
                            <span className="topic-status set">✓ Ready</span>
                          </>
                        ) : (
                          <>
                            <div className="topic-text empty">No topic set yet</div>
                            <span className="topic-status pending">⚠ Pending</span>
                          </>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        {course.meeting_link && (
                          <a
                            href={course.meeting_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-primary btn-sm"
                          >
                            Join Meeting
                          </a>
                        )}
                        <button 
                          onClick={() => handleEditSession(session)}
                          className="btn-secondary btn-sm"
                        >
                          {session.title ? 'Edit' : 'Set Details'}
                        </button>
                        <button 
                          onClick={() => handleDeleteSession(session.id)}
                          className="btn-secondary btn-sm"
                          style={{ color: '#dc2626' }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCancelCreate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Session</h2>
              <button className="close-button" onClick={handleCancelCreate}>×</button>
            </div>

            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Date *</label>
                  <input
                    id="date"
                    type="date"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="form-hint">Prefilled based on course schedule</p>
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time *</label>
                  <TimeInput
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                  />
                  <p className="form-hint">Prefilled from course schedule</p>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="topic">Session Topic (Optional)</label>
                <input
                  id="topic"
                  type="text"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  placeholder="e.g., Review scales and introduce new piece"
                  className="form-input"
                />
              </div>

              <div className="info-banner-modal">
                <span className="info-icon">ℹ️</span>
                <p>This session will be visible to all enrolled students. Meeting link will use the course default.</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelCreate}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleCreateSession}>
                Create Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageSessions
