import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import CourseCard from '../components/CourseCard'
import CourseReviews from '../components/CourseReviews'
import PageErrorBoundary from '../components/PageErrorBoundary'
import ErrorState from '../components/ErrorState'
import { api, handleApiCall } from '../services/api'
import { mockReviews } from '../data/mockData'
import { convertToLocalTime, formatTimeWithTimezone, getUserTimezone, isSameTimezone } from '../utils/timezoneUtils'
import { getUserFriendlyMessage } from '../lib/errorHandler'
import { addBreadcrumb } from '../lib/sentry'
import { updateCourseMetaTags, resetMetaTags } from '../utils/metaTags'
import './CourseDetail.css'

function CourseDetailContent() {
  const { courseId } = useParams()
  const { user, profile, activeStudent } = useAuth()
  const navigate = useNavigate()
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEnrolled, setIsEnrolled] = useState(false)
  const [isInstructor, setIsInstructor] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [otherCourses, setOtherCourses] = useState([])
  const [isUnenrolling, setIsUnenrolling] = useState(false)
  const coursesCarouselRef = useRef(null)
  
  // Debug: Log activeStudent whenever it changes
  useEffect(() => {
    console.log('🎯 CourseDetail - activeStudent changed:', activeStudent)
    console.log('👤 CourseDetail - user:', user?.id)
  }, [activeStudent, user])
  
  const reviews = mockReviews.filter(r => r.courseId === courseId)

  const scrollCarousel = (direction) => {
    if (coursesCarouselRef.current) {
      const scrollAmount = 350
      coursesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Fetch course data and check enrollment status
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        setError('')
        
        addBreadcrumb({
          category: 'navigation',
          message: 'Course detail page loaded',
          level: 'info',
          data: { courseId, userId: user?.id },
        });
        
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
        
        // Update meta tags for social sharing
        updateCourseMetaTags(courseData)
        
        // Fetch other courses by the same instructor
        if (courseData.instructor_id) {
          try {
            const allCourses = await handleApiCall(api.courses.getAll)
            const instructorCourses = allCourses
              .filter(c => c.instructor_id === courseData.instructor_id && c.id !== courseId && c.is_published)
            setOtherCourses(instructorCourses)
          } catch (err) {
            console.log('Error fetching instructor courses:', err)
          }
        }
        
        // Check if user is the instructor
        if (user && courseData.instructor_id === user.id) {
          setIsInstructor(true)
        }
        
        // Check if user/student is already enrolled
        if (user) {
          try {
            const studentId = activeStudent ? activeStudent.id : user.id
            const isStudentProfile = activeStudent !== null
            const enrollmentData = await handleApiCall(api.enrollments.check, courseId, studentId)
            setIsEnrolled(!!enrollmentData)
          } catch (err) {
            console.log('Not enrolled or error checking enrollment:', err)
            setIsEnrolled(false)
          }
        }
      } catch (err) {
        console.error('Error fetching course:', err)
        const friendlyMessage = getUserFriendlyMessage(err)
        setError(friendlyMessage)
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
    
    // Cleanup: Reset meta tags when leaving the page
    return () => {
      resetMetaTags()
    }
  }, [courseId, user, activeStudent, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (loading) {
    return <div className="course-detail"><div className="loading-state">Loading course...</div></div>
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <ErrorState 
          message={error || 'Course not found'} 
          onRetry={handleRetry}
        />
      </div>
    )
  }

  const isFull = course.enrollmentLimit && course.currentEnrollment >= course.enrollmentLimit
  const spotsLeft = course.enrollmentLimit ? course.enrollmentLimit - course.currentEnrollment : null

  const handleEnroll = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/courses/${courseId}` } })
      return
    }
    if (isFull) {
      alert('Sorry, this class is full!')
      return
    }
    
    try {
      // Determine enrollment type:
      // - If activeStudent exists, enroll the student profile (parent-managed)
      // - Otherwise, enroll the user directly (student with own account)
      const enrollmentData = {
        courseId,
        studentId: activeStudent ? null : user.id,  // Direct student enrollment
        studentProfileId: activeStudent ? activeStudent.id : null  // Parent-managed enrollment
      }
      
      console.log('=== ENROLLMENT DEBUG ===')
      console.log('User ID:', user.id)
      console.log('Active Student:', activeStudent)
      console.log('Enrollment Data:', enrollmentData)
      console.log('========================')
      
      // Create enrollment record in database
      await handleApiCall(api.enrollments.enroll, enrollmentData.courseId, enrollmentData.studentId, enrollmentData.studentProfileId)
      
      // Show success popup with student info
      setShowEnrollmentSuccess(true)
    } catch (err) {
      console.error('Enrollment error:', err)
      alert(err.message || 'Failed to enroll in course. Please try again.')
    }
  }

  const handleUnenroll = async () => {
    if (!window.confirm(`Are you sure you want to unenroll from "${course.title}"?`)) {
      return
    }

    try {
      setIsUnenrolling(true)
      const studentId = activeStudent ? activeStudent.id : user.id
      await handleApiCall(api.enrollments.withdraw, courseId, studentId)
      setIsEnrolled(false)
      alert('Successfully unenrolled from the course')
    } catch (error) {
      console.error('Error unenrolling:', error)
      alert('Failed to unenroll. Please try again.')
    } finally {
      setIsUnenrolling(false)
    }
  }

  const handleDeleteCourse = async () => {
    if (!window.confirm(`Are you sure you want to delete "${course.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await handleApiCall(api.courses.delete, courseId, user.id)
      alert('Course deleted successfully')
      navigate('/teach/dashboard')
    } catch (error) {
      console.error('Error deleting course:', error)
      alert(error.message || 'Failed to delete course. Please try again.')
    }
  }

  return (
    <div className="course-detail">
      <div className="course-hero">
        <div className="course-hero-content">
          <div className="course-category-badge">{course.category}</div>
          <h1>{course.title}</h1>
          <p className="course-lead">{course.description}</p>
          
          <div className="course-meta">
            <div className="meta-item">
              <span>👨‍🏫 Instructor: <Link to={`/instructor/${course.instructor_id}`} className="instructor-link">{course.instructorName}</Link></span>
            </div>
            {course.instructorExpertise && course.instructorExpertise.length > 0 && (
              <div className="meta-item">
                <span>🎯 Specializes in: {course.instructorExpertise.join(', ')}</span>
              </div>
            )}
            {!course.isSelfPaced && (
              <>
                <div className="meta-item">
                  <span>📅 {course.sessionDuration} min sessions</span>
                </div>
                <div className="meta-item">
                  <span>🔄 {course.sessionFrequency.charAt(0).toUpperCase() + course.sessionFrequency.slice(1)}</span>
                </div>
              </>
            )}
            {course.isSelfPaced && (
              <div className="meta-item">
                <span>⏰ Self-paced (learn at your own speed)</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="course-enroll-card">
          <div className="enroll-price">
            {course.price === 0 ? 'Free' : `$${course.price}`}
          </div>
          
          {course.enrollmentLimit && (
            <div className="enrollment-status">
              <div className="enrollment-bar">
                <div 
                  className="enrollment-fill" 
                  style={{ width: `${(course.currentEnrollment / course.enrollmentLimit) * 100}%` }}
                ></div>
              </div>
              <div className="enrollment-text">
                {course.currentEnrollment} / {course.enrollmentLimit} students enrolled
                {!isFull && spotsLeft <= 5 && (
                  <span className="spots-warning"> • Only {spotsLeft} spots left!</span>
                )}
              </div>
            </div>
          )}
          
          {isInstructor ? (
            <>
              <button 
                onClick={() => navigate(`/teach/course/${courseId}/manage`)} 
                className="btn-primary btn-full"
              >
                Manage Course
              </button>
              <button 
                onClick={handleDeleteCourse} 
                className="btn-danger btn-full"
                style={{ marginTop: '0.5rem' }}
              >
                Delete Course
              </button>
            </>
          ) : isEnrolled ? (
            <button 
              onClick={handleUnenroll} 
              className="btn-enrolled btn-full"
              disabled={isUnenrolling}
            >
              <span className="enrolled-text">✓ Enrolled</span>
              <span className="unenroll-text">{isUnenrolling ? 'Unenrolling...' : 'Unenroll'}</span>
            </button>
          ) : isFull ? (
            <button className="btn-secondary btn-full" disabled>
              Class Full
            </button>
          ) : (
            <button onClick={handleEnroll} className="btn-primary btn-full">
              Enroll Now
            </button>
          )}
          
          <div className="enroll-features">
            <div className="feature">✓ Live classes</div>
            <div className="feature">✓ Online feedback</div>
            <div className="feature">✓ Instructor support</div>
          </div>
        </div>
      </div>

      {/* Schedule Section - Full Width Below Hero */}
      {!course.isSelfPaced && course.course_type === 'group' && (
        <div className="course-schedule-table-full">
          <h3>📅 Course Schedule</h3>
          <div className="schedule-info-row">
            <div className="schedule-info-item">
              <span className="info-label">Days:</span>
              <span className="info-value">{course.selected_days?.join(', ') || 'Not set'}</span>
            </div>
            <div className="schedule-info-item">
              <span className="info-label">Time:</span>
              <span className="info-value">
                {course.session_time ? (
                  <>
                    {formatTimeWithTimezone(
                      course.timezone && !isSameTimezone(course.timezone, getUserTimezone())
                        ? convertToLocalTime(course.session_time, course.timezone)
                        : course.session_time
                    )}
                    {course.timezone && !isSameTimezone(course.timezone, getUserTimezone()) && (
                      <span style={{ fontSize: '0.85em', color: '#666', marginLeft: '0.5rem' }}>
                        (converted to your timezone)
                      </span>
                    )}
                  </>
                ) : 'Not set'}
              </span>
            </div>
            <div className="schedule-info-item">
              <span className="info-label">Duration:</span>
              <span className="info-value">{course.session_duration} minutes</span>
            </div>
            <div className="schedule-info-item">
              <span className="info-label">Frequency:</span>
              <span className="info-value">{course.frequency || 'weekly'}</span>
            </div>
          </div>
          {course.start_date && (
            <div className="schedule-dates-row">
              <span className="info-label">Start Date:</span>
              <span className="info-value">{new Date(course.start_date).toLocaleDateString('en-US')}</span>
              {course.has_end_date && course.end_date && (
                <>
                  <span className="info-label">End Date:</span>
                  <span className="info-value">{new Date(course.end_date).toLocaleDateString('en-US')}</span>
                </>
              )}
            </div>
          )}
        </div>
      )}
      
      {!course.isSelfPaced && course.course_type === 'one-on-one' && (
        <div className="course-schedule-table-full">
          <h3>📅 Course Schedule</h3>
          <div className="schedule-note">
            <p>📝 Schedule to be discussed between instructor and student after enrollment</p>
          </div>
        </div>
      )}

      {/* Enrollment Success Popup */}
      {showEnrollmentSuccess && (
        <div className="enrollment-success-overlay">
          <div className="enrollment-success-popup">
            <div className="success-icon">🎉</div>
            <h2>Enrollment Successful!</h2>
            <p>
              <strong>
                {activeStudent 
                  ? `${activeStudent.first_name} has been enrolled` 
                  : `You have been enrolled`
                }
              </strong> in <strong>{course.title}</strong>
            </p>
            <p className="success-subtitle">
              {activeStudent 
                ? `${activeStudent.first_name} can now access the course materials and join sessions.`
                : 'You can now access the course materials and join sessions.'
              }
            </p>
            <div className="success-actions">
              <button 
                onClick={() => {
                  setShowEnrollmentSuccess(false)
                  navigate('/learn/my-courses')
                }}
                className="btn-primary"
              >
                View My Courses
              </button>
              <button 
                onClick={() => {
                  setShowEnrollmentSuccess(false)
                  navigate('/courses')
                }}
                className="btn-secondary"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Reviews Section */}
      <CourseReviews 
        courseId={courseId} 
        isEnrolled={isEnrolled}
        onReviewSubmitted={() => {
          // Optionally refresh course data to update average rating
          setRetryCount(prev => prev + 1)
        }}
      />

      {/* Other Courses by This Instructor */}
      {otherCourses.length > 0 && (
        <div className="other-courses-section">
          <h2>More Courses by {course.instructorName}</h2>
          <div className="carousel-container">
            {otherCourses.length > 3 && (
              <button 
                className="carousel-btn carousel-btn-left" 
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
              >
                ‹
              </button>
            )}
            <div className="courses-carousel" ref={coursesCarouselRef}>
              {otherCourses.map((otherCourse) => (
                <div key={otherCourse.id} className="carousel-item">
                  <CourseCard course={otherCourse} />
                </div>
              ))}
            </div>
            {otherCourses.length > 3 && (
              <button 
                className="carousel-btn carousel-btn-right" 
                onClick={() => scrollCarousel('right')}
                aria-label="Scroll right"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CourseDetail() {
  return (
    <PageErrorBoundary pageName="Course Detail">
      <CourseDetailContent />
    </PageErrorBoundary>
  );
}
