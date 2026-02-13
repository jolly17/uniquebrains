import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api, handleApiCall } from '../services/api'
import NeurodiversityBadges from '../components/NeurodiversityBadges'
import PortalSwitcher from '../components/PortalSwitcher'
import StarRating from '../components/StarRating'
import './MyCourses.css'

function MyCourses() {
  const { user, profile, activeStudent, activePortal, availablePortals } = useAuth()
  const [enrolledCourses, setEnrolledCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [courseRatings, setCourseRatings] = useState({}) // Store student's ratings
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalInstructors: 0,
    sessionsCompleted: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [unenrollingCourseId, setUnenrollingCourseId] = useState(null)
  
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
        const enrollmentsData = await handleApiCall(api.enrollments.getStudent, studentId, isStudentProfile)
        setEnrollments(enrollmentsData)
        
        console.log('✅ Enrollments fetched:', enrollmentsData)
        
        // Fetch full course details for each enrollment
        const coursesPromises = enrollmentsData.map(enrollment => 
          handleApiCall(api.courses.getById, enrollment.course_id)
        )
        
        const courses = await Promise.all(coursesPromises)
        setEnrolledCourses(courses)
        
        // Fetch student's ratings for each course
        const ratingsPromises = courses.map(course =>
          handleApiCall(api.ratings.getStudent, course.id, studentId)
        )
        const ratingsData = await Promise.all(ratingsPromises)
        
        // Create ratings map
        const ratingsMap = {}
        courses.forEach((course, index) => {
          ratingsMap[course.id] = ratingsData[index]?.rating || 0
        })
        setCourseRatings(ratingsMap)
        
        // Calculate stats
        const uniqueInstructors = new Set(courses.map(c => c.instructor_id)).size
        const completedSessions = enrollmentsData.reduce((sum, e) => sum + (e.progress || 0), 0)
        
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

  const handleUnenroll = async (courseId, courseTitle) => {
    if (!window.confirm(`Are you sure you want to unenroll from "${courseTitle}"?`)) {
      return
    }

    try {
      setUnenrollingCourseId(courseId)
      
      // Find the enrollment for this course
      const enrollment = enrollments.find(e => e.course_id === courseId)
      if (!enrollment) {
        throw new Error('Enrollment not found')
      }
      
      // Determine the student ID (could be direct user or student profile)
      const studentId = activeStudent?.id || user.id
      
      // Withdraw from the course
      await handleApiCall(api.enrollments.withdraw, courseId, studentId)
      
      // Remove from local state
      setEnrolledCourses(enrolledCourses.filter(c => c.id !== courseId))
      setEnrollments(enrollments.filter(e => e.course_id !== courseId))
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalCourses: prev.totalCourses - 1
      }))
    } catch (error) {
      console.error('Error unenrolling:', error)
      alert('Failed to unenroll. Please try again.')
    } finally {
      setUnenrollingCourseId(null)
    }
  }

  const handleRatingChange = async (courseId, newRating) => {
    try {
      const studentId = activeStudent?.id || user.id
      await handleApiCall(api.ratings.submit, courseId, studentId, newRating)
      
      // Update local state
      setCourseRatings(prev => ({
        ...prev,
        [courseId]: newRating
      }))
      
      // Update course average rating
      const updatedCourses = await Promise.all(
        enrolledCourses.map(async (course) => {
          if (course.id === courseId) {
            const ratingData = await handleApiCall(api.ratings.getCourse, courseId)
            return {
              ...course,
              averageRating: ratingData.averageRating,
              totalRatings: ratingData.totalRatings
            }
          }
          return course
        })
      )
      setEnrolledCourses(updatedCourses)
    } catch (error) {
      console.error('Error submitting rating:', error)
      alert('Failed to submit rating. Please try again.')
    }
  }

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
          <Link to="/courses" className="btn-primary">
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
              return (
                <div key={course.id} className="student-course-card">
                  <div className="course-details">
                    <h3>
                      <a 
                        href={`/courses/${course.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={{ color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}
                      >
                        {course.title}
                      </a>
                    </h3>
                    <p className="course-description">{course.description}</p>
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
                    <div className="course-rating-section">
                      <div className="rating-display">
                        <StarRating rating={course.averageRating} />
                        <span className="rating-count">({course.totalRatings} ratings)</span>
                      </div>
                      <div className="your-rating">
                        <label>Your rating:</label>
                        <div className="rating-stars-interactive">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              type="button"
                              className={`star-button ${courseRatings[course.id] >= star ? 'filled' : ''}`}
                              onClick={() => handleRatingChange(course.id, star)}
                              aria-label={`Rate ${star} stars`}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="course-actions">
                    <Link to={`/learn/course/${course.id}/view`} className="btn-primary">
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
            <Link to="/courses" className="btn-primary">
              Browse Courses
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyCourses
