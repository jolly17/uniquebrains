import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CourseCard from '../components/CourseCard'
import StarRating from '../components/StarRating'
import PageErrorBoundary from '../components/PageErrorBoundary'
import ErrorState from '../components/ErrorState'
import { api, handleApiCall } from '../services/api'
import { getUserFriendlyMessage } from '../lib/errorHandler'
import './InstructorProfile.css'

function InstructorProfileContent() {
  const { instructorId } = useParams()
  const [instructor, setInstructor] = useState(null)
  const [courses, setCourses] = useState([])
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const coursesCarouselRef = useRef(null)

  useEffect(() => {
    const fetchInstructorData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch instructor profile
        const instructorData = await handleApiCall(api.profiles.getById, instructorId)
        
        if (instructorData.role !== 'instructor') {
          throw new Error('This profile is not an instructor')
        }
        
        setInstructor(instructorData)

        // Fetch all courses by this instructor
        const allCourses = await handleApiCall(api.courses.getAll)
        const instructorCourses = allCourses.filter(
          c => c.instructor_id === instructorId && c.is_published
        )
        setCourses(instructorCourses)

        // Fetch all reviews for instructor's courses and aggregate ratings
        const allReviews = []
        const courseIds = instructorCourses.map(c => c.id)
        
        if (courseIds.length > 0) {
          try {
            const { data: reviewsData, error: reviewsError } = await supabase
              .from('reviews')
              .select(`
                *,
                profiles:student_id (
                  id,
                  first_name,
                  last_name,
                  avatar_url
                ),
                courses:course_id (
                  id,
                  title
                )
              `)
              .in('course_id', courseIds)
              .eq('is_published', true)
              .order('created_at', { ascending: false })

            if (reviewsError) throw reviewsError

            // Map reviews with course names
            const mappedReviews = reviewsData.map(r => ({
              ...r,
              courseName: r.courses?.title || 'Unknown Course'
            }))
            
            allReviews.push(...mappedReviews)
          } catch (err) {
            console.log('Error fetching reviews:', err)
          }
        }
        
        setReviews(allReviews)

      } catch (err) {
        console.error('Error fetching instructor data:', err)
        const friendlyMessage = getUserFriendlyMessage(err)
        setError(friendlyMessage)
      } finally {
        setLoading(false)
      }
    }

    if (instructorId) {
      fetchInstructorData()
    }
  }, [instructorId, retryCount])

  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  const scrollCarousel = (direction) => {
    if (coursesCarouselRef.current) {
      const scrollAmount = 350
      coursesCarouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // Calculate cumulative rating
  const cumulativeRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  if (loading) {
    return <div className="instructor-profile"><div className="loading-state">Loading instructor profile...</div></div>
  }

  if (error || !instructor) {
    return (
      <div className="instructor-profile">
        <ErrorState 
          message={error || 'Instructor not found'} 
          onRetry={handleRetry}
        />
      </div>
    )
  }

  return (
    <div className="instructor-profile">
      {/* Instructor Hero Section */}
      <div className="instructor-hero">
        <div className="instructor-hero-content">
          <div className="instructor-avatar-large">
            {instructor.avatar_url ? (
              <img src={instructor.avatar_url} alt={`${instructor.first_name} ${instructor.last_name}`} />
            ) : (
              <div className="avatar-placeholder">
                {instructor.first_name[0]}{instructor.last_name[0]}
              </div>
            )}
          </div>
          <div className="instructor-info">
            <h1>{instructor.first_name} {instructor.last_name}</h1>
            <div className="instructor-meta">
              <span className="meta-badge">👨‍🏫 Instructor</span>
              {instructor.expertise && instructor.expertise.length > 0 && (
                <span className="meta-item">🎯 {instructor.expertise.join(', ')}</span>
              )}
            </div>
            <div className="instructor-stats">
              <div className="stat-item">
                <span className="stat-value">{courses.length}</span>
                <span className="stat-label">Courses</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{reviews.length}</span>
                <span className="stat-label">Reviews</span>
              </div>
              <div className="stat-item">
                <StarRating rating={cumulativeRating} />
                <span className="stat-label">{cumulativeRating.toFixed(1)} Rating</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="instructor-bio-section">
        <h2>About {instructor.first_name}</h2>
        <p className="instructor-bio">
          {instructor.bio || 'This instructor hasn\'t added a bio yet.'}
        </p>
      </div>

      {/* Courses Carousel */}
      {courses.length > 0 && (
        <div className="instructor-courses-section">
          <h2>Courses by {instructor.first_name}</h2>
          <div className="carousel-container">
            {courses.length > 3 && (
              <button 
                className="carousel-btn carousel-btn-left" 
                onClick={() => scrollCarousel('left')}
                aria-label="Scroll left"
              >
                ‹
              </button>
            )}
            <div className="courses-carousel" ref={coursesCarouselRef}>
              {courses.map((course) => (
                <div key={course.id} className="carousel-item">
                  <CourseCard course={course} />
                </div>
              ))}
            </div>
            {courses.length > 3 && (
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

      {/* Reviews Section */}
      <div className="instructor-reviews-section">
        <div className="reviews-header">
          <h2>Student Reviews</h2>
          {reviews.length > 0 && (
            <div className="reviews-summary">
              <StarRating rating={cumulativeRating} size="large" />
              <span className="reviews-count">
                {cumulativeRating.toFixed(1)} out of 5 ({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})
              </span>
            </div>
          )}
        </div>

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review a course by this instructor!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div>
                    <div className="review-author">
                      {review.profiles?.first_name} {review.profiles?.last_name}
                    </div>
                    <div className="review-course">
                      Course: <Link to={`/courses/${review.course_id}`}>{review.courseName}</Link>
                    </div>
                    <div className="review-date">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                  <StarRating rating={review.rating} />
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function InstructorProfile() {
  return (
    <PageErrorBoundary pageName="Instructor Profile">
      <InstructorProfileContent />
    </PageErrorBoundary>
  )
}
