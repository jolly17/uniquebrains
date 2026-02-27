import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import LocationSearch from './LocationSearch';
import './InteractiveMap.css';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

/**
 * Component to update map view when center/zoom changes
 */
function MapViewController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || 13, {
        animate: true,
        duration: 0.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

/**
 * InteractiveMap Component
 * 
 * Leaflet-based map that displays resource markers and allows location selection.
 * Features:
 * - OpenStreetMap tiles (no API key required)
 * - Resource markers with clustering
 * - Location search integration
 * - Click to select location
 * - Responsive and accessible
 * 
 * @param {Array} resources - Array of resource objects with coordinates
 * @param {Object} mapCenter - Center coordinates: { lat, lng, zoom }
 * @param {Function} onMapMove - Callback when map is moved: (bounds, center) => void
 * @param {Function} onResourceClick - Callback when resource marker is clicked: (resourceId) => void
 * @param {string} selectedResourceId - ID of currently selected resource
 * @param {Function} onLocationFound - Callback when location is selected via search
 */
export default function InteractiveMap({
  resources = [],
  mapCenter = { lat: 39.8283, lng: -98.5795, zoom: 4 },
  onMapMove,
  onResourceClick,
  selectedResourceId = null,
  onLocationFound,
  hoveredResourceId = null,
  onMarkerHover
}) {
  const [mapReady, setMapReady] = useState(false);
  const [hoveredMarkerId, setHoveredMarkerId] = useState(null);
  const mapRef = useRef(null);

  /**
   * Create custom marker icon based on rating
   */
  const createMarkerIcon = (rating, isSelected = false, isHovered = false) => {
    let color = '#6b7280'; // gray for no rating
    
    if (rating >= 4.5) {
      color = '#10b981'; // green
    } else if (rating >= 3.5) {
      color = '#f59e0b'; // yellow
    }

    if (isSelected || isHovered) {
      color = '#7c3aed'; // purple for selected/hovered
    }

    const svgIcon = `
      <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
        <path d="M12.5 0C5.6 0 0 5.6 0 12.5C0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0Z" 
              fill="${color}" stroke="#fff" stroke-width="2"/>
        <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
      </svg>
    `;

    return L.divIcon({
      html: svgIcon,
      className: 'custom-marker-icon',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34]
    });
  };

  /**
   * Handle map movement end
   */
  const handleMapMoveEnd = () => {
    if (!mapRef.current || !onMapMove) return;

    const map = mapRef.current;
    const bounds = map.getBounds();
    const center = map.getCenter();
    const zoom = map.getZoom();

    onMapMove(
      {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      },
      {
        lat: center.lat,
        lng: center.lng,
        zoom: zoom
      }
    );
  };

  /**
   * Handle marker click
   */
  const handleMarkerClick = (resourceId) => {
    if (onResourceClick) {
      onResourceClick(resourceId);
    }
  };

  /**
   * Handle location search result
   */
  const handleLocationSearchResult = (location) => {
    if (onLocationFound) {
      onLocationFound(location);
    }
  };

  return (
    <div className="interactive-map-container" role="region" aria-label="Interactive resource map">
      {/* Location Search */}
      <div className="map-search-overlay">
        <LocationSearch
          onLocationFound={handleLocationSearchResult}
          placeholder="Search for a location..."
        />
      </div>

      {/* Map */}
      <div className="map-wrapper" role="application" aria-label="Map view of resources">
        {!mapReady && (
          <div className="map-loading-skeleton" aria-live="polite">
            <div className="skeleton-content">
              <div className="skeleton-spinner"></div>
              <p>Loading map...</p>
            </div>
          </div>
        )}
        
        {/* Keyboard instructions for screen readers */}
        <div className="visually-hidden" role="status" aria-live="polite">
          Use arrow keys to pan the map. Use plus and minus keys to zoom. Tab to navigate between markers.
        </div>
        
        <MapContainer
          center={[mapCenter.lat, mapCenter.lng]}
          zoom={mapCenter.zoom}
          className="leaflet-map"
          ref={mapRef}
          whenReady={() => setMapReady(true)}
          scrollWheelZoom={true}
          zoomControl={true}
          attributionControl={true}
          keyboard={true}
          keyboardPanDelta={80}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />

          {/* Map view controller */}
          <MapViewController center={mapCenter} zoom={mapCenter.zoom} />

          {/* Resource markers with clustering */}
          {resources.length > 0 && (
            <MarkerClusterGroup
              chunkedLoading
              maxClusterRadius={50}
              spiderfyOnMaxZoom={true}
              showCoverageOnHover={false}
              zoomToBoundsOnClick={true}
            >
              {resources.map((resource) => {
                if (!resource.coordinates || !resource.coordinates.lat || !resource.coordinates.lng) {
                  return null;
                }

                const isSelected = selectedResourceId === resource.id;
                const isHovered = hoveredMarkerId === resource.id || hoveredResourceId === resource.id;

                return (
                  <Marker
                    key={resource.id}
                    position={[resource.coordinates.lat, resource.coordinates.lng]}
                    icon={createMarkerIcon(resource.rating, isSelected, isHovered)}
                    eventHandlers={{
                      click: () => handleMarkerClick(resource.id),
                      mouseover: () => {
                        setHoveredMarkerId(resource.id);
                        if (onMarkerHover) onMarkerHover(resource.id);
                      },
                      mouseout: () => {
                        setHoveredMarkerId(null);
                        if (onMarkerHover) onMarkerHover(null);
                      }
                    }}
                  >
                    <Popup>
                      <div className="marker-popup">
                        <h4>{resource.name}</h4>
                        {resource.rating && (
                          <div className="popup-rating">
                            ⭐ {resource.rating} ({resource.reviewCount || 0} reviews)
                          </div>
                        )}
                        {resource.address && (
                          <p className="popup-address">{resource.address}</p>
                        )}
                        {resource.verified && (
                          <span className="popup-verified">✓ Verified</span>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            </MarkerClusterGroup>
          )}
        </MapContainer>
      </div>

      {/* Resource count indicator */}
      {mapReady && resources.length > 0 && (
        <div className="map-resource-count" aria-live="polite">
          {resources.length} resource{resources.length !== 1 ? 's' : ''} in view
        </div>
      )}
    </div>
  );
}
