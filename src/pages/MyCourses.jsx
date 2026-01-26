import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import NeurodiversityBadges from '../components/NeurodiversityBadges'
import PortalSwitcher from '../components/PortalSwitcher'
import './MyCourses.css'

function MyCourses() {
  const { user, profile, activeStudent, activePortal, availablePortals } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalInstructors: 0,
    sessionsCompleted: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Helper function to capitalize first letter
  const capitalizeFirstLetter = (str) => {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
  }
  
  // Load courses based on selected student/parent
  useEffect(() => {
    const fetchEnrolledCourses = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        setError('')
        
        // Determine if we're fetching for a student profile or direct user
        const isStudentProfile = activeStudent !== null
        const studentId = activeStudent?.id || user.id
        
        console.log('📚 Fetching enrollments for:', { studentId, isStudentProfile, activeStudent })
        
        // Fetch enrollments for this student
        const enrollments = await handleApiCall(api.enrollments.getStudent, studentId, isStudentProfile)
        
        console.log('✅ Enrollments fetched:', enrollments)
        
        // Fetch full course details for each enrollment
        const coursesPromises = enrollments.map(enrollment => 
          handleApiCall(api.courses.getById, enrollment.course_id)
        )
        
        const courses = await Promise.all(coursesPromises)
        setEnrolledCourses(courses)
        
        // Calculate stats
        const uniqueInstructors = new Set(courses.map(c => c.instructor_id)).size
        const completedSessions = enrollments.reduce((sum, e) => sum + (e.progress || 0), 0)
        
        setStats({
          totalCourses: courses.length,
          totalInstructors: uniqueInstructors,
          sessionsCompleted: Math.floor(completedSessions / 10) // Rough estimate
        })
      } catch (err) {
        console.error('Error fetching enrolled courses:', err)
        setError('Failed to load your courses')
      } finally {
        setLoading(false)
      }
    }

    fetchEnrolledCourses()
  }, [user, activeStudent])

  if (loading) {
    return (
      <div className="my-courses">
        <div className="loading-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Loading your courses...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="my-courses">
        <div className="error-state" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="my-courses">
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
          <h1>
            {activeStudent 
              ? `${capitalizeFirstLetter(activeStudent.first_name)}'s Dashboard` 
              : 'My Learning Dashboard'
            }
          </h1>
          <div className="student-profile-summary">
            <p>
              {activeStudent 
                ? `Learning progress for ${capitalizeFirstLetter(activeStudent.first_name)}` 
                : `Welcome back, ${profile?.first_name || 'Student'}!`
              }
            </p>
            {activeStudent?.neurodiversity_profile && activeStudent.neurodiversity_profile.length > 0 && (
              <NeurodiversityBadges 
                profile={activeStudent.neurodiversity_profile} 
                size="small" 
                showLabel={false}
              />
            )}
            {!activeStudent && profile?.neurodiversity_profile && profile.neurodiversity_profile.length > 0 && (
              <NeurodiversityBadges 
                profile={profile.neurodiversity_profile} 
                size="small" 
                showLabel={false}
              />
            )}
          </div>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/learn/marketplace" className="btn-primary">
            Browse More Courses
          </Link>
          {availablePortals && availablePortals.includes('teach') && (
            <Link to="/teach/create-course" className="btn-secondary">
              Create Course
            </Link>
          )}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.totalCourses}</div>
          <div className="stat-label">Enrolled Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.totalInstructors}</div>
          <div className="stat-label">Instructors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.sessionsCompleted}</div>
          <div className="stat-label">Sessions Completed</div>
        </div>
      </div>

      <div className="dashboard-section">
        <h2>My Courses</h2>
        {enrolledCourses.length > 0 ? (
          <div className="student-courses-list">
            {enrolledCourses.map(course => {
              // Mock progress - in real app this would come from user's progress data
              const progress = 35 // Mock 35% completion

              return (
                <div key={course.id} className="student-course-card">
                  <div className="course-details">
                    <h3>{course.title}</h3>
                    <div className="course-meta">
                      <span className="instructor-name">👨‍🏫 {course.instructorName}</span>
                      {!course.is_self_paced && course.session_duration && (
                        <span className="session-info">
                          📅 {course.session_duration} min sessions
                        </span>
                      )}
                      {course.is_self_paced && (
                        <span className="session-info">⏰ Self-paced</span>
                      )}
                    </div>
                    
                    <div className="progress-section">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="progress-text">{Math.round(progress)}% Complete</span>
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <Link to={`/courses/${course.id}`} className="btn-secondary">
                      View Details
                    </Link>
                    <Link to={`/learn/${course.id}`} className="btn-primary">
                      Continue Learning
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>You haven't enrolled in any courses yet.</p>
            <Link to="/learn/marketplace" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCourses
