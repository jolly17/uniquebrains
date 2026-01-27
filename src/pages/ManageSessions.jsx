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
  const [sessionEditData, setSessionEditData] = useState({
    title: '',
    date: '',
    time: '',
    duration: 60
  })
  
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
    sessions: sessions.filter(s => {
      // Match by student_id (direct enrollment) or student_profile_id (parent-managed)
      if (student.enrollmentType === 'student_profile') {
        return s.student_profile_id === student.id
      } else {
        return s.student_id === student.id
      }
    })
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
      
      // Auto-generate sessions for group courses if none exist
      if (courseData.course_type === 'group' && 
          (!sessionsData || sessionsData.length === 0) &&
          courseData.selected_days && 
          courseData.selected_days.length > 0 &&
          courseData.session_time &&
          courseData.start_date) {
        
        console.log('Auto-generating sessions for group course...')
        const generatedSessions = await autoGenerateSessions(courseData)
        setSessions(generatedSessions)
      } else {
        setSessions(sessionsData || [])
      }

      // Fetch enrolled students
      const enrollmentsData = await handleApiCall(api.enrollments.getCourse, courseId, user.id)
      
      // Extract student profiles from enrollments
      // Handle both direct enrollments (profiles) and parent-managed enrollments (students)
      const students = enrollmentsData.map(enrollment => {
        let studentData = {}
        
        if (enrollment.student_profile_id && enrollment.students) {
          // Parent-managed enrollment - use student profile data from students table
          studentData = {
            ...enrollment.students,
            enrollmentType: 'student_profile', // Track the type
            student_profile_id: enrollment.student_profile_id // Keep the ID
          }
        } else if (enrollment.student_id && enrollment.profiles) {
          // Direct enrollment - use profile data
          studentData = {
            ...enrollment.profiles,
            enrollmentType: 'student', // Track the type
            student_id: enrollment.student_id // Keep the ID
          }
        }
        
        return studentData
      }).filter(student => student.id) // Filter out any null/undefined students
      
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
          title: `Topic ${sessionNumber}`,
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
            title: `Topic ${sessionNumber}`,
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

  const handleSaveMeetingLink = async () => {
    try {
      // Update course meeting link with instructor ID
      await handleApiCall(api.courses.update, courseId, { meeting_link: meetingLinkInput }, user.id)
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
      setSessionEditData({ title: '', date: '', time: '', duration: 60 })
    } catch (err) {
      console.error('Error updating session:', err)
      alert('Failed to update session')
    }
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setSessionEditData({ title: '', date: '', time: '', duration: 60 })
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

    if (!isGroupCourse && !newSession.studentId) {
      alert('Please select a student')
      return
    }

    try {
      // Combine date and time into ISO string
      const sessionDateTime = new Date(`${newSession.date}T${newSession.time}`)
      
      // Find the selected student to determine enrollment type
      const selectedStudent = enrolledStudents.find(s => s.id === newSession.studentId)
      
      const sessionData = {
        title: newSession.topic || 'Session',
        description: '',
        session_date: sessionDateTime.toISOString(),
        duration_minutes: 60,
        meeting_link: newSession.meetingLink || courseMeetingLink
      }
      
      // Set the appropriate student field based on enrollment type
      if (!isGroupCourse && selectedStudent) {
        if (selectedStudent.enrollmentType === 'student_profile') {
          sessionData.student_profile_id = selectedStudent.id
        } else {
          sessionData.student_id = selectedStudent.id
        }
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
      
      // For courses without end date, generate 5 sessions
      // For courses with end date, generate all sessions until end date
      const hasEndDate = recurringSchedule.endDate && recurringSchedule.endDate.trim() !== ''
      const end = hasEndDate ? new Date(recurringSchedule.endDate) : null
      const maxSessions = hasEndDate ? 1000 : 5 // Limit to 5 for open-ended schedules
      
      let currentDate = new Date(start)
      let sessionNumber = 1
      let sessionsCreated = 0

      while (sessionsCreated < maxSessions && (!end || currentDate <= end)) {
        const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
        
        if (recurringSchedule.selectedDays.includes(dayName)) {
          const sessionDateTime = new Date(currentDate)
          const [hours, minutes] = recurringSchedule.time.split(':')
          sessionDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          
          // Find the selected student to determine enrollment type
          const selectedStudent = enrolledStudents.find(s => s.id === recurringSchedule.studentId)
          
          const sessionData = {
            title: `Session ${sessionNumber}`,
            description: '',
            session_date: sessionDateTime.toISOString(),
            duration_minutes: recurringSchedule.duration,
            meeting_link: courseMeetingLink
          }
          
          // Set the appropriate student field based on enrollment type
          if (!isGroupCourse && selectedStudent) {
            if (selectedStudent.enrollmentType === 'student_profile') {
              sessionData.student_profile_id = selectedStudent.id
            } else {
              sessionData.student_id = selectedStudent.id
            }
          }
          
          const createdSession = await handleApiCall(api.sessions.create, courseId, sessionData, user.id)
          newSessions.push(createdSession)
          sessionNumber++
          sessionsCreated++
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
      
      // Show success message
      const message = hasEndDate 
        ? `Created ${newSessions.length} sessions from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`
        : `Created ${newSessions.length} initial sessions starting ${start.toLocaleDateString()}`
      alert(message)
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
          <div className="sessions-container">
            <div className="sessions-header-row">
              <h2>Group Sessions Schedule</h2>
              <div className="header-actions">
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
                  <p className="form-hint">Leave blank to create 5 initial sessions</p>
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
