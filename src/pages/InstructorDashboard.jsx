import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import './InstructorDashboard.css'

function InstructorDashboard() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const totalStudents = 156 // Will be calculated from real data later
  const sessionsCompleted = 87 // Will be calculated from real data later
  const pendingRequests = 3 // Mock pending join requests

  useEffect(() => {
    if (user) {
      fetchInstructorCourses()
    }
  }, [user])

  const fetchInstructorCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select(`
          *,
          sessions (
            id,
            title,
            session_date,
            status
          ),
          enrollments (
            id,
            student_id
          )
        `)
        .eq('instructor_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setCourses(data || [])
    } catch (error) {
      console.error('Error fetching courses:', error)
      setError('Failed to load courses')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          {pendingRequests > 0 && (
            <div className="notification-alert">
              🔔 You have {pendingRequests} pending enrollment request{pendingRequests > 1 ? 's' : ''}
            </div>
          )}
        </div>
        <Link to="/instructor/create-course" className="btn-primary">
          Create New Course
        </Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{sessionsCompleted}</div>
          <div className="stat-label">Sessions Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">4.8</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Courses</h2>
        {loading ? (
          <div>Loading courses...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>You haven't created any courses yet.</p>
            <Link to="/instructor/create-course" className="btn-primary">
              Create Your First Course
            </Link>
          </div>
        ) : (
          <div className="instructor-courses-list">
            {courses.map(course => (
              <div key={course.id} className="instructor-course-card">
                <div className="course-details">
                  <h3>{course.title}</h3>
                  <div className="course-stats">
                    <span>
                      {course.enrollments?.length || 0}
                      {course.enrollment_limit ? ` / ${course.enrollment_limit}` : ''} students
                      {course.enrollment_limit && (course.enrollments?.length || 0) >= course.enrollment_limit && (
                        <span className="full-indicator"> (FULL)</span>
                      )}
                    </span>
                    <span>Status: {course.status}</span>
                    <span>{course.sessions?.length || 0} sessions</span>
                  </div>
                  <p className="course-description">{course.description}</p>
                </div>
                <div className="course-actions">
                  <Link to={`/courses/${course.id}`} className="btn-secondary">
                    View
                  </Link>
                  <Link to={`/instructor/course/${course.id}/manage`} className="btn-primary">
                    Manage Course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="dashboard-section">
        <h2>Pending Enrollment Requests</h2>
        <div className="requests-list">
          <div className="request-item">
            <div className="request-info">
              <div className="request-student">Emma Thompson</div>
              <div className="request-course">Positive Parenting Fundamentals</div>
              <div className="request-profile">
                <span className="profile-badge">Autism</span>
              </div>
              <div className="request-time">2 hours ago</div>
            </div>
            <div className="request-actions">
              <button className="btn-primary">Approve</button>
              <button className="btn-secondary">Decline</button>
            </div>
          </div>
          <div className="request-item">
            <div className="request-info">
              <div className="request-student">Liam Chen</div>
              <div className="request-course">Positive Parenting Fundamentals</div>
              <div className="request-profile">
                <span className="profile-badge">ADHD</span>
                <span className="profile-badge">Dyslexia</span>
              </div>
              <div className="request-time">5 hours ago</div>
            </div>
            <div className="request-actions">
              <button className="btn-primary">Approve</button>
              <button className="btn-secondary">Decline</button>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>Recent Activity</h2>
        <div className="activity-list">
          <Link to="/instructor/course/1/manage?tab=homework" className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <div className="activity-title">New homework submission</div>
              <div className="activity-subtitle">Positive Parenting Fundamentals</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </Link>
          <Link to="/instructor/course/1/manage?tab=students" className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <div className="activity-title">3 new students enrolled</div>
              <div className="activity-subtitle">Positive Parenting Fundamentals</div>
              <div className="activity-time">1 day ago</div>
            </div>
          </Link>
          <div className="activity-item">
            <div className="activity-icon">⭐</div>
            <div className="activity-content">
              <div className="activity-title">New 5-star review received</div>
              <div className="activity-subtitle">Piano for Beginners</div>
              <div className="activity-time">5 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
