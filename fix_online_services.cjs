const fs = require('fs');

let content = fs.readFileSync('src/lib/geocoding.js', 'utf8');

// Replace the validation section to handle online/virtual addresses
content = content.replace(
  /\/\/ Validate we have at least address and country\s+if \(!cleanAddress \|\| !cleanCountry\) \{[\s\S]*?return null;\s+\}/,
  `// Handle online/virtual services - use location hierarchy
  const isOnlineService = !cleanAddress || 
                         cleanAddress.toLowerCase() === 'online' || 
                         cleanAddress.toLowerCase() === 'virtual' ||
                         cleanAddress.toLowerCase() === 'n/a';
  
  // For online services, build address from available location data
  // Priority: zipCode > city > state > country
  if (isOnlineService) {
    const locationParts = [cleanZipCode, cleanCity, cleanState, cleanCountry]
      .filter(part => part !== '');
    
    if (locationParts.length === 0) {
      console.error('Geocoding requires at least country for online services');
      return null;
    }
    
    const locationAddress = locationParts.join(', ');
    console.log('Online service detected, geocoding to general location:', locationAddress);
    
    // Try to geocode the general location
    try {
      const result = await geocodeWithNominatim(locationAddress);
      if (result) {
        return result;
      }
    } catch (error) {
      console.error('Failed to geocode online service location:', error);
    }
    
    // Fallback to country center if geocoding fails
    const countryCenter = COUNTRY_CENTERS[cleanCountry.toUpperCase()] || COUNTRY_CENTERS['DEFAULT'];
    console.log('Using country center for online service:', countryCenter);
    return countryCenter;
  }
  
  // For physical addresses, require at least address and country
  if (!cleanAddress || !cleanCountry) {
    console.error('Geocoding requires at least address and country for physical locations');
    return null;
  }`
);

// Add COUNTRY_CENTERS constant at the top of the file after imports
content = content.replace(
  /const NOMINATIM_BASE_URL = 'https:\/\/nominatim\.openstreetmap\.org';/,
  `const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Country center coordinates for online services
const COUNTRY_CENTERS = {
  'US': { lat: 39.8283, lng: -98.5795 },
  'IN': { lat: 20.5937, lng: 78.9629 },
  'GB': { lat: 55.3781, lng: -3.4360 },
  'CA': { lat: 56.1304, lng: -106.3468 },
  'AU': { lat: -25.2744, lng: 133.7751 },
  'DEFAULT': { lat: 0, lng: 0 }
};`
);

fs.writeFileSync('src/lib/geocoding.js', content, 'utf8');

console.log(' Added online/virtual service support');
console.log(' Fallback hierarchy: zipcode > city > state > country');
console.log(' Only country is mandatory now');
