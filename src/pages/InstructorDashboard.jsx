import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import NeurodiversityBadges from '../components/NeurodiversityBadges'
import PortalSwitcher from '../components/PortalSwitcher'
import './InstructorDashboard.css'

function InstructorDashboard() {
  const { user, profile, activePortal, availablePortals } = useAuth()
  const [courses, setCourses] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingCourseId, setDeletingCourseId] = useState(null)

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
      
      // Fetch all sessions for instructor's courses and count completed ones
      let completedSessionsCount = 0
      const now = new Date()
      
      for (const course of (coursesData || [])) {
        try {
          const sessionsData = await handleApiCall(api.sessions.getCourse, course.id, user.id)
          // Count sessions that have passed (session_date < now)
          const completed = (sessionsData || []).filter(s => new Date(s.session_date) < now).length
          completedSessionsCount += completed
        } catch (err) {
          console.error(`Error fetching sessions for course ${course.id}:`, err)
        }
      }
      
      setStats({
        ...enrollmentStats,
        completedSessions: completedSessionsCount
      })
      
      console.log('Dashboard data loaded:', { courses: coursesData, stats: enrollmentStats, completedSessions: completedSessionsCount })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCourse = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${courseTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      setDeletingCourseId(courseId)
      await handleApiCall(api.courses.delete, courseId, user.id)
      
      // Remove from local state
      setCourses(courses.filter(c => c.id !== courseId))
      
      // Refresh stats
      const enrollmentStats = await handleApiCall(api.enrollments.getStats, user.id)
      setStats(enrollmentStats)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course. Please try again.')
    } finally {
      setDeletingCourseId(null)
    }
  }

  return (
    <div className="instructor-dashboard">
      {/* Portal Switcher */}
      {availablePortals && availablePortals.length > 1 && (
        <div className="dashboard-portal-switcher">
          <PortalSwitcher 
            currentPortal={activePortal} 
            availablePortals={availablePortals} 
            compact={false} 
          />
        </div>
      )}
      
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
        <Link to="/teach/create-course" className="btn-primary">
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
              <div className="stat-value">{stats?.completedSessions || 0}</div>
              <div className="stat-label">Sessions Completed</div>
            </div>
          </div>

          <div className="dashboard-section">
            <h2>My Courses</h2>
            {courses.length === 0 ? (
              <div className="empty-state">
                <p>You haven't created any courses yet.</p>
                <Link to="/teach/create-course" className="btn-primary">
                  Create Your First Course
                </Link>
              </div>
            ) : (
              <div className="instructor-courses-list">
                {courses.map(course => {
                  const enrollmentCount = stats?.enrollmentsByCourse[course.title]?.active || 0
                  
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
                        </div>
                        {truncatedDescription && (
                          <p className="course-description">{truncatedDescription}</p>
                        )}
                      </div>
                      <div className="course-actions">
                        <Link to={`/courses/${course.id}`} className="btn-secondary">
                          View
                        </Link>
                        <Link to={`/teach/course/${course.id}/manage`} className="btn-primary">
                          Manage Course
                        </Link>
                        <button 
                          onClick={() => handleDeleteCourse(course.id, course.title)}
                          className="btn-danger"
                          disabled={deletingCourseId === course.id}
                        >
                          {deletingCourseId === course.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default InstructorDashboard
