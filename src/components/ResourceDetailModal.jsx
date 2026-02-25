import { useEffect } from 'react';
import PropTypes from 'prop-types';
import './ResourceDetailModal.css';

/**
 * ResourceDetailModal Component
 * 
 * Displays a modal overlay with detailed information about a care resource.
 * Includes full description, contact information, reviews, and action buttons.
 * 
 * @param {Object} resource - The resource data to display
 * @param {Function} onClose - Handler to close the modal
 * @param {Object} user - Current user object (for "Write a Review" feature)
 */
function ResourceDetailModal({ resource, onClose, user }) {
  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [onClose]);

  // Close modal when clicking outside the content
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      onClose();
    }
  };

  const handleViewOnMap = () => {
    const { coordinates } = resource;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${coordinates.lat},${coordinates.lng}`;
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="modal-content">
        <button 
          className="modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ✕
        </button>

        <div className="modal-header">
          <h2 id="modal-title">{resource.name}</h2>
          {resource.verified && (
            <span className="verified-badge" aria-label="Verified resource">
              ✓ Verified
            </span>
          )}
        </div>

        <div className="modal-rating">
          <span className="rating-stars" aria-label={`Rating: ${resource.rating} out of 5 stars`}>
            ⭐ {resource.rating}
          </span>
          <span className="review-count">
            ({resource.reviewCount} {resource.reviewCount === 1 ? 'review' : 'reviews'})
          </span>
        </div>

        {resource.experienceYears && (
          <div className="modal-experience">
            <strong>Experience:</strong> {resource.experienceYears} years
          </div>
        )}

        <div className="modal-section">
          <h3>Description</h3>
          <p>{resource.description || 'No description available.'}</p>
        </div>

        <div className="modal-section">
          <h3>Contact Information</h3>
          <div className="contact-info">
            <div className="contact-item">
              <span className="contact-icon">📍</span>
              <div className="contact-details">
                <strong>Address:</strong>
                <p>
                  {resource.address}<br />
                  {resource.city}, {resource.state} {resource.zipCode}<br />
                  {resource.country}
                </p>
                <button 
                  className="view-map-btn"
                  onClick={handleViewOnMap}
                  aria-label="View location on map"
                >
                  View on Map
                </button>
              </div>
            </div>

            {resource.phone && (
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <div className="contact-details">
                  <strong>Phone:</strong>
                  <a href={`tel:${resource.phone}`}>{resource.phone}</a>
                </div>
              </div>
            )}

            {resource.email && (
              <div className="contact-item">
                <span className="contact-icon">✉️</span>
                <div className="contact-details">
                  <strong>Email:</strong>
                  <a href={`mailto:${resource.email}`}>{resource.email}</a>
                </div>
              </div>
            )}

            {resource.website && (
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <div className="contact-details">
                  <strong>Website:</strong>
                  <a 
                    href={resource.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    aria-label="Visit website (opens in new tab)"
                  >
                    {resource.website}
                    <span className="external-icon" aria-hidden="true"> ↗</span>
                  </a>
                </div>
              </div>
            )}

            {resource.distance && (
              <div className="contact-item">
                <span className="contact-icon">📏</span>
                <div className="contact-details">
                  <strong>Distance:</strong>
                  <span>{resource.distance.toFixed(1)} miles from your location</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {resource.tags && resource.tags.length > 0 && (
          <div className="modal-section">
            <h3>Categories</h3>
            <div className="modal-tags">
              {resource.tags.map(tag => (
                <span key={tag} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="modal-section">
          <h3>Reviews</h3>
          {resource.reviews && resource.reviews.length > 0 ? (
            <div className="reviews-list">
              {resource.reviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-header">
                    <span className="review-rating" aria-label={`Rating: ${review.rating} out of 5 stars`}>
                      {'⭐'.repeat(review.rating)}
                    </span>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                  <p className="review-author">— {review.userName}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-reviews">No reviews yet. Be the first to review!</p>
          )}
          
          {user && (
            <button className="write-review-btn" aria-label="Write a review">
              Write a Review
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ResourceDetailModal.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    address: PropTypes.string.isRequired,
    city: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    zipCode: PropTypes.string.isRequired,
    country: PropTypes.string.isRequired,
    coordinates: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired
    }).isRequired,
    phone: PropTypes.string,
    email: PropTypes.string,
    website: PropTypes.string,
    experienceYears: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    verified: PropTypes.bool,
    distance: PropTypes.number,
    reviews: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      comment: PropTypes.string,
      userName: PropTypes.string.isRequired,
      createdAt: PropTypes.string.isRequired
    }))
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object
};

ResourceDetailModal.defaultProps = {
  user: null
};

export default ResourceDetailModal;
