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
          <h2>About</h2>
          <p>{resource.description}</p>
        </div>

        <div className="resource-detail-section">
          <h2>Contact Information</h2>
          <div className="contact-info">
            <p>📍 {resource.address}</p>
            <p>📞 <a href={`tel:${resource.phone}`}>{resource.phone}</a></p>
            <p>✉️ <a href={`mailto:${resource.email}`}>{resource.email}</a></p>
            <p>🌐 <a href={resource.website} target="_blank" rel="noopener noreferrer">Visit Website →</a></p>
          </div>
        </div>

        <div className="resource-detail-section">
          <h2>Specialties</h2>
          <div className="resource-tags">
            {resource.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>

        <div className="resource-detail-section">
          <h2>Location</h2>
          {resource.coordinates ? (
            <div className="map-embed">
              <div className="detail-map-container" style={{ height: '400px', borderRadius: '8px', overflow: 'hidden' }}>
                <iframe
                  width="100%"
                  height="400"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${resource.coordinates.lng - 0.01},${resource.coordinates.lat - 0.01},${resource.coordinates.lng + 0.01},${resource.coordinates.lat + 0.01}&layer=mapnik&marker=${resource.coordinates.lat},${resource.coordinates.lng}`}
                  allowFullScreen
                  title="Resource location map"
                />
              </div>
              <div className="map-info">
                <p className="map-address">📍 {resource.address}</p>
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${resource.coordinates.lat},${resource.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="view-on-maps-btn"
                >
                  View on Google Maps →
                </a>
              </div>
            </div>
          ) : (
            <div className="map-embed-placeholder">
              <p>📍 {resource.address}</p>
              <p className="no-coordinates">Map coordinates not available</p>
            </div>
          )}
        </div>

        <div className="resource-detail-section">
          <h2>Reviews ({resource.review_count})</h2>
          <div className="reviews-placeholder">
            <p>Reviews will appear here...</p>
            <div className="sample-reviews">
              <div className="sample-review">
                <div className="review-header">
                  <span className="review-author">Sarah M.</span>
                  <span className="review-rating">⭐⭐⭐⭐⭐</span>
                </div>
                <p className="review-text">
                  Excellent service! The staff was very understanding and professional. 
                  Highly recommend for autism assessments.
                </p>
                <span className="review-date">2 weeks ago</span>
              </div>
              <div className="sample-review">
                <div className="review-header">
                  <span className="review-author">John D.</span>
                  <span className="review-rating">⭐⭐⭐⭐</span>
                </div>
                <p className="review-text">
                  Great experience overall. Wait time was a bit long but worth it.
                </p>
                <span className="review-date">1 month ago</span>
              </div>
            </div>
          </div>
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
