import { useState, useEffect } from 'react';
import ReviewModal from '../components/ReviewModal';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './ResourceDetailPage.css';

function ResourceDetailPage() {
  const { milestone, resourceId } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchResource() {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('care_resources')
          .select('*')
          .eq('id', resourceId)
          .single();

        if (error) throw error;

        // Transform to include coordinates object
        const transformedResource = {
          ...data,
          coordinates: data.lat && data.lng 
            ? { lat: data.lat, lng: data.lng }
            : null
        };

        setResource(transformedResource);
      } catch (err) {
        console.error('Error fetching resource:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (resourceId) {
      fetchResource();
    fetchReviews();
    }
  }, [resourceId]);

  if (loading) {
    return (
      <div className="resource-detail-page">
        <div className="resource-loading">
          <p>Loading resource...</p>
        </div>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="resource-detail-page">
        <div className="resource-not-found">
          <h2>Resource not found</h2>
          <button onClick={() => navigate(`/care/${milestone}`)} className="back-btn">
            ← Back to {milestone}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-detail-page">
      <div className="resource-detail-container">
        <button onClick={() => navigate(`/care/${milestone}`)} className="back-btn">
          ← Back to {milestone}
        </button>

        <div className="resource-detail-header">
          <h1>{resource.name}</h1>
          {resource.verified && <span className="verified-badge">✓ Verified</span>}
        </div>

        <div className="resource-detail-rating">
          <span className="rating-stars">⭐ {resource.rating}</span>
          <span className="review-count">({resource.review_count} reviews)</span>
        </div>

        {resource.experience_years && (
          <div className="resource-detail-experience">
            📅 {resource.experience_years} years of experience
          </div>
        )}

                        <div className="resource-detail-section">
          <h2>Reviews ({reviews.length})</h2>
          {reviews.length > 0 ? (
            <div className="reviews-list">
              {reviews.map(review => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-author">{review.reviewer_name}</span>
                    <span className="review-rating">{'?'.repeat(review.rating)}</span>
                  </div>
                  <p className="review-text">{review.review_text}</p>
                  <span className="review-date">
                    {new Date(review.created_at).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="reviews-placeholder">
              <p>No reviews yet. Be the first to review this resource!</p>
            </div>
          )}
          <button className="write-review-btn" onClick={() => setShowReviewModal(true)}>Write a Review</button>
        </div>

        <div className="share-section">
          <h3>Share this resource</h3>
          <div className="share-buttons">
            <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
              🔗 Copy Link
            </button>
            <button className="share-btn">📧 Email</button>
            <button className="share-btn">💬 WhatsApp</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourceDetailPage;


