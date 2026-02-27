const fs = require('fs');

let content = fs.readFileSync('src/lib/geocoding.js', 'utf8');

// Replace the geocodeAddress function with online service handling and cascading fallback
content = content.replace(
  /export async function geocodeAddress\(\{ address, city, state, zipCode, country \}\) \{[\s\S]*?return null;\s+\}\s+\}/,
  `export async function geocodeAddress({ address, city, state, zipCode, country }) {
  // Clean address parts - remove newlines and extra spaces
  const cleanPart = (part) => part ? part.replace(/\\s+/g, ' ').trim() : '';
  
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
      const result = await geocodeWithNominatim(`\, \`);
      if (result) {
        console.log('Geocoded using zipCode + country');
        return result;
      }
    }
    
    if (cleanCity && cleanCountry) {
      const result = await geocodeWithNominatim(`\, \`);
      if (result) {
        console.log('Geocoded using city + country');
        return result;
      }
    }
    
    if (cleanState && cleanCountry) {
      const result = await geocodeWithNominatim(`\, \`);
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
            .replace(/,?\\s*(STE|Suite|Ste|SUITE)\\s*[A-Z0-9]+/gi, '')
            .replace(/,?\\s*(Bldg|Building|BLDG)\\.?\\s*[A-Z0-9]+/gi, '')
            .replace(/,?\\s*#\\s*[A-Z0-9]+/gi, '')
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
          result = await geocodeWithNominatim(`\, \`);
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
}`
);

fs.writeFileSync('src/lib/geocoding.js', content, 'utf8');

console.log(' Enhanced geocoding with comprehensive fallback strategy:');
console.log('  - Detects online/virtual services (address: online, virtual, n/a, or empty)');
console.log('  - Online services: zipCode -> city -> state -> country');
console.log('  - Physical addresses: full -> no suite -> city -> zipCode');
console.log('  - Only country is mandatory');
