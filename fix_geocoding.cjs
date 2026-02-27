const fs = require('fs');

let content = fs.readFileSync('src/lib/geocoding.js', 'utf8');

// Replace the geocodeAddress function to handle missing fields properly
content = content.replace(
  /export async function geocodeAddress\(\{ address, city, state, zipCode, country \}\) \{[\s\S]*?const fullAddress = `\$\{address\}, \$\{city\}, \$\{state\} \$\{zipCode\}, \$\{country\}`;/,
  `export async function geocodeAddress({ address, city, state, zipCode, country }) {
  // Build address string, filtering out empty/undefined values
  const addressParts = [
    address,
    city,
    state,
    zipCode,
    country
  ].filter(part => part && part.trim() !== '');
  
  const fullAddress = addressParts.join(', ');
  
  // Validate we have at least address and country
  if (!address || !country) {
    console.error('Geocoding requires at least address and country');
    return null;
  }`
);

fs.writeFileSync('src/lib/geocoding.js', content, 'utf8');

console.log('✓ Fixed geocoding to handle missing address fields properly');
console.log('✓ Now filters out undefined/empty values before building address string');
