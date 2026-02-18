import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import StarRating from './StarRating'
import './CourseReviews.css'

function CourseReviews({ courseId, isEnrolled, onReviewSubmitted }) {
  const { user, profile } = useAuth()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [formData, setFormData] = useState({
    rating: 5,
    comment: ''
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchReviews()
  }, [courseId])

  const fetchReviews = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:student_id (
            id,
            first_name,
            last_name,
            avatar_url
          )
        `)
        .eq('course_id', courseId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error

      setReviews(data || [])

      // Check if current user has already reviewed
      if (user) {
        const existingReview = data?.find(r => r.student_id === user.id)
        setUserReview(existingReview)
        if (existingReview) {
          setFormData({
            rating: existingReview.rating,
            comment: existingReview.comment
          })
        }
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReview = async (e) => {
    e.preventDefault()
    
    if (!user) {
      alert('Please log in to submit a review')
      return
    }

    if (!isEnrolled) {
      alert('You must be enrolled in this course to leave a review')
      return
    }

    try {
      setSubmitting(true)

      if (userReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: formData.rating,
            comment: formData.comment,
            updated_at: new Date().toISOString()
          })
          .eq('id', userReview.id)

        if (error) throw error
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert([{
            course_id: courseId,
            student_id: user.id,
            rating: formData.rating,
            comment: formData.comment,
            is_published: true
          }])

        if (error) throw error
      }

      alert(userReview ? 'Review updated successfully!' : 'Review submitted successfully!')
      setShowReviewForm(false)
      fetchReviews()
      if (onReviewSubmitted) onReviewSubmitted()
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="course-reviews-section">
      <div className="reviews-header">
        <div className="reviews-summary">
          <h2>Student Reviews</h2>
          {reviews.length > 0 && (
            <div className="rating-summary">
              <div className="average-rating">
                <span className="rating-number">{averageRating}</span>
                <StarRating rating={parseFloat(averageRating)} size="medium" />
              </div>
              <span className="review-count">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
            </div>
          )}
        </div>

        {isEnrolled && user && (
          <button 
            onClick={() => setShowReviewForm(!showReviewForm)}
            className="btn-write-review"
          >
            {userReview ? '✏️ Edit Your Review' : '✍️ Write a Review'}
          </button>
        )}
      </div>

      {showReviewForm && (
        <div className="review-form-container">
          <form onSubmit={handleSubmitReview} className="review-form">
            <h3>{userReview ? 'Edit Your Review' : 'Share Your Experience'}</h3>
            
            <div className="form-group">
              <label>Rating *</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData({ ...formData, rating: star })}
                  >
                    ⭐
                  </button>
                ))}
                <span className="rating-text">{formData.rating} out of 5</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review *</label>
              <textarea
                id="comment"
                value={formData.comment}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                required
                rows="4"
                placeholder="Share your thoughts about this course..."
                className="review-textarea"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                onClick={() => setShowReviewForm(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Submitting...' : (userReview ? 'Update Review' : 'Submit Review')}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="reviews-loading">Loading reviews...</div>
      ) : reviews.length === 0 ? (
        <div className="no-reviews">
          <p>No reviews yet. Be the first to share your experience!</p>
        </div>
      ) : (
        <div className="reviews-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <div className="reviewer-info">
                  {review.profiles?.avatar_url ? (
                    <img 
                      src={review.profiles.avatar_url} 
                      alt={`${review.profiles.first_name} ${review.profiles.last_name}`}
                      className="reviewer-avatar"
                    />
                  ) : (
                    <div className="reviewer-avatar-placeholder">
                      {review.profiles?.first_name?.[0]}{review.profiles?.last_name?.[0]}
                    </div>
                  )}
                  <div className="reviewer-details">
                    <h4 className="reviewer-name">
                      {review.profiles?.first_name} {review.profiles?.last_name}
                    </h4>
                    <div className="review-meta">
                      <StarRating rating={review.rating} size="small" />
                      <span className="review-date">
                        {new Date(review.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <p className="review-comment">{review.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default CourseReviews
