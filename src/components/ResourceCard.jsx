import PropTypes from 'prop-types';
import './ResourceCard.css';

/**
 * ResourceCard Component
 * 
 * Displays a compact care resource card with key information.
 * Clicking the card opens a detail view (handled by parent).
 * 
 * @param {Object} resource - The resource data to display
 * @param {Function} onClick - Handler for card click
 */
function ResourceCard({ resource, onClick }) {
  const handleClick = () => {
    if (onClick) {
      onClick(resource.id);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div
      className="resource-card-compact"
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${resource.name}`}
    >
      <div className="card-header">
        <h3>{resource.name}</h3>
        {resource.verified && (
          <span className="verified-badge" aria-label="Verified resource">
            ✓ Verified
          </span>
        )}
      </div>
      
      <div className="card-rating">
        <span className="rating-stars" aria-label={`Rating: ${resource.rating} out of 5 stars`}>
          ⭐ {resource.rating}
        </span>
        <span className="review-count" aria-label={`${resource.review_count || 0} reviews`}>
          ({resource.review_count || 0} reviews)
        </span>
      </div>

      {resource.experienceYears && (
        <div className="card-experience" aria-label={`${resource.experienceYears} years of experience`}>
          📅 {resource.experienceYears} years experience
        </div>
      )}

      <div className="card-tags" aria-label="Resource tags">
        {resource.tags.slice(0, 3).map(tag => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
        {resource.tags.length > 3 && (
          <span className="tag-more" aria-label={`${resource.tags.length - 3} more tags`}>
            +{resource.tags.length - 3} more
          </span>
        )}
      </div>
    </div>
  );
}

ResourceCard.propTypes = {
  resource: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    rating: PropTypes.number,
    reviewCount: PropTypes.number,
    experienceYears: PropTypes.number,
    tags: PropTypes.arrayOf(PropTypes.string),
    verified: PropTypes.bool
  }).isRequired,
  onClick: PropTypes.func
};

ResourceCard.defaultProps = {
  onClick: null
};

export default ResourceCard;
