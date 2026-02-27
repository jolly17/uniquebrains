const fs = require('fs');

let content = fs.readFileSync('src/lib/geocoding.js', 'utf8');

// Add console logging to see what address is being geocoded
content = content.replace(
  /const fullAddress = addressParts\.join\(', '\);/,
  `const fullAddress = addressParts.join(', ');
  
  // Debug logging
  console.log('Geocoding address:', {
    input: { address, city, state, zipCode, country },
    fullAddress,
    partsCount: addressParts.length
  });`
);

// Also add error logging in geocodeWithNominatim
content = content.replace(
  /if \(data\.length === 0\) \{\s+return null;\s+\}/,
  `if (data.length === 0) {
    console.error('Nominatim returned no results for:', address);
    return null;
  }`
);

fs.writeFileSync('src/lib/geocoding.js', content, 'utf8');

console.log('✓ Added debug logging to geocoding function');
console.log('✓ Will now log address components and geocoding results');
