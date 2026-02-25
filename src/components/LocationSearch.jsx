import { useState, useEffect, useRef } from 'react';
import './LocationSearch.css';

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

/**
 * LocationSearch Component
 * 
 * Search bar for finding locations by address or place name.
 * Features:
 * - Debounced search input (300ms)
 * - Autocomplete suggestions from Nominatim API
 * - Optional "Use My Location" button for geolocation
 * - Keyboard navigation support
 * 
 * @param {Function} onLocationFound - Callback when location is selected: (location) => void
 *   location: { lat: number, lng: number, address: string, zoom: number }
 * @param {string} placeholder - Placeholder text for search input
 * @param {boolean} showGeolocation - Whether to show "Use My Location" button (default: true)
 */
export default function LocationSearch({ onLocationFound, placeholder = 'Search for a location...', showGeolocation = true }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [geolocating, setGeolocating] = useState(false);
  
  const searchInputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimerRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new timer for debounced search
    debounceTimerRef.current = setTimeout(() => {
      searchLocation(searchQuery);
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  /**
   * Search for locations using Nominatim API
   */
  const searchLocation = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1
      });

      const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
        headers: {
          'User-Agent': 'UniqueBrains Care Roadmap (contact@uniquebrains.com)'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to search location');
      }

      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
      setSelectedIndex(-1);
    } catch (err) {
      console.error('Location search error:', err);
      setError('Failed to search location. Please try again.');
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle location selection from suggestions
   */
  const handleSelectLocation = (location) => {
    const selectedLocation = {
      lat: parseFloat(location.lat),
      lng: parseFloat(location.lon),
      address: location.display_name,
      zoom: 13 // Default zoom level for selected location
    };

    onLocationFound(selectedLocation);
    setSearchQuery(location.display_name);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  /**
   * Handle "Use My Location" button click
   */
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setGeolocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          // Reverse geocode to get address
          const params = new URLSearchParams({
            lat: latitude,
            lon: longitude,
            format: 'json',
            addressdetails: 1
          });

          const response = await fetch(`${NOMINATIM_BASE_URL}/reverse?${params}`, {
            headers: {
              'User-Agent': 'UniqueBrains Care Roadmap (contact@uniquebrains.com)'
            }
          });

          if (!response.ok) {
            throw new Error('Failed to get address');
          }

          const data = await response.json();
          
          const location = {
            lat: latitude,
            lng: longitude,
            address: data.display_name || 'Current Location',
            zoom: 13
          };

          onLocationFound(location);
          setSearchQuery(location.address);
        } catch (err) {
          console.error('Reverse geocoding error:', err);
          // Still provide location even if reverse geocoding fails
          const location = {
            lat: latitude,
            lng: longitude,
            address: 'Current Location',
            zoom: 13
          };
          onLocationFound(location);
          setSearchQuery('Current Location');
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        setGeolocating(false);
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setError('Location access denied. Please enter an address manually.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Unable to determine your location. Please enter an address.');
            break;
          case error.TIMEOUT:
            setError('Location request timed out. Please try again or enter an address.');
            break;
          default:
            setError('An error occurred while getting your location.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  /**
   * Handle keyboard navigation
   */
  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Escape') {
        setSearchQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectLocation(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
      default:
        break;
    }
  };

  /**
   * Handle clear button click
   */
  const handleClear = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    setError(null);
    searchInputRef.current?.focus();
  };

  /**
   * Handle click outside to close suggestions
   */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="location-search">
      <div className="location-search-input-wrapper">
        <input
          ref={searchInputRef}
          type="text"
          className="location-search-input"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          aria-label="Search for a location"
          aria-autocomplete="list"
          aria-controls="location-suggestions"
          aria-expanded={showSuggestions}
        />
        
        {loading && (
          <div className="location-search-loading" aria-live="polite">
            <span className="spinner"></span>
          </div>
        )}
        
        {searchQuery && !loading && (
          <button
            className="location-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            ✕
          </button>
        )}
      </div>

      <button
        className="location-search-geolocation"
        onClick={handleUseMyLocation}
        disabled={geolocating}
        aria-label="Use my current location"
        type="button"
        style={{ display: showGeolocation ? 'flex' : 'none' }}
      >
        {geolocating ? (
          <>
            <span className="spinner"></span>
            <span>Getting location...</span>
          </>
        ) : (
          <>
            <span className="geolocation-icon">📍</span>
            <span>Use My Location</span>
          </>
        )}
      </button>

      {error && (
        <div className="location-search-error" role="alert">
          {error}
        </div>
      )}

      {showSuggestions && suggestions.length > 0 && (
        <ul
          ref={suggestionsRef}
          id="location-suggestions"
          className="location-search-suggestions"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.place_id}
              className={`location-search-suggestion ${
                index === selectedIndex ? 'selected' : ''
              }`}
              onClick={() => handleSelectLocation(suggestion)}
              role="option"
              aria-selected={index === selectedIndex}
            >
              <span className="suggestion-icon">📍</span>
              <span className="suggestion-text">{suggestion.display_name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
