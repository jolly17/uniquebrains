import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MILESTONES } from '../data/milestones';
import { DUMMY_RESOURCES, AVAILABLE_COUNTRIES, AVAILABLE_TAGS } from '../data/dummyCareResources';
import './MilestonePagePrototype.css';

function MilestonePagePrototype() {
  const { milestone } = useParams();
  const navigate = useNavigate();
  const milestoneInfo = MILESTONES.find(m => m.id === milestone) || MILESTONES[0];
  
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [filters, setFilters] = useState({
    tags: [],
    minRating: 0,
    verifiedOnly: false
  });

  // Filter resources based on current filters
  const filteredResources = DUMMY_RESOURCES.filter(resource => {
    if (filters.tags.length > 0 && !filters.tags.some(tag => resource.tags.includes(tag))) {
      return false;
    }
    if (filters.minRating > 0 && resource.rating < filters.minRating) {
      return false;
    }
    if (filters.verifiedOnly && !resource.verified) {
      return false;
    }
    if (searchQuery && !resource.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });

  const toggleTag = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="milestone-page-prototype">
      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar - Filters */}
        <aside className="filter-panel">
          <h3>Filters</h3>
          
          {/* Search Box */}
          <div className="filter-section">
            <input
              type="text"
              className="search-input"
              placeholder="Search resources or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-section">
            <h4>Tags</h4>
            <div className="tags-dropdown">
              <button 
                className="tags-dropdown-button"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
              >
                {filters.tags.length > 0 
                  ? `${filters.tags.length} selected` 
                  : 'Select tags...'}
                <span className="dropdown-arrow">{showTagsDropdown ? '▲' : '▼'}</span>
              </button>
              
              {showTagsDropdown && (
                <div className="tags-dropdown-menu">
                  {AVAILABLE_TAGS.map(tag => (
                    <label key={tag} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => toggleTag(tag)}
                      />
                      <span>{tag}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="filter-section">
            <h4>Rating</h4>
            <button
              className={`rating-btn ${filters.minRating === 4.5 ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, minRating: 4.5 }))}
            >
              ⭐ 4.5+
            </button>
            <button
              className={`rating-btn ${filters.minRating === 4.0 ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, minRating: 4.0 }))}
            >
              ⭐ 4.0+
            </button>
            <button
              className={`rating-btn ${filters.minRating === 0 ? 'active' : ''}`}
              onClick={() => setFilters(prev => ({ ...prev, minRating: 0 }))}
            >
              Any
            </button>
          </div>

          <div className="filter-section">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.verifiedOnly}
                onChange={(e) => setFilters(prev => ({ ...prev, verifiedOnly: e.target.checked }))}
              />
              <span>Verified Only</span>
            </label>
          </div>

          <button
            className="clear-filters-btn"
            onClick={() => setFilters({ tags: [], minRating: 0, verifiedOnly: false })}
          >
            Clear All Filters
          </button>

          <div className="results-count">
            {filteredResources.length} resources found
          </div>
        </aside>

        {/* Center - Resource Listings */}
        <main className="resource-listings">
          <h2>{milestoneInfo.icon} {milestoneInfo.title}</h2>
          <p className="milestone-description">{milestoneInfo.description}</p>

          <div className="resource-grid">
            {filteredResources.map(resource => (
              <div
                key={resource.id}
                className="resource-card-compact"
                onClick={() => navigate(`/care/${milestone}/${resource.id}`)}
              >
                <div className="card-header">
                  <h3>{resource.name}</h3>
                  {resource.verified && <span className="verified-badge">✓ Verified</span>}
                </div>
                
                <div className="card-rating">
                  <span className="rating-stars">⭐ {resource.rating}</span>
                  <span className="review-count">({resource.reviewCount} reviews)</span>
                </div>

                {resource.experienceYears && (
                  <div className="card-experience">
                    📅 {resource.experienceYears} years experience
                  </div>
                )}

                <div className="card-tags">
                  {resource.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag">{tag}</span>
                  ))}
                  {resource.tags.length > 3 && (
                    <span className="tag-more">+{resource.tags.length - 3} more</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right - Map */}
        <aside className="map-panel">
          {/* Country Selector and Use Location */}
          <div className="map-controls">
            <button className="use-location-btn">📍 Use My Location</button>
            <div className="country-selector">
              {AVAILABLE_COUNTRIES.map(country => (
                <button
                  key={country.code}
                  className={`country-flag ${selectedCountry === country.code ? 'active' : ''}`}
                  onClick={() => setSelectedCountry(country.code)}
                  title={country.name}
                >
                  {country.flag}
                </button>
              ))}
            </div>
          </div>
          
          <div className="map-placeholder">
            <div className="map-content">
              <h3>🗺️ Interactive Map</h3>
              <p>Map will show here</p>
              <div className="map-markers">
                {filteredResources.map(resource => (
                  <div key={resource.id} className="map-marker-preview">
                    📍 {resource.name}
                  </div>
                ))}
              </div>
              <button className="search-area-btn">Search this area</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default MilestonePagePrototype;
