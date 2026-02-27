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
  // Clean address parts - remove newlines and extra spaces
  const cleanPart = (part) => part ? part.replace(/\s+/g, ' ').trim() : '';
  
  const cleanAddress = cleanPart(address);
  const cleanCity = cleanPart(city);
  const cleanState = cleanPart(state);
  const cleanZipCode = cleanPart(zipCode);
  const cleanCountry = cleanPart(country);
  
  // Check if this is an online/virtual service
  const isOnlineService = !cleanAddress || 
                         cleanAddress.toLowerCase() === 'online' || 
                         cleanAddress.toLowerCase() === 'virtual' ||
                         cleanAddress.toLowerCase() === 'n/a';
  
  if (isOnlineService) {
    console.log('Online/virtual service detected - using location-based fallback');
    
    // Try cascading fallback: zipCode -> city -> state -> country center
    if (cleanZipCode && cleanCountry) {
      const result = await geocodeWithNominatim(`${cleanZipCode}, ${cleanCountry}`);
      if (result) {
        console.log('Geocoded using zipCode + country');
        return result;
      }
    }
    
    if (cleanCity && cleanCountry) {
      const result = await geocodeWithNominatim(`${cleanCity}, ${cleanCountry}`);
      if (result) {
        console.log('Geocoded using city + country');
        return result;
      }
    }
    
    if (cleanState && cleanCountry) {
      const result = await geocodeWithNominatim(`${cleanState}, ${cleanCountry}`);
      if (result) {
        console.log('Geocoded using state + country');
        return result;
      }
    }
    
    if (cleanCountry) {
      const result = await geocodeWithNominatim(cleanCountry);
      if (result) {
        console.log('Geocoded using country only');
        return result;
      }
    }
    
    console.error('Failed to geocode online service - no valid location data');
    return null;
  }
  
  // Validate we have at least country for physical addresses
  if (!cleanCountry) {
    console.error('Geocoding requires at least country');
    return null;
  }
  
  // Build address string, filtering out empty values
  const addressParts = [
    cleanAddress,
    cleanCity,
    cleanState,
    cleanZipCode,
    cleanCountry
  ].filter(part => part !== '');
  
  const fullAddress = addressParts.join(', ');
  
  // Check cache first
  if (geocodeCache.has(fullAddress)) {
    return geocodeCache.get(fullAddress);
  }
  
  // Debug logging
  console.log('Geocoding address:', {
    input: { address: cleanAddress, city: cleanCity, state: cleanState, zipCode: cleanZipCode, country: cleanCountry },
    fullAddress,
    partsCount: addressParts.length
  });
  
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
        
        // Fallback 1: If detailed address fails, try without suite/building numbers
        if (!result && (cleanAddress.includes('STE') || cleanAddress.includes('Suite') || 
                       cleanAddress.includes('Bldg') || cleanAddress.includes('Building') ||
                       cleanAddress.includes('#'))) {
          console.log('Trying fallback without suite/building number...');
          
          const simplifiedAddress = cleanAddress
            .replace(/,?\s*(STE|Suite|Ste|SUITE)\s*[A-Z0-9]+/gi, '')
            .replace(/,?\s*(Bldg|Building|BLDG)\.?\s*[A-Z0-9]+/gi, '')
            .replace(/,?\s*#\s*[A-Z0-9]+/gi, '')
            .trim();
          
          const fallbackParts = [
            simplifiedAddress,
            cleanCity,
            cleanState,
            cleanZipCode,
            cleanCountry
          ].filter(part => part !== '');
          
          const fallbackAddress = fallbackParts.join(', ');
          console.log('Fallback address:', fallbackAddress);
          
          result = await geocodeWithNominatim(fallbackAddress);
        }
        
        // Fallback 2: Try with just city, state, zipCode, country
        if (!result && cleanCity) {
          console.log('Trying fallback with city + state + zipCode...');
          const cityFallback = [cleanCity, cleanState, cleanZipCode, cleanCountry]
            .filter(part => part !== '')
            .join(', ');
          console.log('City fallback:', cityFallback);
          result = await geocodeWithNominatim(cityFallback);
        }
        
        // Fallback 3: Try with just zipCode + country
        if (!result && cleanZipCode) {
          console.log('Trying fallback with zipCode + country...');
          result = await geocodeWithNominatim(`${cleanZipCode}, ${cleanCountry}`);
        }
        
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
