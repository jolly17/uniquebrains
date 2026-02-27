import { useState } from 'react';
import PropTypes from 'prop-types';
import ResourceCard from './ResourceCard';
import './ResourceListings.css';

/**
 * ResourceListings Component
 * 
 * Displays a filterable list of care resources with a filter panel.
 * Includes tag filtering, rating filtering, and verified-only toggle.
 * 
 * @param {Array} resources - Array of resource objects to display
 * @param {Boolean} loading - Whether resources are currently loading
 * @param {String} milestone - Current milestone name for display
 * @param {Object} milestoneInfo - Milestone metadata (icon, title, description)
 * @param {Function} onResourceClick - Handler for when a resource card is clicked
 * @param {Array} availableTags - Array of available tags for filtering
 * @param {String} searchQuery - External search query for filtering resources
 */
function ResourceListings({ 
  resources, 
  loading, 
  milestone,
  milestoneInfo,
  onResourceClick,
  availableTags,
  searchQuery = '',
  selectedTags = [],
  showFilters = true,
  hoveredResourceId = null,
  onResourceHover = null
}) {
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'rating', 'distance'
  const [filters, setFilters] = useState({
    minRating: 0,
    verifiedOnly: false
  });

  // Filter resources based on current filters and search
  const filteredResources = resources.filter(resource => {
    // Tag filter (from external prop)
    if (selectedTags.length > 0 && !selectedTags.some(tag => resource.tags?.includes(tag))) {
      return false;
    }
    // Rating filter
    if (filters.minRating > 0 && resource.rating < filters.minRating) {
      return false;
    }
    // Verified filter
    if (filters.verifiedOnly && !resource.verified) {
      return false;
    }
    // Search filter (from external prop)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = resource.name.toLowerCase().includes(query);
      const matchesDescription = resource.description?.toLowerCase().includes(query);
      const matchesTags = resource.tags?.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }
    return true;
  });

  // Sort filtered resources
  const sortedResources = [...filteredResources].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'distance':
        return (a.distance || 0) - (b.distance || 0);
      case 'name':
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const toggleTag = (tag) => {
    // This is now handled by parent component
    // Keep this function for backward compatibility if filter panel is shown
  };

  const clearAllFilters = () => {
    setFilters({ minRating: 0, verifiedOnly: false });
  };

  return (
    <div className={`resource-listings-container ${!showFilters ? 'no-filters' : ''}`}>
      {/* Left Sidebar - Filters */}
      {showFilters && (
      <aside className="filter-panel" role="complementary" aria-label="Resource filters">
        <h3>Filters</h3>
        
        {/* Tags Filter */}
        <div className="filter-section">
          <h4>Tags</h4>
          <div className="tags-dropdown">
            <button 
              className="tags-dropdown-button"
              onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              aria-expanded={showTagsDropdown}
              aria-controls="tags-dropdown-menu"
              aria-label={`Select tags. ${selectedTags.length} tags selected`}
            >
              {selectedTags.length > 0 
                ? `${selectedTags.length} selected` 
                : 'Select tags...'}
              <span className="dropdown-arrow" aria-hidden="true">
                {showTagsDropdown ? '▲' : '▼'}
              </span>
            </button>
            
            {showTagsDropdown && (
              <div 
                id="tags-dropdown-menu"
                className="tags-dropdown-menu"
                role="group"
                aria-label="Available tags"
              >
                {availableTags.map(tag => (
                  <label key={tag} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag)}
                      onChange={() => toggleTag(tag)}
                      aria-label={`Filter by ${tag}`}
                    />
                    <span>{tag}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating Filter */}
        <div className="filter-section">
          <h4>Rating</h4>
          <button
            className={`rating-btn ${filters.minRating === 4.5 ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, minRating: 4.5 }))}
            aria-pressed={filters.minRating === 4.5}
            aria-label="Filter by 4.5 stars or higher"
          >
            ⭐ 4.5+
          </button>
          <button
            className={`rating-btn ${filters.minRating === 4.0 ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, minRating: 4.0 }))}
            aria-pressed={filters.minRating === 4.0}
            aria-label="Filter by 4.0 stars or higher"
          >
            ⭐ 4.0+
          </button>
          <button
            className={`rating-btn ${filters.minRating === 0 ? 'active' : ''}`}
            onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
            aria-pressed={filters.minRating === 0}
            aria-label="Show all ratings"
          >
            Any
          </button>
        </div>

        {/* Verified Only Filter */}
        <div className="filter-section">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={filters.verifiedOnly}
              onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
              aria-label="Show only verified resources"
            />
            <span>Verified Only</span>
          </label>
        </div>

        {/* Clear Filters Button */}
        <button
          className="clear-filters-btn"
          onClick={clearAllFilters}
          aria-label="Clear all filters"
        >
          Clear All Filters
        </button>

        {/* Results Count */}
        <div className="results-count" role="status" aria-live="polite">
          {loading ? 'Loading...' : `${sortedResources.length} resources found`}
        </div>
      </aside>
      )}

      {/* Main Content - Resource Listings */}
      <main className="resource-listings-main" role="main">
        {/* Header */}
        {milestoneInfo && (
          <div className="listings-header">
            <h2>
              <span aria-hidden="true">{milestoneInfo.icon}</span> {milestoneInfo.title}
            </h2>
            <p className="milestone-description">{milestoneInfo.description}</p>
          </div>
        )}

        {/* Sort Controls */}
        <div className="sort-controls" role="group" aria-label="Sort resources">
          <label htmlFor="sort-select" className="sort-label">Sort by:</label>
          <select
            id="sort-select"
            className="sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="Sort resources by"
          >
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="distance">Distance</option>
          </select>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="loading-state" role="status" aria-live="polite">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && sortedResources.length === 0 && (
          <div className="empty-state" role="status">
            <div className="empty-state-icon" aria-hidden="true">🔍</div>
            <h3>No resources found</h3>
            <p>
              {searchQuery || selectedTags.length > 0 || filters.minRating > 0 || filters.verifiedOnly
                ? 'Try adjusting your filters or search query.'
                : 'No resources available for this milestone yet.'}
            </p>
            {(searchQuery || selectedTags.length > 0 || filters.minRating > 0 || filters.verifiedOnly) && (
              <button className="clear-filters-btn-inline" onClick={clearAllFilters}>
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Resource Grid */}
        {!loading && sortedResources.length > 0 && (
          <div className="resource-grid" role="list">
            {sortedResources.map(resource => (
              <div key={resource.id} role="listitem">
                <ResourceCard 
                  resource={resource} 
                  onClick={onResourceClick}
                  isHovered={hoveredResourceId === resource.id}
                  onHover={() => onResourceHover && onResourceHover(resource.id)}
                  onHoverEnd={() => onResourceHover && onResourceHover(null)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

ResourceListings.propTypes = {
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      rating: PropTypes.number,
      reviewCount: PropTypes.number,
      experienceYears: PropTypes.number,
      tags: PropTypes.arrayOf(PropTypes.string),
      verified: PropTypes.bool,
      distance: PropTypes.number
    })
  ).isRequired,
  loading: PropTypes.bool,
  milestone: PropTypes.string,
  milestoneInfo: PropTypes.shape({
    icon: PropTypes.string,
    title: PropTypes.string,
    description: PropTypes.string
  }),
  onResourceClick: PropTypes.func,
  availableTags: PropTypes.arrayOf(PropTypes.string),
  searchQuery: PropTypes.string
};

ResourceListings.defaultProps = {
  loading: false,
  milestone: '',
  milestoneInfo: null,
  onResourceClick: null,
  availableTags: [],
  searchQuery: ''
};

export default ResourceListings;
