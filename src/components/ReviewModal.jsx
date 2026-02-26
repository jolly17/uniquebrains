import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ReviewModal.css';

export default function ReviewModal({ isOpen, onClose, resourceId, resourceName, onSubmitSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    reviewerName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('care_reviews')
        .insert({
          resource_id: resourceId,
          user_id: user?.id || null,
          reviewer_name: formData.reviewerName.trim(),
          rating: formData.rating,
          review_text: formData.reviewText.trim(),
          is_approved: false // Reviews need admin approval
        });

      if (submitError) throw submitError;

      // Show success and close
      alert('Thank you! Your review has been submitted and is pending approval.');
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      setFormData({ rating: 5, reviewText: '', reviewerName: '' });
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="review-modal-overlay" onClick={onClose}>
      <div className="review-modal" onClick={(e) => e.stopPropagation()}>
        <div className="review-modal-header">
          <h2>Write a Review</h2>
          <button 
            className="review-modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <div className="review-modal-body">
          <p className="review-resource-name">
            Reviewing: <strong>{resourceName}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="rating">
                Rating <span className="required">*</span>
              </label>
              <div className="star-rating">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star ${formData.rating >= star ? 'active' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    aria-label={`Rate ${star} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="reviewerName">
                Your Name <span className="required">*</span>
              </label>
              <input
                type="text"
                id="reviewerName"
                name="reviewerName"
                value={formData.reviewerName}
                onChange={handleChange}
                placeholder="Enter your name"
                required
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reviewText">
                Your Review <span className="required">*</span>
              </label>
              <textarea
                id="reviewText"
                name="reviewText"
                value={formData.reviewText}
                onChange={handleChange}
                placeholder="Share your experience with this resource..."
                required
                rows={6}
                maxLength={1000}
              />
              <p className="char-count">
                {formData.reviewText.length}/1000 characters
              </p>
            </div>

            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}

            <div className="review-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-submit"
                disabled={isSubmitting || !formData.reviewerName.trim() || !formData.reviewText.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
