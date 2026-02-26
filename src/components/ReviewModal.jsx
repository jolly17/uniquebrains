import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import './ReviewModal.css';

export default function ReviewModal({ isOpen, onClose, resourceId, resourceName, onSubmitSuccess }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    rating: 5,
    reviewText: '',
    reviewerName: '',
    isAnonymous: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile and pre-fill name when modal opens
  useEffect(() => {
    async function fetchUserProfile() {
      if (user && isOpen) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name')
            .eq('id', user.id)
            .single();
          
          if (!error && data?.full_name) {
            setFormData(prev => ({
              ...prev,
              reviewerName: data.full_name
            }));
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
        }
      }
    }
    
    fetchUserProfile();
  }, [user, isOpen]);

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

    // Check if user is authenticated
    if (!user) {
      setError('You must be signed in to write a review. Please sign in and try again.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error: submitError } = await supabase
        .from('care_reviews')
        .insert({
          resource_id: resourceId,
          user_id: user.id, // Always store user ID for accountability
          reviewer_name: formData.isAnonymous ? 'Anonymous' : formData.reviewerName.trim(),
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
      
      setFormData({ rating: 5, reviewText: '', reviewerName: '', isAnonymous: false });
      onClose();
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  // Require authentication
  if (!user) {
    return (
      <div className="review-modal-overlay" onClick={onClose}>
        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
          <div className="review-modal-header">
            <h2>Sign In Required</h2>
            <button className="review-modal-close" onClick={onClose} aria-label="Close modal"></button>
          </div>
          <div className="review-modal-body">
            <p>You must be signed in to write a review.</p>
            <div className="review-modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Require authentication
  if (!user) {
    return (
      <div className="review-modal-overlay" onClick={onClose}>
        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
          <div className="review-modal-header">
            <h2>Sign In Required</h2>
            <button className="review-modal-close" onClick={onClose} aria-label="Close modal"></button>
          </div>
          <div className="review-modal-body">
            <p>You must be signed in to write a review.</p>
            <div className="review-modal-actions">
              <button type="button" className="btn-cancel" onClick={onClose}>Close</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show login prompt if user is not authenticated
  if (!user) {
    return (
      <div className="review-modal-overlay" onClick={onClose}>
        <div className="review-modal" onClick={(e) => e.stopPropagation()}>
          <div className="review-modal-header">
            <h2>Sign In Required</h2>
            <button 
              className="review-modal-close" 
              onClick={onClose}
              aria-label="Close modal"
            >
              
            </button>
          </div>
          <div className="review-modal-body">
            <p>You must be signed in to write a review.</p>
            <div className="review-modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={onClose}
              >
                Close
              </button>
              <button
                type="button"
                className="btn-submit"
                onClick={() => window.location.href = '/login'}
              >
                Sign In
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            
          </button>
        </div>

        <div className="review-modal-body">
          <p className="review-resource-name">
            Reviewing: <strong>{resourceName}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isAnonymous"
                  checked={formData.isAnonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                />
                <span>Post anonymously (your name will not be shown publicly)</span>
              </label>
            </div>

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
                    
                  </button>
                ))}
              </div>
              <p className="rating-text">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </p>
            </div>

            {!formData.isAnonymous && (
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
            )}

            {formData.isAnonymous && (
              <div className="form-group">
                <p className="anonymous-notice">
                  Your review will be posted as "Anonymous". Your identity is stored securely for accountability but will not be shown publicly.
                </p>
              </div>
            )}

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
                disabled={isSubmitting || (!formData.isAnonymous && !formData.reviewerName.trim()) || !formData.reviewText.trim()}
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
