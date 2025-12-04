import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { mockCourses } from '../data/mockData'
import './ManageSessions.css'

function ManageSessions() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const course = mockCourses.find(c => c.id === courseId)

  if (!course) return <div>Course not found</div>

  const isGroupCourse = course.courseType === 'group'

  // Mock enrolled students
  const enrolledStudents = [
    { id: '1', name: 'Emma Thompson', neurodiversity: ['Autism'] },
    { id: '2', name: 'Liam Chen', neurodiversity: ['ADHD', 'Dyslexia'] },
    { id: '3', name: 'Sophia Rodriguez', neurodiversity: ['Other'] }
  ]

  const enrolledCount = isGroupCourse ? 8 : enrolledStudents.length
  const maxCapacity = course.enrollmentLimit || 10

  // Course-level meeting link
  const [courseMeetingLink, setCourseMeetingLink] = useState('https://zoom.us/j/123456789')
  const [isEditingMeetingLink, setIsEditingMeetingLink] = useState(false)
  const [meetingLinkInput, setMeetingLinkInput] = useState(courseMeetingLink)

  // Mock sessions - different structure for group vs 1:1
  const [sessions, setSessions] = useState(isGroupCourse ? [
    { 
      id: 1, 
      date: '2024-01-15', 
      time: '10:00 AM', 
      topic: 'Introduction to scales and basic techniques',
      topicSet: true,
      attendees: 8
    },
    { 
      id: 2, 
      date: '2024-01-17', 
      time: '10:00 AM', 
      topic: '',
      topicSet: false,
      meetingLink: '',
      attendees: 8
    },
    { 
      id: 3, 
      date: '2024-01-22', 
      time: '10:00 AM', 
      topic: '',
      topicSet: false,
      meetingLink: '',
      attendees: 8
    },
    { 
      id: 4, 
      date: '2024-01-24', 
      time: '10:00 AM', 
      topic: '',
      topicSet: false,
      meetingLink: '',
      attendees: 8
    }
  ] : [
    // 1:1 sessions - per student
    { 
      id: 1, 
      studentId: '1', 
      studentName: 'Emma Thompson',
      date: '2024-01-15', 
      time: '10:00 AM', 
      topic: 'Review scales and introduce new piece',
      topicSet: true,
      meetingLink: 'https://zoom.us/j/123456789'
    },
    { 
      id: 2, 
      studentId: '1', 
      studentName: 'Emma Thompson',
      date: '2024-01-17', 
      time: '10:00 AM', 
      topic: '',
      topicSet: false,
      meetingLink: ''
    },
    { 
      id: 3, 
      studentId: '2', 
      studentName: 'Liam Chen',
      date: '2024-01-15', 
      time: '11:00 AM', 
      topic: 'Continue with chord progressions',
      topicSet: true,
      meetingLink: 'https://meet.google.com/abc-defg-hij'
    },
    { 
      id: 4, 
      studentId: '2', 
      studentName: 'Liam Chen',
      date: '2024-01-17', 
      time: '11:00 AM', 
      topic: '',
      topicSet: false,
      meetingLink: ''
    }
  ])

  const [editingSession, setEditingSession] = useState(null)
  const [topicInput, setTopicInput] = useState('')
  
  // New session creation state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newSession, setNewSession] = useState({
    studentId: '',
    date: '',
    time: '',
    topic: '',
    meetingLink: courseMeetingLink
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

  const groupedSessions = !isGroupCourse ? enrolledStudents.map(student => ({
    student,
    sessions: sessions.filter(s => s.studentId === student.id)
  })) : null

  const handleEditTopic = (session) => {
    setEditingSession(session.id)
    setTopicInput(session.topic)
  }

  const handleSaveMeetingLink = () => {
    setCourseMeetingLink(meetingLinkInput)
    setIsEditingMeetingLink(false)
  }

  const handleCancelMeetingLink = () => {
    setMeetingLinkInput(courseMeetingLink)
    setIsEditingMeetingLink(false)
  }

  const handleSaveTopic = (sessionId) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, topic: topicInput, topicSet: topicInput.trim() !== '' }
        : s
    ))
    setEditingSession(null)
    setTopicInput('')
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setTopicInput('')
  }

  const handleCreateSession = () => {
    if (!newSession.date || !newSession.time) {
      alert('Please fill in date and time')
      return
    }

    if (!isGroupCourse && !newSession.studentId) {
      alert('Please select a student')
      return
    }

    const session = {
      id: sessions.length + 1,
      date: newSession.date,
      time: newSession.time,
      topic: newSession.topic,
      topicSet: newSession.topic.trim() !== '',
      meetingLink: newSession.meetingLink || courseMeetingLink,
      ...(isGroupCourse 
        ? { attendees: enrolledCount }
        : { 
            studentId: newSession.studentId,
            studentName: enrolledStudents.find(s => s.id === newSession.studentId)?.name
          }
      )
    }

    setSessions([...sessions, session].sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)))
    setShowCreateModal(false)
    setNewSession({
      studentId: '',
      date: '',
      time: '',
      topic: '',
      meetingLink: courseMeetingLink
    })
  }

  const handleCancelCreate = () => {
    setShowCreateModal(false)
    setNewSession({
      studentId: '',
      date: '',
      time: '',
      topic: '',
      meetingLink: courseMeetingLink
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

  const generateRecurringSessions = () => {
    if (!recurringSchedule.selectedDays.length || !recurringSchedule.time || !recurringSchedule.startDate) {
      alert('Please fill in all required fields')
      return
    }

    if (!isGroupCourse && !recurringSchedule.studentId) {
      alert('Please select a student')
      return
    }

    const newSessions = []
    const start = new Date(recurringSchedule.startDate)
    const end = recurringSchedule.endDate ? new Date(recurringSchedule.endDate) : new Date(start.getTime() + 90 * 24 * 60 * 60 * 1000) // 90 days default
    
    const dayMap = {
      'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4,
      'Friday': 5, 'Saturday': 6, 'Sunday': 0
    }

    let currentDate = new Date(start)
    let sessionId = sessions.length + 1

    while (currentDate <= end) {
      const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDate.getDay()]
      
      if (recurringSchedule.selectedDays.includes(dayName)) {
        const session = {
          id: sessionId++,
          date: currentDate.toISOString().split('T')[0],
          time: recurringSchedule.time,
          topic: '',
          topicSet: false,
          meetingLink: courseMeetingLink,
          recurring: true,
          ...(isGroupCourse 
            ? { attendees: enrolledCount }
            : { 
                studentId: recurringSchedule.studentId,
                studentName: enrolledStudents.find(s => s.id === recurringSchedule.studentId)?.name
              }
          )
        }
        newSessions.push(session)
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    setSessions([...sessions, ...newSessions].sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time)))
    
    // Save recurring schedule
    const scheduleKey = isGroupCourse ? 'group' : recurringSchedule.studentId
    setRecurringSchedules({
      ...recurringSchedules,
      [scheduleKey]: recurringSchedule
    })

    setShowRecurringModal(false)
  }

  const handleCancelRecurring = () => {
    setShowRecurringModal(false)
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
              {sessions.map(session => (
            <div key={session.id} className="session-item">
              <div className="session-date-time">
                <div className="session-date">
                  {new Date(session.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
                <div className="session-time">{session.time}</div>
                <div className="session-attendees">👥 {session.attendees} students</div>
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
                        value={meetingLinkInput}
                        onChange={(e) => setMeetingLinkInput(e.target.value)}
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
                      {session.topicSet ? (
                        <>
                          <div className="topic-text">{session.topic}</div>
                          {session.meetingLink && (
                            <div className="meeting-link-display">
                              🔗 {session.meetingLink}
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
                      {session.topicSet ? 'Edit' : 'Set Details'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
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
                  <h2>{student.name}</h2>
                  <div className="student-profile">
                    {student.neurodiversity.map((need, idx) => (
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
                {studentSessions.map(session => (
                  <div key={session.id} className="session-item">
                    <div className="session-date-time">
                      <div className="session-date">
                        {new Date(session.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                      <div className="session-time">{session.time}</div>
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
                              value={meetingLinkInput}
                              onChange={(e) => setMeetingLinkInput(e.target.value)}
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
                            {session.topicSet ? (
                              <>
                                <div className="topic-text">{session.topic}</div>
                                {session.meetingLink && (
                                  <div className="meeting-link-display">
                                    🔗 {session.meetingLink}
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
                            {session.topicSet ? 'Edit' : 'Set Details'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
                        {student.name}
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
                        {student.name}
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
                      <> for <strong>{enrolledStudents.find(s => s.id === recurringSchedule.studentId)?.name}</strong></>
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
