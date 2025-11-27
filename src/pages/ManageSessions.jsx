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

  // Mock sessions - different structure for group vs 1:1
  const [sessions, setSessions] = useState(isGroupCourse ? [
    { 
      id: 1, 
      date: '2024-01-15', 
      time: '10:00 AM', 
      topic: 'Introduction to scales and basic techniques',
      topicSet: true,
      meetingLink: 'https://zoom.us/j/123456789',
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
  const [meetingLinkInput, setMeetingLinkInput] = useState('')

  const groupedSessions = !isGroupCourse ? enrolledStudents.map(student => ({
    student,
    sessions: sessions.filter(s => s.studentId === student.id)
  })) : null

  const handleEditTopic = (session) => {
    setEditingSession(session.id)
    setTopicInput(session.topic)
    setMeetingLinkInput(session.meetingLink)
  }

  const handleSaveTopic = (sessionId) => {
    setSessions(sessions.map(s => 
      s.id === sessionId 
        ? { ...s, topic: topicInput, topicSet: topicInput.trim() !== '', meetingLink: meetingLinkInput }
        : s
    ))
    setEditingSession(null)
    setTopicInput('')
    setMeetingLinkInput('')
  }

  const handleCancelEdit = () => {
    setEditingSession(null)
    setTopicInput('')
    setMeetingLinkInput('')
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
          ? 'Set session topics and meeting links for your group classes. All enrolled students will see the same schedule.'
          : 'Set session topics based on each student\'s progress and learning needs. Topics help students prepare for upcoming classes.'
        }</p>
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
            <h2>Group Sessions Schedule</h2>
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
                <button className="btn-secondary">View Progress</button>
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
    </div>
  )
}

export default ManageSessions
