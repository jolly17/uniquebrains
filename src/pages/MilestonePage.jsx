import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { MILESTONES } from '../data/milestones';
import { getResourcesByMilestoneAndLocation } from '../services/careResourceService';
import { supabase } from '../lib/supabase';
import { AVAILABLE_COUNTRIES, AVAILABLE_TAGS } from '../data/dummyCareResources';
import ResourceListings from '../components/ResourceListings';
import './MilestonePage.css';

// Lazy load InteractiveMap for better initial page load performance
const InteractiveMap = lazy(() => import('../components/InteractiveMap'));

/**
 * MilestonePage Component
 * 
 * Individual page for each care stage with Yelp/Airbnb-style layout:
 * - Filters on left
 * - Resource listings in center
 * - Interactive map on right
 * 
 * Features:
 * - Location-based resource filtering
 * - URL parameter handling for location (lat, lng, zoom)
 * - Country selector for quick navigation
 * - Real-time resource fetching from database
 * - Integration with InteractiveMap, ResourceListings, and MilestoneNavigation
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.5, 4.3, 5.1, 8.5
 */
function MilestonePage() {
  const { milestone } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Get milestone info
  const milestoneInfo = MILESTONES.find(m => m.id === milestone) || MILESTONES[0];
  
  // State management
  const [selectedCountry, setSelectedCountry] = useState('US');
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resourceSearchQuery, setResourceSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [hoveredResourceId, setHoveredResourceId] = useState(null);
  
  // Map state - initialize from URL parameters or defaults
  const [mapCenter, setMapCenter] = useState(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const zoom = searchParams.get('zoom');
    
    if (lat && lng) {
      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        zoom: zoom ? parseInt(zoom) : 13
      };
    }
    
    // Default to US geographic center
    return { lat: 39.8283, lng: -98.5795, zoom: 4 };
  });

  /**
   * Fetch resources based on milestone and location
   */
  const fetchResources = async (milestone, location) => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Fetching resources for milestone:', milestone);
      console.log('Location:', location);
      
      const params = {
        milestone,
        radiusMiles: 50
      };
      
      // Add location parameters if available
      if (location && location.lat && location.lng) {
        params.latitude = location.lat;
        params.longitude = location.lng;
      }
      
      const data = await getResourcesByMilestoneAndLocation(params);
      console.log('Fetched resources:', data);
      setResources(data);
    } catch (err) {
      console.error('Error fetching resources:', err);
      setError(err.message || 'Failed to load resources');
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch unique tags from database
   */
  const fetchAvailableTags = async (milestone) => {
    try {
      const { data, error } = await supabase
        .from('care_resources')
        .select('tags')
        .eq('milestone', milestone);
      
      if (error) throw error;
      
      // Extract unique tags
      const allTags = data.flatMap(resource => resource.tags || []);
      const uniqueTags = [...new Set(allTags)].sort();
      setAvailableTags(uniqueTags);
    } catch (err) {
      console.error('Error fetching tags:', err);
      setAvailableTags([]);
    }
  };

  /**
   * Update URL parameters when location changes
   */
  const updateURLParams = (location) => {
    const params = new URLSearchParams(searchParams);
    
    if (location.lat && location.lng) {
      params.set('lat', location.lat.toString());
      params.set('lng', location.lng.toString());
      params.set('zoom', (location.zoom || 13).toString());
    } else {
      params.delete('lat');
      params.delete('lng');
      params.delete('zoom');
    }
    
    setSearchParams(params, { replace: true });
  };

  /**
   * Handle country selection
   */
  const handleCountrySelect = (countryCode) => {
    setSelectedCountry(countryCode);
    
    // Country center coordinates
    const countryInfo = AVAILABLE_COUNTRIES.find(c => c.code === countryCode);
    if (countryInfo) {
      const newCenter = {
        lat: countryInfo.center[0],
        lng: countryInfo.center[1],
        zoom: countryInfo.zoom
      };
      setMapCenter(newCenter);
      updateURLParams(newCenter);
    }
  };

  /**
   * Handle location found from search
   */
  const handleLocationFound = (location) => {
    const newCenter = {
      lat: location.lat,
      lng: location.lng,
      zoom: location.zoom || 13
    };
    setMapCenter(newCenter);
    updateURLParams(newCenter);
  };

  /**
   * Toggle tag selection
   */
  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };
  /**
   * Clear all tag selections
   */
  const clearAllTags = () => {
    setSelectedTags([]);
  };

  /**
   * Select all available tags
   */
  const selectAllTags = () => {
    setSelectedTags(availableTags);
  };

  /**
   * Handle resource card click - navigate to detail page
   */
  const handleResourceClick = (resourceId) => {
    navigate(`/care/${milestone}/${resourceId}`);
  };

  /**
   * Handle map movement with debounced resource fetching
   */
  const mapMoveTimeoutRef = useRef(null);
  
  const handleMapMove = (bounds, center) => {
    // Update map center state
    setMapCenter(center);
    
    // Update URL parameters
    updateURLParams(center);
    
    // Debounce resource fetching - wait 500ms after user stops moving map
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
    
    mapMoveTimeoutRef.current = setTimeout(() => {
      // Fetch resources in new bounds
      fetchResourcesInBounds(bounds, milestone);
    }, 500);
  };
  
  /**
   * Fetch resources within map bounds
   */
  const fetchResourcesInBounds = async (bounds, milestone) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('care_resources')
        .select('*')
        .eq('milestone', milestone)
        .gte('lat', bounds.south)
        .lte('lat', bounds.north)
        .gte('lng', bounds.west)
        .lte('lng', bounds.east);
      
      if (error) throw error;
      
      // Transform to include coordinates object
      const transformedData = (data || []).map(resource => ({
        ...resource,
        coordinates: resource.lat && resource.lng 
          ? { lat: resource.lat, lng: resource.lng }
          : null
      }));
      
      console.log(`Fetched ${transformedData.length} resources in bounds`);
      setResources(transformedData);
    } catch (err) {
      console.error('Error fetching resources in bounds:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Fetch resources when milestone or location changes
  useEffect(() => {
    if (milestone) {
      // Don't pass location on initial load - show all resources
      // Only filter by location when user explicitly searches
      fetchResources(milestone, null);
      fetchAvailableTags(milestone);
    }
  }, [milestone]);

  return (
    <div className="milestone-page">
      {/* Search Bar Header */}
      <div className="milestone-header">
        <div className="milestone-header-content">
          <h1>{milestoneInfo.title}</h1>
          <p className="milestone-subtitle">{milestoneInfo.description}</p>
          <div className="header-controls">
            <div className="resource-search-wrapper">
              <input
                type="text"
                className="resource-search-input"
                placeholder="Search resources by name, description, or tags..."
                value={resourceSearchQuery}
                onChange={(e) => setResourceSearchQuery(e.target.value)}
                aria-label="Search resources"
              />
              {resourceSearchQuery && (
                <button
                  className="resource-search-clear"
                  onClick={() => setResourceSearchQuery('')}
                  aria-label="Clear resource search"
                  type="button"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="header-tags-dropdown">
              <button 
                className="tags-dropdown-button"
                onClick={() => setShowTagsDropdown(!showTagsDropdown)}
                aria-expanded={showTagsDropdown}
                aria-label={`Filter by tags. ${selectedTags.length} tags selected`}
              >
                {selectedTags.length > 0 
                  ? `${selectedTags.length} tags selected` 
                  : 'Filter by tags...'}
                <span className="dropdown-arrow" aria-hidden="true">
                  {showTagsDropdown ? '▲' : '▼'}
                </span>
              </button>
              
              {showTagsDropdown && (
                                <div className="tags-dropdown-menu">
                  <div className="tags-actions">
                    <button type="button" onClick={selectAllTags} className="tag-action-btn">
                      Select All
                    </button>
                    <button type="button" onClick={clearAllTags} className="tag-action-btn">
                      Clear All
                    </button>
                  </div>
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
            <div className="header-country-selector" role="group" aria-label="Select country">
              {AVAILABLE_COUNTRIES.map(country => (
                <button
                  key={country.code}
                  className={`country-flag ${selectedCountry === country.code ? 'active' : ''}`}
                  onClick={() => handleCountrySelect(country.code)}
                  title={country.name}
                  aria-label={`View resources in ${country.name}`}
                  aria-pressed={selectedCountry === country.code}
                >
                  {country.flag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="milestone-main-content">
        {/* Center - Resource Listings (includes left filter panel) */}
        <div className="listings-section">
          <ResourceListings
            resources={resources}
            loading={loading}
            milestone={milestone}
            milestoneInfo={milestoneInfo}
            onResourceClick={handleResourceClick}
            availableTags={AVAILABLE_TAGS}
            searchQuery={resourceSearchQuery}
            selectedTags={selectedTags}
            showFilters={false}
            hoveredResourceId={hoveredResourceId}
            onResourceHover={setHoveredResourceId}
          />
        </div>

        {/* Right - Map Panel */}
        <aside className="map-panel" role="complementary" aria-label="Interactive map">
          {/* Interactive Map */}
          <div className="map-container">
            <Suspense fallback={
              <div className="map-loading-placeholder" role="status" aria-live="polite">
                <div className="map-skeleton">
                  <div className="skeleton-spinner"></div>
                  <p>Loading map...</p>
                </div>
              </div>
            }>
              <InteractiveMap
                resources={resources}
                mapCenter={mapCenter}
                onMapMove={handleMapMove}
                onResourceClick={handleResourceClick}
                onLocationFound={handleLocationFound}
                hoveredResourceId={hoveredResourceId}
                onMarkerHover={setHoveredResourceId}
              />
            </Suspense>
          </div>
        </aside>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message" role="alert">
          <p>⚠️ {error}</p>
          <button onClick={() => fetchResources(milestone, null)}>
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

export default MilestonePage;

