# Handling Online Services in Care Resources

## Overview
For care resources that are online-only (no physical address), we support special handling to allow them to be added to the system.

## Current Implementation Status

### ✅ Completed
1. **Country center coordinates added** - COUNTRY_CENTERS constant with default coordinates for major countries
2. **Lat/lng columns populated** - Resources now store lat and lng separately for easier querying
3. **Optional address fields** - City, state, and zip_code are now optional

### 🚧 Pending Implementation
The following logic needs to be added to `src/services/bulkUploadService.js`:

```javascript
// After line 67 (validateRow call), replace the geocoding section with:

// Check if this is an online service
const isOnline = row.address.trim().toLowerCase() === 'online' || 
                 row.address.trim().toLowerCase() === 'virtual';

let coordinates;
if (isOnline) {
  // Use country center for online services
  const countryCode = row.country.toUpperCase().trim();
  coordinates = COUNTRY_CENTERS[countryCode] || COUNTRY_CENTERS['DEFAULT'];
} else {
  // Geocode physical address
  coordinates = await geocodeAddress({
    address: row.address,
    city: row.city,
    state: row.state,
    zipCode: row.zip_code,
    country: row.country
  });
  
  if (!coordinates) {
    throw new Error('Failed to geocode address. Please verify the address is correct.');
  }
}

// After line 75 (tags parsing), add:

// Add 'online' tag for online services
if (isOnline && !tags.includes('online')) {
  tags.push('online');
}
```

## How to Use

### For CSV/Excel Upload:
1. Set the `address` field to "Online" or "Virtual"
2. Provide the `country` code (US, IN, GB, etc.)
3. Other address fields (city, state, zip_code) can be left empty
4. The system will:
   - Use the country's center coordinates
   - Automatically add "online" tag
   - Display the resource on the map at the country center

### Example CSV Row:
```csv
milestone,name,address,city,state,zip_code,country,phone,email,website,tags
diagnosis,Online Autism Assessment,Online,,,, US,555-1234,contact@example.com,https://example.com,assessment
```

## Benefits
- Online services are visible on the map (at country center)
- Easy to filter using the "online" tag
- No geocoding API calls needed for online services
- Consistent handling across all online resources

## Future Enhancements
1. Add a dedicated `is_online` boolean column to the database
2. Create a filter toggle for "Online Services Only"
3. Display online services with a special icon on the map
4. Allow users to filter by "In-person" vs "Online" vs "Both"

## Testing
To test online service handling:
1. Create a CSV with address = "Online"
2. Upload via admin panel
3. Verify resource appears at country center on map
4. Verify "online" tag is automatically added
5. Test filtering by "online" tag

