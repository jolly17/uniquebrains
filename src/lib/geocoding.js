// Geocoding service for converting addresses to coordinates
// Supports multiple providers: Nominatim (default, free), Google, Mapbox

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const GEOCODING_SERVICE = import.meta.env.VITE_GEOCODING_SERVICE || 'nominatim';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

// Cache for geocoding results to avoid duplicate API calls
const geocodeCache = new Map();

/**
 * Geocode an address to coordinates
 * @param {Object} address - Address components
 * @param {string} address.address - Street address
 * @param {string} address.city - City name
 * @param {string} address.state - State/province
 * @param {string} address.zipCode - Postal code
 * @param {string} address.country - Country code (ISO 3166-1 alpha-2)
 * @returns {Promise<Object|null>} - {lat, lng} or null if failed
 */
export async function geocodeAddress({ address, city, state, zipCode, country }) {
  // Build address string, filtering out empty/undefined values
  const addressParts = [
    address,
    city,
    state,
    zipCode,
    country
  ].filter(part => part && part.trim() !== '');
  
  const fullAddress = addressParts.join(', ');
  
  // Debug logging
  console.log('Geocoding address:', {
    input: { address, city, state, zipCode, country },
    fullAddress,
    partsCount: addressParts.length
  });
  
  // Validate we have at least address and country
  if (!address || !country) {
    console.error('Geocoding requires at least address and country');
    return null;
  }
  
  // Check cache first
  if (geocodeCache.has(fullAddress)) {
    return geocodeCache.get(fullAddress);
  }
  
  try {
    let result;
    
    switch (GEOCODING_SERVICE) {
      case 'google':
        result = await geocodeWithGoogle(fullAddress);
        break;
      case 'mapbox':
        result = await geocodeWithMapbox(fullAddress);
        break;
      case 'nominatim':
      default:
        result = await geocodeWithNominatim(fullAddress);
        break;
    }
    
    // Cache the result
    if (result) {
      geocodeCache.set(fullAddress, result);
    }
    
    return result;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Geocode using Nominatim (OpenStreetMap) - Free, no API key required
 * Rate limit: 1 request/second
 */
async function geocodeWithNominatim(address) {
  const params = new URLSearchParams({
    q: address,
    format: 'json',
    limit: 1,
    addressdetails: 1
  });
  
  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': 'UniqueBrains Care Roadmap (contact@uniquebrains.com)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.length === 0) {
    console.error('Nominatim returned no results for:', address);
    return null;
  }
  
  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

/**
 * Geocode using Google Geocoding API - Paid, requires API key
 * Rate limit: 50 requests/second
 */
async function geocodeWithGoogle(address) {
  if (!GOOGLE_API_KEY) {
    throw new Error('Google API key not configured. Set VITE_GOOGLE_GEOCODING_API_KEY in .env');
  }
  
  const params = new URLSearchParams({
    address: address,
    key: GOOGLE_API_KEY
  });
  
  const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?${params}`);
  const data = await response.json();
  
  if (data.status !== 'OK' || data.results.length === 0) {
    console.warn(`Google Geocoding failed: ${data.status}`);
    return null;
  }
  
  const location = data.results[0].geometry.location;
  return {
    lat: location.lat,
    lng: location.lng
  };
}

/**
 * Geocode using Mapbox Geocoding API - Paid, requires API key
 * Rate limit: 600 requests/minute
 */
async function geocodeWithMapbox(address) {
  if (!MAPBOX_API_KEY) {
    throw new Error('Mapbox API key not configured. Set VITE_MAPBOX_API_KEY in .env');
  }
  
  const encodedAddress = encodeURIComponent(address);
  const response = await fetch(
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_API_KEY}`
  );
  
  const data = await response.json();
  
  if (!data.features || data.features.length === 0) {
    console.warn('Mapbox Geocoding returned no results');
    return null;
  }
  
  const [lng, lat] = data.features[0].center;
  return { lat, lng };
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
}

/**
 * Get cache size
 */
export function getGeocodeCacheSize() {
  return geocodeCache.size;
}
