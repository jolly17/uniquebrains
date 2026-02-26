import { useState, useEffect } from 'react';
import StarRating from '../components/StarRating';
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

    async function fetchReviews() {
      try {
        const { data, error } = await supabase
          .from('care_reviews')
          .select('*')
          .eq('resource_id', resourceId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }

    if (resourceId) {
      fetchResource();
      fetchReviews();
    }
  }, [resourceId]);

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    // Refresh reviews after submission
    async function refreshReviews() {
      try {
        const { data, error } = await supabase
          .from('care_reviews')
          .select('*')
          .eq('resource_id', resourceId)
          .eq('is_approved', true)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setReviews(data || []);
      } catch (err) {
        console.error('Error fetching reviews:', err);
      }
    }
    refreshReviews();
  };

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
             Back to {milestone}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="resource-detail-page">
      <div className="resource-detail-container">
        <button onClick={() => navigate(`/care/${milestone}`)} className="back-btn">
           Back to {milestone}
        </button>

        <div className="resource-detail-header">
          <h1>{resource.name}</h1>
          {resource.verified && <span className="verified-badge"> Verified</span>}
        </div>

        <div className="resource-detail-rating">
          <StarRating rating={resource.rating} size="large" />
          <span className="review-count">({resource.review_count} reviews)</span>
        </div>

        {resource.experience_years && (
          <div className="resource-detail-experience">
             {resource.experience_years} years of experience
          </div>
        )}

        {resource.description && (
          <div className="resource-detail-description">
            <p>{resource.description}</p>
          </div>
        )}

        <div className="resource-detail-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <p><strong>Address:</strong> {resource.address}, {resource.city}, {resource.state} {resource.zip_code}</p>
            {resource.phone && <p><strong>Phone:</strong> {resource.phone}</p>}
            {resource.email && <p><strong>Email:</strong> {resource.email}</p>}
            {resource.website && (
              <p>
                <strong>Website:</strong>{' '}
                <a href={resource.website} target="_blank" rel="noopener noreferrer">
                  {resource.website}
                </a>
              </p>
            )}
          </div>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="resource-detail-section">
            <h2>Services</h2>
            <div className="resource-tags">
              {resource.tags.map((tag, index) => (
                <span key={index} className="tag">{tag}</span>
              ))}
            </div>
          </div>
        )}

        {resource.coordinates && (
          <div className="resource-detail-section">
            <h2>Location</h2>
            <div className="resource-map">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${resource.coordinates.lng-0.01},${resource.coordinates.lat-0.01},${resource.coordinates.lng+0.01},${resource.coordinates.lat+0.01}&layer=mapnik&marker=${resource.coordinates.lat},${resource.coordinates.lng}`}
                title="Resource location map"
              />
            </div>
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
                    <span className="review-rating">{''.repeat(review.rating)}</span>
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
          <button className="write-review-btn" onClick={() => setShowReviewModal(true)}>
            Write a Review
          </button>
        </div>

        <div className="share-section">
          <h3>Share this resource</h3>
          <div className="share-buttons">
            <button className="share-btn" onClick={() => navigator.clipboard.writeText(window.location.href)}>
               Copy Link
            </button>
            <button className="share-btn"> Email</button>
            <button className="share-btn"> WhatsApp</button>
          </div>
        </div>
      </div>

      {showReviewModal && (
        <ReviewModal
          resourceId={resourceId}
          resourceName={resource.name}
          onClose={() => setShowReviewModal(false)}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
}

export default ResourceDetailPage;
