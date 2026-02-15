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
  
  // Course details editing state
  const [isEditingDetails, setIsEditingDetails] = useState(false)
  const [detailsData, setDetailsData] = useState({
    title: '',
    description: '',
    category: '',
    ageGroup: '',
    enrollmentLimit: '',
    sessionDuration: '',
    sessionTime: '',
    selectedDays: [],
    timezone: '',
    meetingLink: '',
    endDate: ''
  })
  
  const activeTab = searchParams.get('tab') || 'details'

  // Fetch course data, sessions, and enrollments
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        setLoading(true)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
        
        // Initialize details data
        setDetailsData({
          title: courseData.title || '',
          description: courseData.description || '',
          category: courseData.category || '',
          ageGroup: courseData.age_group || '',
          enrollmentLimit: courseData.enrollment_limit || '',
          sessionDuration: courseData.session_duration || '',
          sessionTime: courseData.session_time || '',
          selectedDays: courseData.selected_days || [],
          timezone: courseData.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          meetingLink: courseData.meeting_link || '',
          endDate: courseData.end_date || ''
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
    const currentDays = detailsData.selectedDays
    if (currentDays.includes(day)) {
      setDetailsData({
        ...detailsData,
        selectedDays: currentDays.filter(d => d !== day)
      })
    } else {
      setDetailsData({
        ...detailsData,
        selectedDays: [...currentDays, day]
      })
    }
  }

  const handleSaveDetails = async () => {
    try {
      // Validate required fields
      if (!detailsData.title || !detailsData.description) {
        alert('Please fill in title and description')
        return
      }

      // Update course
      await handleApiCall(api.courses.update, courseId, {
        title: detailsData.title,
        description: detailsData.description,
        category: detailsData.category,
        age_group: detailsData.ageGroup,
        enrollment_limit: detailsData.enrollmentLimit || null,
        session_duration: detailsData.sessionDuration,
        session_time: detailsData.sessionTime,
        selected_days: detailsData.selectedDays,
        timezone: detailsData.timezone,
        meeting_link: detailsData.meetingLink,
        end_date: detailsData.endDate || null
      }, user.id)

      // Update local state
      setCourse({
        ...course,
        title: detailsData.title,
        description: detailsData.description,
        category: detailsData.category,
        age_group: detailsData.ageGroup,
        enrollment_limit: detailsData.enrollmentLimit,
        session_duration: detailsData.sessionDuration,
        session_time: detailsData.sessionTime,
        selected_days: detailsData.selectedDays,
        timezone: detailsData.timezone,
        meeting_link: detailsData.meetingLink,
        end_date: detailsData.endDate
      })

      setIsEditingDetails(false)
      alert('Course details updated successfully')
    } catch (err) {
      console.error('Error updating course details:', err)
      alert('Failed to update course details')
    }
  }

  const handleCancelDetails = () => {
    // Reset to current course data
    setDetailsData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      ageGroup: course.age_group || '',
      enrollmentLimit: course.enrollment_limit || '',
      sessionDuration: course.session_duration || '',
      sessionTime: course.session_time || '',
      selectedDays: course.selected_days || [],
      timezone: course.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
      meetingLink: course.meeting_link || '',
      endDate: course.end_date || ''
    })
    setIsEditingDetails(false)
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
          className={`tab-button ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => handleTabChange('details')}
        >
          📋 Course Details
        </button>
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
        {activeTab === 'details' && (
          <div className="course-details-tab">
            <div className="details-header">
              <h2>Course Information</h2>
              {!isEditingDetails ? (
                <button onClick={() => setIsEditingDetails(true)} className="btn-primary">
                  Edit Details
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={handleSaveDetails} className="btn-primary">
                    Save Changes
                  </button>
                  <button onClick={handleCancelDetails} className="btn-secondary">
                    Cancel
                  </button>
                </div>
              )}
            </div>

            <div className="details-content">
              <div className="detail-section">
                <label>Course Title</label>
                {isEditingDetails ? (
                  <input
                    type="text"
                    value={detailsData.title}
                    onChange={(e) => setDetailsData({ ...detailsData, title: e.target.value })}
                    className="detail-input"
                  />
                ) : (
                  <p>{course.title}</p>
                )}
              </div>

              <div className="detail-section">
                <label>Description</label>
                {isEditingDetails ? (
                  <textarea
                    value={detailsData.description}
                    onChange={(e) => setDetailsData({ ...detailsData, description: e.target.value })}
                    className="detail-input"
                    rows="4"
                  />
                ) : (
                  <p>{course.description}</p>
                )}
              </div>

              <div className="detail-row">
                <div className="detail-section">
                  <label>Category</label>
                  {isEditingDetails ? (
                    <select
                      value={detailsData.category}
                      onChange={(e) => setDetailsData({ ...detailsData, category: e.target.value })}
                      className="detail-input"
                    >
                      <option value="performing-arts">Performing Arts 🎭</option>
                      <option value="visual-arts">Visual Arts 🎨</option>
                      <option value="parenting">Parenting 👨‍👩‍👧‍👦</option>
                      <option value="academics">Academics 📚</option>
                      <option value="language">Language 🌍</option>
                      <option value="spirituality">Spirituality 🧘</option>
                      <option value="lifeskills">Life Skills 🐷</option>
                      <option value="hobbies">Hobbies & Fun 🎮</option>
                    </select>
                  ) : (
                    <p>{course.category}</p>
                  )}
                </div>

                <div className="detail-section">
                  <label>Age Group</label>
                  {isEditingDetails ? (
                    <select
                      value={detailsData.ageGroup}
                      onChange={(e) => setDetailsData({ ...detailsData, ageGroup: e.target.value })}
                      className="detail-input"
                    >
                      <option value="All ages">👥 All ages</option>
                      <option value="5-8 years">🧒 5-8 years</option>
                      <option value="9-12 years">👦 9-12 years</option>
                      <option value="13-18 years">🧑 13-18 years</option>
                      <option value="Adults">👨 Adults</option>
                    </select>
                  ) : (
                    <p>{course.age_group}</p>
                  )}
                </div>

                <div className="detail-section">
                  <label>Max Students</label>
                  {isEditingDetails ? (
                    <input
                      type="number"
                      value={detailsData.enrollmentLimit}
                      onChange={(e) => setDetailsData({ ...detailsData, enrollmentLimit: e.target.value })}
                      className="detail-input"
                      min="1"
                      placeholder="Unlimited"
                    />
                  ) : (
                    <p>{course.enrollment_limit || 'Unlimited'}</p>
                  )}
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem' }}>Schedule</h3>

              <div className="detail-row">
                <div className="detail-section">
                  <label>Session Time</label>
                  {isEditingDetails ? (
                    <TimeInput
                      value={detailsData.sessionTime}
                      onChange={(e) => setDetailsData({ ...detailsData, sessionTime: e.target.value })}
                    />
                  ) : (
                    <p>{course.session_time || 'Not set'}</p>
                  )}
                </div>

                <div className="detail-section">
                  <label>Duration (minutes)</label>
                  {isEditingDetails ? (
                    <select
                      value={detailsData.sessionDuration}
                      onChange={(e) => setDetailsData({ ...detailsData, sessionDuration: e.target.value })}
                      className="detail-input"
                    >
                      <option value="">Select duration</option>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                    </select>
                  ) : (
                    <p>{course.session_duration} minutes</p>
                  )}
                </div>

                <div className="detail-section">
                  <label>Timezone</label>
                  {isEditingDetails ? (
                    <select
                      value={detailsData.timezone}
                      onChange={(e) => setDetailsData({ ...detailsData, timezone: e.target.value })}
                      className="detail-input"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="America/Anchorage">Alaska Time (AKT)</option>
                      <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                      <option value="Europe/London">London (GMT/BST)</option>
                      <option value="Europe/Paris">Paris (CET/CEST)</option>
                      <option value="Europe/Berlin">Berlin (CET/CEST)</option>
                      <option value="Asia/Dubai">Dubai (GST)</option>
                      <option value="Asia/Kolkata">India (IST)</option>
                      <option value="Asia/Singapore">Singapore (SGT)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEDT/AEST)</option>
                    </select>
                  ) : (
                    <p>{course.timezone || 'Not set'}</p>
                  )}
                </div>
              </div>

              <div className="detail-section">
                <label>Days</label>
                {isEditingDetails ? (
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
                          borderColor: detailsData.selectedDays.includes(day) ? '#3b82f6' : '#d1d5db',
                          background: detailsData.selectedDays.includes(day) ? '#3b82f6' : 'white',
                          color: detailsData.selectedDays.includes(day) ? 'white' : '#374151',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          fontWeight: '500'
                        }}
                      >
                        {day.substring(0, 3)}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p>{course.selected_days?.join(', ') || 'Not set'}</p>
                )}
              </div>

              <div className="detail-section">
                <label>End Date (Optional)</label>
                {isEditingDetails ? (
                  <>
                    <input
                      type="date"
                      value={detailsData.endDate}
                      onChange={(e) => setDetailsData({ ...detailsData, endDate: e.target.value })}
                      className="detail-input"
                    />
                    <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                      💡 Leave empty for ongoing course
                    </p>
                  </>
                ) : (
                  <p>{course.end_date ? new Date(course.end_date).toLocaleDateString('en-US') : 'Ongoing'}</p>
                )}
              </div>

              <div className="detail-section">
                <label>Meeting Link</label>
                {isEditingDetails ? (
                  <input
                    type="url"
                    value={detailsData.meetingLink}
                    onChange={(e) => setDetailsData({ ...detailsData, meetingLink: e.target.value })}
                    className="detail-input"
                    placeholder="https://zoom.us/j/... or https://meet.google.com/..."
                  />
                ) : (
                  <p>{course.meeting_link || 'Not set'}</p>
                )}
              </div>
            </div>
          </div>
        )}
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
