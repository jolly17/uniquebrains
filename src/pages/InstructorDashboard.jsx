import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import NeurodiversityBadges from '../components/NeurodiversityBadges'
import './InstructorDashboard.css'

function InstructorDashboard() {
  const { user, profile } = useAuth()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch instructor courses
      const coursesData = await handleApiCall(api.courses.getInstructorCourses, user.id)
      setCourses(coursesData || [])
      
      // Fetch enrollment statistics
      const enrollmentStats = await handleApiCall(api.enrollments.getStats, user.id)
      setStats(enrollmentStats)
      
      console.log('Dashboard data loaded:', { courses: coursesData, stats: enrollmentStats })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="instructor-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Instructor Dashboard</h1>
          <div className="instructor-profile-summary">
            <p>Welcome back, {profile?.first_name || 'Instructor'}!</p>
            {profile?.neurodiversity_profile && profile.neurodiversity_profile.length > 0 && (
              <NeurodiversityBadges 
                profile={profile.neurodiversity_profile} 
                size="small" 
                showLabel={false}
              />
            )}
            {(!profile?.bio || !profile?.neurodiversity_profile || profile.neurodiversity_profile.length === 0) && (
              <div className="profile-incomplete-notice">
                <span>📝 Complete your instructor profile to help parents find you</span>
                <Link to="/onboarding" className="btn-link">Complete Profile</Link>
              </div>
            )}
          </div>
        </div>
        <Link to="/instructor/create-course" className="btn-primary">
          Create New Course
        </Link>
      </div>

      {loading ? (
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading dashboard...</p>
        </div>
      ) : error ? (
        <div className="error-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{error}</p>
          <button onClick={fetchDashboardData} className="btn-primary" style={{ marginTop: '1rem' }}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{courses.length}</div>
              <div className="stat-label">Total Courses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.activeEnrollments || 0}</div>
              <div className="stat-label">Active Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.completedEnrollments || 0}</div>
              <div className="stat-label">Completed Enrollments</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats?.enrollmentsThisMonth || 0}</div>
              <div className="stat-label">New This Month</div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>My Courses</h2>
            {courses.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any courses yet.</p>
                <Link to="/instructor/create-course" className="btn-primary">
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="instructor-courses-list">
                {courses.map(course => {
                  const enrollmentCount = stats?.enrollmentsByCourse[course.title]?.active || 0
                  const totalEnrollments = stats?.enrollmentsByCourse[course.title]?.total || 0
                  
                  // Truncate description to 150 characters
                  const truncatedDescription = course.description && course.description.length > 150
                    ? course.description.substring(0, 150) + '...'
                    : course.description
                  
                  return (
                    <div key={course.id} className="instructor-course-card">
                      <div className="course-details">
                        <h3>{course.title}</h3>
                        <div className="course-stats">
                          <span>
                            {enrollmentCount} active
                            {course.enrollment_limit ? ` / ${course.enrollment_limit}` : ''} students
                            {course.enrollment_limit && enrollmentCount >= course.enrollment_limit && (
                              <span className="full-indicator"> (FULL)</span>
                            )}
                          </span>
                          <span>Total enrollments: {totalEnrollments}</span>
                        </div>
                        {truncatedDescription && (
                          <p className="course-description">{truncatedDescription}</p>
                        )}
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
                  )
                })}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <h2>Enrollment Overview</h2>
            {stats && Object.keys(stats.enrollmentsByCourse).length > 0 ? (
              <div className="enrollment-overview">
                {Object.entries(stats.enrollmentsByCourse).map(([courseTitle, courseStats]) => (
                  <div key={courseTitle} className="enrollment-course-card">
                    <h4>{courseTitle}</h4>
                    <div className="enrollment-stats-grid">
                      <div className="enrollment-stat">
                        <span className="stat-value">{courseStats.active}</span>
                        <span className="stat-label">Active</span>
                      </div>
                      <div className="enrollment-stat">
                        <span className="stat-value">{courseStats.completed}</span>
                        <span className="stat-label">Completed</span>
                      </div>
                      <div className="enrollment-stat">
                        <span className="stat-value">{courseStats.withdrawn}</span>
                        <span className="stat-label">Withdrawn</span>
                      </div>
                      <div className="enrollment-stat">
                        <span className="stat-value">{courseStats.total}</span>
                        <span className="stat-label">Total</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No enrollment data available yet.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default InstructorDashboard
