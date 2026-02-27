const fs = require('fs');

let content = fs.readFileSync('src/lib/geocoding.js', 'utf8');

// Replace the entire geocodeAddress function with fallback logic
content = content.replace(
  /export async function geocodeAddress\(\{ address, city, state, zipCode, country \}\) \{[\s\S]*?return result;\s+\} catch \(error\) \{[\s\S]*?return null;\s+\}\s+\}/,
  `export async function geocodeAddress({ address, city, state, zipCode, country }) {
  // Clean address parts - remove newlines and extra spaces
  const cleanPart = (part) => part ? part.replace(/\\s+/g, ' ').trim() : '';
  
  const cleanAddress = cleanPart(address);
  const cleanCity = cleanPart(city);
  const cleanState = cleanPart(state);
  const cleanZipCode = cleanPart(zipCode);
  const cleanCountry = cleanPart(country);
  
  // Build address string, filtering out empty values
  const addressParts = [
    cleanAddress,
    cleanCity,
    cleanState,
    cleanZipCode,
    cleanCountry
  ].filter(part => part !== '');
  
  const fullAddress = addressParts.join(', ');
  
  // Validate we have at least address and country
  if (!cleanAddress || !cleanCountry) {
    console.error('Geocoding requires at least address and country');
    return null;
  }
  
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
        
        // Fallback: If detailed address fails, try without suite/building numbers
        if (!result && (cleanAddress.includes('STE') || cleanAddress.includes('Suite') || 
                       cleanAddress.includes('Bldg') || cleanAddress.includes('Building') ||
                       cleanAddress.includes('#'))) {
          console.log('Trying fallback without suite/building number...');
          
          // Remove suite/building numbers
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

console.log(' Fixed geocoding with fallback strategy');
