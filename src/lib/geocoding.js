// Geocoding service for converting addresses to coordinates
// Supports multiple providers: Nominatim (default, free), Google, Mapbox

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const GEOCODING_SERVICE = import.meta.env.VITE_GEOCODING_SERVICE || 'nominatim';
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_GEOCODING_API_KEY;
const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY;

// Cache for geocoding results to avoid duplicate API calls
const geocodeCache = new Map();

/**
 * Clean and normalize an address string for geocoding.
 * Strips business names, landmarks, floor info, special characters, and other
 * noise that confuses geocoding APIs (especially Nominatim/OpenStreetMap).
 * 
 * @param {string} raw - Raw address string
 * @returns {string} - Cleaned address
 */
export function cleanAddressForGeocoding(raw) {
  if (!raw) return '';
  
  let addr = raw;
  
  // Remove distance info like "(1,737.93 km)"
  addr = addr.replace(/\([\d,]+\.?\d*\s*km\)/gi, '');
  
  // Remove plus codes like "WF2W+2VM" or "3JVJ+CQ6"
  addr = addr.replace(/\b[A-Z0-9]{4}\+[A-Z0-9]{2,3}\b,?\s*/gi, '');
  
  // Remove everything before " - " (business name prefix), e.g.
  // "RUDH Hearing and Speech Clinic - Aanand Tower, No54, ..."
  // But only if the part BEFORE the dash looks like a business/org name (not an address part)
  // and the part AFTER the dash looks like an address.
  if (addr.includes(' - ')) {
    const parts = addr.split(' - ');
    const beforeDash = parts[0].trim();
    const afterDash = parts.slice(1).join(' - ').trim();
    
    // Only split if: before-dash doesn't look like an address (no road/area keywords or pincode)
    // and after-dash looks like an address
    const beforeLooksLikeAddress = /(\bRd\b|\bRoad\b|\bMain\b|\bCross\b|\bLayout\b|\bNagar\b|\bStreet\b|\bBlock\b|\bPhase\b|\bSector\b|\b\d{6}\b)/i.test(beforeDash);
    const afterLooksLikeAddress = afterDash && /(\d|Rd|Road|Main|Cross|Layout|Nagar|Street|St|Block|Phase|Sector)/i.test(afterDash);
    
    // Also check that after-dash has enough content (more than just a pincode)
    const afterHasSubstance = afterDash.length > 10;
    
    if (!beforeLooksLikeAddress && afterLooksLikeAddress && afterHasSubstance) {
      addr = afterDash;
    }
  }
  
  // Remove everything before ": " (business name prefix with colon), e.g.
  // "Aruna Chetana (Malleswaram) Bengaluru : 14th A Cross Road, ..."
  if (addr.includes(': ')) {
    const afterColon = addr.split(': ').slice(1).join(': ').trim();
    if (afterColon && /(\d|Rd|Road|Main|Cross|Layout|Nagar|Street|St|Block|Phase|Sector)/i.test(afterColon)) {
      addr = afterColon;
    }
  }
  
  // Remove business/organization name at the start followed by a hyphen-separated address part.
  // This handles "Navrang Speech & Hearing Clinic-Shop No 8, ..." by splitting on the hyphen.
  // Only remove if followed by content that looks like an address (has numbers or road keywords).
  const businessNamePattern = /^([A-Za-z\s&.'()]+(?:Clinic|Hospital|Centre|Center|School|Foundation|Trust|Academy|Institute|Therapy|Services|Pvt\s*Ltd))\s*[-–]\s*/i;
  const businessMatch = addr.match(businessNamePattern);
  if (businessMatch) {
    const afterBusiness = addr.slice(businessMatch[0].length);
    if (afterBusiness && /(\d|Rd|Road|Main|Cross|Layout|Nagar|Street|St|Block|Phase|Sector)/i.test(afterBusiness)) {
      addr = afterBusiness;
    }
  }
  
  // Remove parenthetical content like "(Opposite Brand Factory,Next Big Bazar)"
  // but preserve parenthetical content that looks like area names with pincodes
  addr = addr.replace(/\([^)]*(?:opposite|behind|near|next to|opp\.?|above|below)[^)]*\)/gi, '');
  // Remove other parenthetical content that doesn't contain pincode-like numbers
  addr = addr.replace(/\((?![^)]*\d{6})[^)]*\)/g, '');
  
  // Remove landmark/directional phrases
  addr = addr.replace(/,?\s*(?:opposite\s+to|opposite|opp\.?\s+to|opp\.?)\s+[^,]*/gi, '');
  addr = addr.replace(/,?\s*(?:near\s+to|near)\s+[^,]*/gi, '');
  addr = addr.replace(/,?\s*(?:next\s+to)\s+[^,]*/gi, '');
  addr = addr.replace(/,?\s*(?:behind|above|below|beside|adjacent\s+to)\s+[^,]*/gi, '');
  addr = addr.replace(/,?\s*(?:in\s+front\s+of)\s+[^,]*/gi, '');
  
  // Remove floor/building info
  addr = addr.replace(/,?\s*\d+(?:st|nd|rd|th)\s+(?:floor|flr)\b/gi, '');
  addr = addr.replace(/,?\s*(?:ground\s+floor|first\s+floor|second\s+floor|third\s+floor|fourth\s+floor|basement)\b/gi, '');
  addr = addr.replace(/,?\s*(?:1st|2nd|3rd|4th|5th)\s+floor\b/gi, '');
  
  // Remove suite/shop/flat/unit numbers
  addr = addr.replace(/,?\s*(?:Suite|STE|Ste|SUITE)\s*(?:no\.?\s*)?[A-Z0-9-]+/gi, '');
  addr = addr.replace(/,?\s*(?:Shop|Flat|Unit|Room)\s*(?:No\.?\s*)?[A-Z0-9-]+/gi, '');
  
  // Remove "Pincode -" or "Pin -" prefix before zip codes
  addr = addr.replace(/,?\s*(?:Pincode|Pin)\s*[-–:]\s*/gi, ', ');
  
  // Remove special dash characters (en-dash, em-dash) and replace with regular dash
  addr = addr.replace(/[–—]/g, '-');
  
  // Remove "#" prefix from building numbers but keep the number
  addr = addr.replace(/#\s*/g, '');
  
  // Remove double quotes
  addr = addr.replace(/"/g, '');
  
  // Remove "India" at the end (country is passed separately)
  addr = addr.replace(/,?\s*India\.?\s*$/i, '');
  
  // Remove trailing period
  addr = addr.replace(/\.\s*$/, '');
  
  // Remove "Karnātaka" (with diacritics) and normalize to "Karnataka"
  addr = addr.replace(/Karn[āa]taka/gi, 'Karnataka');
  
  // Clean up multiple commas (with optional whitespace between), leading/trailing commas, extra spaces
  // Repeatedly collapse ", ," or ",," patterns until stable
  let prevAddr;
  do {
    prevAddr = addr;
    addr = addr.replace(/,\s*,/g, ',');
  } while (addr !== prevAddr);
  addr = addr.replace(/^\s*,\s*/, '');
  addr = addr.replace(/\s*,\s*$/, '');
  addr = addr.replace(/\s+/g, ' ');
  addr = addr.trim();
  
  return addr;
}

/**
 * Extract city, state, and pincode from a full address string.
 * Useful when the address field contains the complete address including
 * city, state, and pincode (common in Indian addresses).
 * 
 * @param {string} address - Full address string
 * @returns {Object} - { city, state, zipCode } extracted from address
 */
export function extractAddressComponents(address) {
  const result = { city: '', state: '', zipCode: '' };
  if (!address) return result;
  
  // Extract Indian pincode (6 digits)
  const pincodeMatch = address.match(/\b(\d{6})\b/);
  if (pincodeMatch) {
    result.zipCode = pincodeMatch[1];
  }
  
  // Extract state - common Indian states
  const statePatterns = [
    /\b(Karnataka|Karn[āa]taka)\b/i,
    /\b(Tamil\s*Nadu)\b/i,
    /\b(Kerala)\b/i,
    /\b(Andhra\s*Pradesh)\b/i,
    /\b(Telangana)\b/i,
    /\b(Maharashtra)\b/i,
    /\b(Delhi|New\s*Delhi)\b/i,
    /\b(Uttar\s*Pradesh)\b/i,
    /\b(West\s*Bengal)\b/i,
    /\b(Gujarat)\b/i,
    /\b(Rajasthan)\b/i,
    /\b(Madhya\s*Pradesh)\b/i,
    /\b(Punjab)\b/i,
    /\b(Haryana)\b/i,
    /\b(Bihar)\b/i,
    /\b(Odisha|Orissa)\b/i,
    /\b(Goa)\b/i,
  ];
  
  for (const pattern of statePatterns) {
    const match = address.match(pattern);
    if (match) {
      result.state = match[1].replace(/[āa]/gi, 'a');
      break;
    }
  }
  
  // Extract city - common Indian cities
  const cityPatterns = [
    /\b(Bengaluru|Bangalore|Bangaluru|Bangalor)\b/i,
    /\b(Mumbai|Bombay)\b/i,
    /\b(Chennai|Madras)\b/i,
    /\b(Hyderabad)\b/i,
    /\b(Pune|Poona)\b/i,
    /\b(Kolkata|Calcutta)\b/i,
    /\b(Delhi|New\s*Delhi)\b/i,
    /\b(Ahmedabad)\b/i,
    /\b(Jaipur)\b/i,
    /\b(Lucknow)\b/i,
    /\b(Kochi|Cochin)\b/i,
    /\b(Thiruvananthapuram|Trivandrum)\b/i,
    /\b(Coimbatore)\b/i,
    /\b(Mysuru|Mysore)\b/i,
  ];
  
  for (const pattern of cityPatterns) {
    const match = address.match(pattern);
    if (match) {
      // Normalize city names
      const cityName = match[1].toLowerCase();
      if (['bangalore', 'bangaluru', 'bangalor'].includes(cityName)) {
        result.city = 'Bengaluru';
      } else if (['bombay'].includes(cityName)) {
        result.city = 'Mumbai';
      } else if (['madras'].includes(cityName)) {
        result.city = 'Chennai';
      } else if (['calcutta'].includes(cityName)) {
        result.city = 'Kolkata';
      } else if (['cochin'].includes(cityName)) {
        result.city = 'Kochi';
      } else if (['trivandrum'].includes(cityName)) {
        result.city = 'Thiruvananthapuram';
      } else if (['poona'].includes(cityName)) {
        result.city = 'Pune';
      } else if (['mysore'].includes(cityName)) {
        result.city = 'Mysuru';
      } else {
        result.city = match[1];
      }
      break;
    }
  }
  
  return result;
}

/**
 * Build progressively simpler address variants for fallback geocoding.
 * Returns an array of address strings from most specific to least specific.
 * 
 * @param {string} cleanedAddress - Already cleaned address string
 * @param {string} city - City name
 * @param {string} state - State/province
 * @param {string} zipCode - Postal/zip code
 * @param {string} country - Country code
 * @returns {string[]} - Array of address variants to try
 */
function buildAddressVariants(cleanedAddress, city, state, zipCode, country) {
  const variants = [];
  
  // Variant 1: Full cleaned address
  const fullParts = [cleanedAddress, city, state, zipCode, country].filter(Boolean);
  if (fullParts.length > 0) {
    variants.push(fullParts.join(', '));
  }
  
  // Variant 2: Remove the first segment (often a building/complex name)
  // e.g., "Aanand Tower, No54, Bowring Hospital Rd, Bengaluru, Karnataka 560001"
  // becomes "No54, Bowring Hospital Rd, Bengaluru, Karnataka 560001"
  if (cleanedAddress) {
    const segments = cleanedAddress.split(',').map(s => s.trim()).filter(Boolean);
    if (segments.length > 2) {
      const withoutFirst = segments.slice(1).join(', ');
      const parts = [withoutFirst, city, state, zipCode, country].filter(Boolean);
      variants.push(parts.join(', '));
    }
  }
  
  // Variant 3: Extract only road/street name + area + city + state + pincode
  if (cleanedAddress) {
    const roadMatch = cleanedAddress.match(
      /(\b\d*\s*(?:[\w\s]+(?:Rd|Road|Main\s*Rd|Main\s*Road|Cross\s*Rd|Cross\s*Road|Street|St|Avenue|Ave|Lane|Ln|Highway|Hwy|Boulevard|Blvd))\b[^,]*)/i
    );
    if (roadMatch) {
      const roadParts = [roadMatch[1].trim(), city, state, zipCode, country].filter(Boolean);
      variants.push(roadParts.join(', '));
    }
  }
  
  // Variant 4: Extract area/locality name + city + state + pincode
  // Look for common Indian locality patterns
  if (cleanedAddress) {
    const areaPatterns = [
      /\b([\w\s]+(?:Layout|Nagar|Colony|Extension|Extn|Puram|Pura|Palya|Halli|Gudi|Pet|Wadi|Bagh|Garden|Park|Block|Phase|Sector|Stage|Ward))\b/i,
      /\b((?:HSR|BTM|HBR|HAL|HRBR|AECS|BEML|NGEF|JP|J\.?\s*P\.?)\s*(?:Layout|Nagar|Stage|Block|Phase|Sector)?(?:\s*\d+(?:st|nd|rd|th)?\s*(?:Stage|Block|Phase|Sector))?)\b/i,
      /\b(Indiranagar|Koramangala|Whitefield|Jayanagar|Basavanagudi|Malleswaram|Malleshwaram|Rajajinagar|Vijayanagar|Banashankari|Yelahanka|Marathahalli|Electronic\s*City|Sarjapur|Bellandur|Domlur)\b/i,
    ];
    
    for (const pattern of areaPatterns) {
      const match = cleanedAddress.match(pattern);
      if (match) {
        const areaParts = [match[1].trim(), city, state, zipCode, country].filter(Boolean);
        const areaVariant = areaParts.join(', ');
        if (!variants.includes(areaVariant)) {
          variants.push(areaVariant);
        }
      }
    }
  }
  
  // Variant 5: Pincode + city + state + country (very reliable for Indian addresses)
  if (zipCode && city) {
    variants.push([city, state, zipCode, country].filter(Boolean).join(', '));
  }
  
  // Variant 6: Just pincode + country
  if (zipCode && country) {
    variants.push(`${zipCode}, ${country}`);
  }
  
  // Variant 7: City + state + country
  if (city && state && country) {
    variants.push(`${city}, ${state}, ${country}`);
  }
  
  // Variant 8: City + country
  if (city && country) {
    variants.push(`${city}, ${country}`);
  }
  
  // Deduplicate
  return [...new Set(variants)];
}

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
  
  let cleanAddress = cleanPart(address);
  let cleanCity = cleanPart(city);
  let cleanState = cleanPart(state);
  let cleanZipCode = cleanPart(zipCode);
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
  
  // If city/state/zipCode are not provided separately, try to extract them from the address
  if (!cleanCity || !cleanState || !cleanZipCode) {
    const extracted = extractAddressComponents(cleanAddress);
    if (!cleanCity && extracted.city) {
      cleanCity = extracted.city;
      console.log('Extracted city from address:', cleanCity);
    }
    if (!cleanState && extracted.state) {
      cleanState = extracted.state;
      console.log('Extracted state from address:', cleanState);
    }
    if (!cleanZipCode && extracted.zipCode) {
      cleanZipCode = extracted.zipCode;
      console.log('Extracted zipCode from address:', cleanZipCode);
    }
  }
  
  // Apply address cleaning/normalization
  const normalizedAddress = cleanAddressForGeocoding(cleanAddress);
  
  // Build the original full address for cache key
  const cacheKey = [cleanAddress, cleanCity, cleanState, cleanZipCode, cleanCountry]
    .filter(part => part !== '')
    .join(', ');
  
  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey);
  }
  
  // Debug logging
  console.log('Geocoding address:', {
    original: cleanAddress,
    normalized: normalizedAddress,
    city: cleanCity,
    state: cleanState,
    zipCode: cleanZipCode,
    country: cleanCountry
  });
  
  try {
    let result;
    
    switch (GEOCODING_SERVICE) {
      case 'google':
        result = await geocodeWithGoogle(
          [normalizedAddress, cleanCity, cleanState, cleanZipCode, cleanCountry]
            .filter(Boolean).join(', ')
        );
        break;
      case 'mapbox':
        result = await geocodeWithMapbox(
          [normalizedAddress, cleanCity, cleanState, cleanZipCode, cleanCountry]
            .filter(Boolean).join(', ')
        );
        break;
      case 'nominatim':
      default: {
        // Build progressive fallback variants
        const variants = buildAddressVariants(
          normalizedAddress, cleanCity, cleanState, cleanZipCode, cleanCountry
        );
        
        console.log(`Trying ${variants.length} address variants for geocoding...`);
        
        // Try Nominatim structured search first (most reliable for complex addresses)
        if (normalizedAddress && cleanCity && cleanCountry) {
          console.log('Trying Nominatim structured search...');
          result = await geocodeWithNominatimStructured({
            street: normalizedAddress.split(',')[0]?.trim(),
            city: cleanCity,
            state: cleanState,
            postalcode: cleanZipCode,
            country: cleanCountry
          });
          if (result) {
            console.log('Structured search succeeded');
          }
        }
        
        // Try each variant progressively
        for (let i = 0; i < variants.length && !result; i++) {
          console.log(`Trying variant ${i + 1}/${variants.length}: "${variants[i]}"`);
          result = await geocodeWithNominatim(variants[i]);
          if (result) {
            console.log(`Variant ${i + 1} succeeded`);
          }
        }
        
        break;
      }
    }
    
    // Cache the result
    if (result) {
      geocodeCache.set(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

/**
 * Geocode using Nominatim (OpenStreetMap) free-text search
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
 * Geocode using Nominatim structured search (separate address components).
 * This is more reliable than free-text search for complex/noisy addresses
 * because Nominatim can match each component independently.
 * 
 * @param {Object} components - Address components
 * @param {string} components.street - Street address
 * @param {string} components.city - City name
 * @param {string} components.state - State/province
 * @param {string} components.postalcode - Postal code
 * @param {string} components.country - Country code
 * @returns {Promise<Object|null>} - {lat, lng} or null
 */
async function geocodeWithNominatimStructured({ street, city, state, postalcode, country }) {
  const params = new URLSearchParams({
    format: 'json',
    limit: 1,
    addressdetails: 1
  });
  
  // Only add non-empty components
  if (street) params.set('street', street);
  if (city) params.set('city', city);
  if (state) params.set('state', state);
  if (postalcode) params.set('postalcode', postalcode);
  if (country) params.set('countrycodes', country.toLowerCase());
  
  const response = await fetch(`${NOMINATIM_BASE_URL}/search?${params}`, {
    headers: {
      'User-Agent': 'UniqueBrains Care Roadmap (contact@uniquebrains.com)'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Nominatim structured search failed: ${response.status}`);
  }
  
  const data = await response.json();
  
  if (data.length === 0) {
    console.log('Nominatim structured search returned no results for:', { street, city, state, postalcode, country });
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
