import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
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

  // Course-level meeting link
  const [courseMeetingLink, setCourseMeetingLink] = useState('')
  const [isEditingMeetingLink, setIsEditingMeetingLink] = useState(false)
  const [meetingLinkInput, setMeetingLinkInput] = useState('')

  // Session editing state
  const [editingSession, setEditingSession] = useState(null)
  const [topicInput, setTopicInput] = useState('')
  const [sessionMeetingLinkInput, setSessionMeetingLinkInput] = useState('')
  
  // New session creation state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSession, setNewSession] = useState({
    studentId: '',
    date: '',
    time: '',
    topic: '',
    meetingLink: ''
  })

  // Recurring schedule state
  const [showRecurringModal, setShowRecurringModal] = useState(false)
  const [recurringSchedule, setRecurringSchedule] = useState({
    studentId: '',
    selectedDays: [],
    time: '',
    duration: 60,
    startDate: '',
    endDate: '',
    frequency: 'weekly'
  })
  
  // Store recurring schedules per student (for 1:1) or course (for group)
  const [recurringSchedules, setRecurringSchedules] = useState({})

  const isGroupCourse = course?.course_type === 'group'
  const enrolledCount = enrolledStudents.length
  const maxCapacity = course?.enrollment_limit || 0

  const groupedSessions = !isGroupCourse ? enrolledStudents.map(student => ({
    student,
    sessions: sessions.filter(s => s.student_id === student.id)
  })) : null

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
      setCourseMeetingLink(courseData.meeting_link || '')
      setMeetingLinkInput(courseData.meeting_link || '')

      // Fetch sessions
      const sessionsData = await handleApiCall(api.sessions.getCourse, courseId, user.id)
      setSessions(sessionsData || [])

      // Fetch enrolled students
      const enrollmentsData = await handleApiCall(api.enrollments.getCourse, courseId, user.id)
      
      // Extract student profiles from enrollments
      // Handle both direct enrollments (profiles) and parent-managed enrollments (students)
      const students = enrollmentsData.map(enrollment => {
        if (enrollment.student_profile_id) {
          // Parent-managed enrollment - need to fetch student profile
          return enrollment.students || {}
        } else {
          // Direct enrollment - use profile data
          return enrollment.profiles || {}
        }
      }).filter(student => student.id) // Filter out any null/undefined students
      
      setEnrolledStudents(students)

    } catch (err) {
      console.error('Error fetching course data:', err)
      setError('Failed to load course data')
    } finally {
      setLoading(false)
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

  const handleEditTopic = (session) => {
    setEditingSession(session.id)
    setTopicInput(session.title || '')
    setSessionMeetingLinkInput(session.meeting_link || courseMeetingLink)
  }

  const handleSaveMeetingLink = async () => {
    try {
      // Update course meeting link
      await handleApiCall(api.courses.update, courseId, { meeting_link: meetingLinkInput })
      setCourseMeetingLink(meetingLinkInput)
      setIsEditingMeetingLink(false)
    } catch (err) {
      console.error('Error updating meeting link:', err)
      alert('Failed to update meeting link')
    }
  }

  const handleCancelMeetingLink = () => {
    setMeetingLinkInput(courseMeetingLink)
    setIsEditingMeetingLink(false)
  }

  const handleSaveTopic = async (sessionId) => {
    try {
      const updates = {
        title: topicInput,
        meeting_link: sessionMeetingLinkInput
      }
      
      await handleApiCall(api.sessions.update, sessionId, updates, user.id)
      
      // Update local state
      setSessions(sessions.map(s => 
        s.id === sessionId 
          ? { ...s, title: topicInput, meeting_link: sessionMeetingLinkInput }
          : s
      ))
      
      setEditingSession(null)
      setTopicInput('')
      setSessionMeetingLinkInput('')
    } catch (err) {
      console.error('Error updating session:', err)
      alert('Failed to update session')
    }
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setTopicInput('')
    setSessionMeetingLinkInput('')
  }

  const handleCreateSession = async () => {
    if (!newSession.date || !newSession.time) {
      alert('Please fill in date and time')
      return
    }

    if (!isGroupCourse && !newSession.studentId) {
      alert('Please select a student')
      return
    }

    try {
      // Combine date and time into ISO string
      const sessionDateTime = new Date(`${newSession.date}T${newSession.time}`)
      
      const sessionData = {
        title: newSession.topic || 'Session',
        description: '',
        session_date: sessionDateTime.toISOString(),
        duration: 60,
        meeting_link: newSession.meetingLink || courseMeetingLink,
        student_id: !isGroupCourse ? newSession.studentId : null
      }

      const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
      
      // Add to local state
      setSessions([...sessions, createdSession].sort((a, b) => 
        new Date(a.session_date) - new Date(b.session_date)
      ))
      
      setShowCreateModal(false)
      setNewSession({
        studentId: '',
        date: '',
        time: '',
        topic: '',
        meetingLink: ''
      })
    } catch (err) {
      console.error('Error creating session:', err)
      alert(err.message || 'Failed to create session')
    }
  }

  const handleCancelCreate = () => {
    setShowCreateModal(false)
    setNewSession({
      studentId: '',
      date: '',
      time: '',
      topic: '',
      meetingLink: ''
    })
  }

  const handleOpenRecurringModal = (studentId = null) => {
    const existing = studentId ? recurringSchedules[studentId] : recurringSchedules['group']
    if (existing) {
      setRecurringSchedule(existing)
    } else {
      setRecurringSchedule({
        studentId: studentId || '',
        selectedDays: [],
        time: '',
        duration: 60,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        frequency: 'weekly'
      })
    }
    setShowRecurringModal(true)
  }

  const handleToggleDay = (day) => {
    setRecurringSchedule(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day]
    }))
  }

  const generateRecurringSessions = async () => {
    if (!recurringSchedule.selectedDays.length || !recurringSchedule.time || !recurringSchedule.startDate) {
      alert('Please fill in all required fields')
      return
    }

    if (!isGroupCourse && !recurringSchedule.studentId) {
      alert('Please select a student')
      return
    }

    try {
      const newSessions = []
      const start = new Date(recurringSchedule.startDate)
      const end = recurringSchedule.endDate ? new Date(recurringSchedule.endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days default
      
      let currentDate = new Date(start)

      while (currentDate <= end) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
        
        if (recurringSchedule.selectedDays.includes(dayName)) {
          const sessionDateTime = new Date(currentDate)
          const [hours, minutes] = recurringSchedule.time.split(':')
          sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          
          const sessionData = {
            title: 'Session',
            description: '',
            session_date: sessionDateTime.toISOString(),
            duration: recurringSchedule.duration,
            meeting_link: courseMeetingLink,
            student_id: !isGroupCourse ? recurringSchedule.studentId : null
          }
          
          const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
          newSessions.push(createdSession)
        }
        
        currentDate.setDate(currentDate.getDate() + 1)
      }

      setSessions([...sessions, ...newSessions].sort((a, b) => 
        new Date(a.session_date) - new Date(b.session_date)
      ))
      
      // Save recurring schedule
      const scheduleKey = isGroupCourse ? 'group' : recurringSchedule.studentId
      setRecurringSchedules({
        ...recurringSchedules,
        [scheduleKey]: recurringSchedule
      })

      setShowRecurringModal(false)
    } catch (err) {
      console.error('Error generating recurring sessions:', err)
      alert('Failed to generate sessions')
    }
  }

  const handleCancelRecurring = () => {
    setShowRecurringModal(false)
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
      <div className="sessions-header">
        <div>
          <button onClick={() => navigate(-1)} className="back-button">
            ← Back
          </button>
          <h1>Manage Sessions</h1>
          <p className="course-title">{course.title}</p>
        </div>
      </div>

      <div className="sessions-info-banner">
        <p>💡 {isGroupCourse 
          ? 'Set session topics for your group classes. All enrolled students will see the same schedule.'
          : 'Set session topics based on each student\'s progress and learning needs. Topics help students prepare for upcoming classes.'
        }</p>
      </div>

      {/* Course Schedule Information */}
      {isGroupCourse && course.selected_days && course.selected_days.length > 0 && (
        <div className="course-schedule-info">
          <h3>📅 Course Schedule</h3>
          <div className="schedule-details-grid">
            <div className="schedule-detail">
              <span className="detail-label">Days:</span>
              <span className="detail-value">{course.selected_days.join(', ')}</span>
            </div>
            <div className="schedule-detail">
              <span className="detail-label">Time:</span>
              <span className="detail-value">{course.session_time || 'Not set'}</span>
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
              <span className="detail-value">{new Date(course.start_date).toLocaleDateString()}</span>
              {course.has_end_date && course.end_date && (
                <>
                  <span className="detail-label" style={{ marginLeft: '2rem' }}>End Date:</span>
                  <span className="detail-value">{new Date(course.end_date).toLocaleDateString()}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}

      <div className="course-meeting-link-section">
        <h3>📹 Course Meeting Link</h3>
        <p className="meeting-link-description">Set one meeting link for all sessions in this course</p>
        {isEditingMeetingLink ? (
          <div className="meeting-link-edit">
            <input
              type="url"
              value={meetingLinkInput}
              onChange={(e) => setMeetingLinkInput(e.target.value)}
              placeholder="https://zoom.us/j/... or https://meet.google.com/..."
              className="meeting-link-input"
              autoFocus
            />
            <div className="meeting-link-actions">
              <button onClick={handleSaveMeetingLink} className="btn-primary btn-sm">
                Save Link
              </button>
              <button onClick={handleCancelMeetingLink} className="btn-secondary btn-sm">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="meeting-link-display-section">
            <div className="meeting-link-value">
              🔗 {courseMeetingLink || 'No meeting link set'}
            </div>
            <button onClick={() => setIsEditingMeetingLink(true)} className="btn-secondary btn-sm">
              {courseMeetingLink ? 'Edit Link' : 'Set Link'}
            </button>
          </div>
        )}
      </div>

      {isGroupCourse ? (
        <>
          <div className="course-stats">
            <div className="stat-card">
              <div className="stat-value">{enrolledCount}</div>
              <div className="stat-label">Enrolled Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{maxCapacity - enrolledCount}</div>
              <div className="stat-label">Spots Remaining</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{sessions.length}</div>
              <div className="stat-label">Upcoming Sessions</div>
            </div>
          </div>

          <div className="sessions-container">
            <div className="sessions-header-row">
              <h2>Group Sessions Schedule</h2>
              <div className="header-actions">
                <button onClick={() => handleOpenRecurringModal()} className="btn-secondary">
                  {recurringSchedules['group'] ? '⚙️ Edit Schedule' : '📅 Set up Recurring Schedule'}
                </button>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary">
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
                              value={topicInput}
                              onChange={(e) => setTopicInput(e.target.value)}
                              placeholder="Enter session topic..."
                              className="topic-input"
                              autoFocus
                            />
                            <input
                              type="url"
                              value={sessionMeetingLinkInput}
                              onChange={(e) => setSessionMeetingLinkInput(e.target.value)}
                              placeholder="Meeting link (Zoom, Google Meet, etc.)"
                              className="topic-input"
                            />
                          </div>
                          <div className="topic-actions">
                            <button 
                              onClick={() => handleSaveTopic(session.id)}
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
                                {session.meeting_link && (
                                  <div className="meeting-link-display">
                                    🔗 {session.meeting_link}
                                  </div>
                                )}
                                <span className="topic-status set">✓ Ready</span>
                              </>
                            ) : (
                              <>
                                <div className="topic-text empty">No topic set yet</div>
                                <span className="topic-status pending">⚠ Pending</span>
                              </>
                            )}
                          </div>
                          <button 
                            onClick={() => handleEditTopic(session)}
                            className="btn-secondary btn-sm"
                          >
                            {session.title ? 'Edit' : 'Set Details'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
      </div>
        </>
      ) : (
        <div className="students-sessions">
          <div className="create-session-section">
            <button onClick={() => setShowCreateModal(true)} className="btn-primary">
              + Create Single Session
            </button>
          </div>
          
          {groupedSessions.map(({ student, sessions: studentSessions }) => (
            <div key={student.id} className="student-section">
              <div className="student-header">
                <div>
                  <h2>{student.first_name} {student.last_name}</h2>
                  <div className="student-profile">
                    {student.neurodiversity_profile && student.neurodiversity_profile.map((need, idx) => (
                      <span key={idx} className="profile-badge">{need}</span>
                    ))}
                  </div>
                </div>
                <div className="student-actions">
                  <button 
                    onClick={() => handleOpenRecurringModal(student.id)} 
                    className="btn-secondary btn-sm"
                  >
                    {recurringSchedules[student.id] ? '⚙️ Edit Schedule' : '📅 Set Schedule'}
                  </button>
                </div>
              </div>

              <div className="sessions-list">
                {studentSessions.map(session => {
                  const { date, time } = formatSessionDateTime(session)
                  return (
                    <div key={session.id} className="session-item">
                      <div className="session-date-time">
                        <div className="session-date">{date}</div>
                        <div className="session-time">{time}</div>
                      </div>

                      <div className="session-topic-area">
                        {editingSession === session.id ? (
                          <div className="topic-edit">
                            <div className="edit-fields">
                              <input
                                type="text"
                                value={topicInput}
                                onChange={(e) => setTopicInput(e.target.value)}
                                placeholder="Enter session topic..."
                                className="topic-input"
                                autoFocus
                              />
                              <input
                                type="url"
                                value={sessionMeetingLinkInput}
                                onChange={(e) => setSessionMeetingLinkInput(e.target.value)}
                                placeholder="Meeting link (Zoom, Google Meet, etc.)"
                                className="topic-input"
                              />
                            </div>
                            <div className="topic-actions">
                              <button 
                                onClick={() => handleSaveTopic(session.id)}
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
                                  {session.meeting_link && (
                                    <div className="meeting-link-display">
                                      🔗 {session.meeting_link}
                                    </div>
                                  )}
                                  <span className="topic-status set">✓ Ready</span>
                                </>
                              ) : (
                                <>
                                  <div className="topic-text empty">No topic set yet</div>
                                  <span className="topic-status pending">⚠ Pending</span>
                                </>
                              )}
                            </div>
                            <button 
                              onClick={() => handleEditTopic(session)}
                              className="btn-secondary btn-sm"
                            >
                              {session.title ? 'Edit' : 'Set Details'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCancelCreate}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Session</h2>
              <button className="close-button" onClick={handleCancelCreate}>×</button>
            </div>

            <div className="modal-body">
              {!isGroupCourse && (
                <div className="form-group">
                  <label htmlFor="student">Student *</label>
                  <select
                    id="student"
                    value={newSession.studentId}
                    onChange={(e) => setNewSession({ ...newSession, studentId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select a student</option>
                    {enrolledStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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
                </div>

                <div className="form-group">
                  <label htmlFor="time">Time *</label>
                  <input
                    id="time"
                    type="time"
                    value={newSession.time}
                    onChange={(e) => setNewSession({ ...newSession, time: e.target.value })}
                    className="form-input"
                  />
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

              <div className="form-group">
                <label htmlFor="meetingLink">Meeting Link (Optional)</label>
                <input
                  id="meetingLink"
                  type="url"
                  value={newSession.meetingLink}
                  onChange={(e) => setNewSession({ ...newSession, meetingLink: e.target.value })}
                  placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  className="form-input"
                />
                <p className="form-hint">Leave blank to use course default: {courseMeetingLink}</p>
              </div>

              <div className="info-banner-modal">
                <span className="info-icon">ℹ️</span>
                <p>
                  {isGroupCourse 
                    ? 'This session will be visible to all enrolled students.'
                    : 'After creating the session, you can discuss details with the student via chat.'}
                </p>
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

      {/* Recurring Schedule Modal */}
      {showRecurringModal && (
        <div className="modal-overlay" onClick={handleCancelRecurring}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{recurringSchedules[recurringSchedule.studentId || 'group'] ? 'Edit Recurring Schedule' : 'Set up Recurring Schedule'}</h2>
              <button className="close-button" onClick={handleCancelRecurring}>×</button>
            </div>

            <div className="modal-body">
              {!isGroupCourse && (
                <div className="form-group">
                  <label htmlFor="recurring-student">Student *</label>
                  <select
                    id="recurring-student"
                    value={recurringSchedule.studentId}
                    onChange={(e) => setRecurringSchedule({ ...recurringSchedule, studentId: e.target.value })}
                    className="form-input"
                  >
                    <option value="">Select a student</option>
                    {enrolledStudents.map(student => (
                      <option key={student.id} value={student.id}>
                        {student.first_name} {student.last_name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="form-group">
                <label>On These Days *</label>
                <div className="day-selector">
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                    <button
                      key={day}
                      type="button"
                      className={`day-button ${recurringSchedule.selectedDays.includes(day) ? 'selected' : ''}`}
                      onClick={() => handleToggleDay(day)}
                    >
                      {day.substring(0, 3)}
                    </button>
                  ))}
                </div>
                <p className="form-hint">Select the days of the week when sessions will occur</p>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="recurring-time">Session Time *</label>
                  <input
                    id="recurring-time"
                    type="time"
                    value={recurringSchedule.time}
                    onChange={(e) => setRecurringSchedule({ ...recurringSchedule, time: e.target.value })}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    value={recurringSchedule.duration}
                    onChange={(e) => setRecurringSchedule({ ...recurringSchedule, duration: parseInt(e.target.value) })}
                    className="form-input"
                    min="15"
                    step="15"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="start-date">Start Date *</label>
                  <input
                    id="start-date"
                    type="date"
                    value={recurringSchedule.startDate}
                    onChange={(e) => setRecurringSchedule({ ...recurringSchedule, startDate: e.target.value })}
                    className="form-input"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="end-date">End Date (Optional)</label>
                  <input
                    id="end-date"
                    type="date"
                    value={recurringSchedule.endDate}
                    onChange={(e) => setRecurringSchedule({ ...recurringSchedule, endDate: e.target.value })}
                    className="form-input"
                    min={recurringSchedule.startDate}
                  />
                  <p className="form-hint">Leave blank for 3 months</p>
                </div>
              </div>

              <div className="info-banner-modal">
                <span className="info-icon">ℹ️</span>
                <p>
                  {isGroupCourse 
                    ? 'This will create recurring sessions for all enrolled students on the selected days and time.'
                    : 'This will create recurring sessions for the selected student. You can set different schedules for each student.'}
                </p>
              </div>

              {recurringSchedule.selectedDays.length > 0 && recurringSchedule.time && recurringSchedule.startDate && (
                <div className="schedule-preview">
                  <h4>Schedule Preview:</h4>
                  <p>
                    <strong>{recurringSchedule.selectedDays.join(', ')}</strong> at <strong>{recurringSchedule.time}</strong>
                    {!isGroupCourse && recurringSchedule.studentId && (
                      <> for <strong>{enrolledStudents.find(s => s.id === recurringSchedule.studentId)?.first_name} {enrolledStudents.find(s => s.id === recurringSchedule.studentId)?.last_name}</strong></>
                    )}
                  </p>
                  <p className="preview-detail">
                    Starting {new Date(recurringSchedule.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    {recurringSchedule.endDate && (
                      <> until {new Date(recurringSchedule.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={handleCancelRecurring}>
                Cancel
              </button>
              <button className="btn-primary" onClick={generateRecurringSessions}>
                {recurringSchedules[recurringSchedule.studentId || 'group'] ? 'Update Schedule' : 'Generate Sessions'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageSessions
