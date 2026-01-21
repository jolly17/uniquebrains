import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StarRating from '../components/StarRating'
import { api, handleApiCall } from '../services/api'
import { mockReviews } from '../data/mockData'
import './CourseDetail.css'

function CourseDetail() {
  const { courseId } = useParams()
  const { user, profile, activeStudent } = useAuth()
  const navigate = useNavigate()
  const [showEnrollmentSuccess, setShowEnrollmentSuccess] = useState(false)
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  const reviews = mockReviews.filter(r => r.courseId === courseId)

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true)
        const courseData = await handleApiCall(api.courses.getById, courseId)
        setCourse(courseData)
      } catch (err) {
        console.error('Error fetching course:', err)
        setError('Failed to load course')
      } finally {
        setLoading(false)
      }
    }

    if (courseId) {
      fetchCourse()
    }
  }, [courseId])

  if (loading) {
    return <div className="course-detail"><div className="loading-state">Loading course...</div></div>
  }

  if (error || !course) {
    return (
      <div className="course-detail">
        <div className="error-state">
          <p>{error || 'Course not found'}</p>
          <button onClick={() => navigate('/marketplace')} className="btn-primary">
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  const isFull = course.enrollmentLimit && course.currentEnrollment >= course.enrollmentLimit
  const spotsLeft = course.enrollmentLimit ? course.enrollmentLimit - course.currentEnrollment : null

  const handleEnroll = () => {
    if (!user) {
      navigate('/login')
      return
    }
    if (isFull) {
      alert('Sorry, this class is full!')
      return
    }
    
    // Show success popup with student info
    setShowEnrollmentSuccess(true)
    
    // TODO: Add actual enrollment logic here
    // - Create enrollment record in database
    // - Link to activeStudent or parent profile
    
    // Auto-close popup after 3 seconds
    setTimeout(() => {
      setShowEnrollmentSuccess(false)
      navigate('/my-courses')
    }, 3000)
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
              <StarRating rating={course.averageRating} />
              <span>{course.averageRating} ({course.totalRatings} ratings)</span>
            </div>
            <div className="meta-item">
              <span>Instructor: {course.instructorName}</span>
            </div>
            {!course.isSelfPaced && (
              <>
                <div className="meta-item">
                  <span>📅 {course.sessionDuration} min sessions</span>
                </div>
                <div className="meta-item">
                  <span>🔄 {course.sessionFrequency.charAt(0).toUpperCase() + course.sessionFrequency.slice(1)}</span>
                </div>
                {course.selectedDays.length > 0 && course.dayTimes && (
                  <div className="meta-item schedule-details">
                    <span>🕐 Schedule:</span>
                    <div className="schedule-list">
                      {course.selectedDays.map(day => (
                        <span key={day} className="schedule-day">
                          {day} at {course.dayTimes[day] || 'TBD'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
          
          {isFull ? (
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

      <div className="course-sections">
        {/* Only show "What You'll Learn" section if description exists */}
        <section className="course-section">
          <h2>About This Course</h2>
          <p className="course-description-full">{course.description}</p>
          {course.instructorBio && (
            <div className="instructor-bio">
              <h3>About the Instructor</h3>
              <p>{course.instructorBio}</p>
            </div>
          )}
        </section>

        <section className="course-section">
          <h2>Student Reviews</h2>
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <div>
                      <div className="review-author">{review.studentName}</div>
                      <div className="review-date">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                    <StarRating rating={review.rating} size="small" />
                  </div>
                  <p className="review-text">{review.reviewText}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review this course!</p>
          )}
        </section>
      </div>

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
                  navigate('/my-courses')
                }}
                className="btn-primary"
              >
                View My Courses
              </button>
              <button 
                onClick={() => setShowEnrollmentSuccess(false)}
                className="btn-secondary"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CourseDetail
