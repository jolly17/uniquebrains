import { Link } from 'react-router-dom'
import { mockCourses } from '../data/mockData'
import './InstructorDashboard.css'

function InstructorDashboard() {
  // Mock instructor courses
  const instructorCourses = mockCourses.slice(0, 2)
  const totalStudents = 156
  const totalRevenue = 4250
  const pendingRequests = 3 // Mock pending join requests

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
          <div className="stat-value">{instructorCourses.length}</div>
          <div className="stat-label">Active Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalStudents}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">${totalRevenue}</div>
          <div className="stat-label">Total Revenue</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">4.8</div>
          <div className="stat-label">Average Rating</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Courses</h2>
        <div className="instructor-courses-list">
          {instructorCourses.map(course => (
            <div key={course.id} className="instructor-course-card">
              <div className="course-details">
                <h3>{course.title}</h3>
                <div className="course-stats">
                  <span>
                    {course.currentEnrollment}
                    {course.enrollmentLimit ? ` / ${course.enrollmentLimit}` : ''} students
                    {course.enrollmentLimit && course.currentEnrollment >= course.enrollmentLimit && (
                      <span className="full-indicator"> (FULL)</span>
                    )}
                  </span>
                  <span>★ {course.averageRating}</span>
                  <span>{course.learningObjectives.length} learning objectives</span>
                </div>
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
          <div className="activity-item">
            <div className="activity-icon">📝</div>
            <div className="activity-content">
              <div className="activity-title">New homework submission</div>
              <div className="activity-time">2 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">⭐</div>
            <div className="activity-content">
              <div className="activity-title">New 5-star review received</div>
              <div className="activity-time">5 hours ago</div>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-content">
              <div className="activity-title">3 new students enrolled</div>
              <div className="activity-time">1 day ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InstructorDashboard
