# Remaining Tasks for Care Roadmap

## Priority Tasks for Tomorrow

### 1. Mobile Map Height Fix
**Status:** Not Started  
**Description:** On mobile, the map height is currently square (same as screen width). Increase the map height to provide better visibility and usability on mobile devices.

**Implementation:**
- Update `.map-container` height in mobile media query (currently 500px)
- Consider making it taller (e.g., 600-700px) or using viewport height (e.g., 60vh)
- Test on various mobile screen sizes
- Ensure map controls remain accessible

**Files to modify:**
- `src/pages/MilestonePage.css` - @media (max-width: 768px) section
- `src/components/InteractiveMap.css` - mobile media queries if needed

---

### 2. Map Search/Movement Filtering
**Status:** Not Started  
**Description:** When user moves the map or searches for a location, update the resource listings to show only resources visible in the current map bounds.

**Implementation:**
- Update `handleMapMove` in MilestonePage to fetch resources based on map bounds
- Add `getResourcesInBounds` function call when map moves
- Debounce map movement to avoid excessive API calls (500ms delay)
- Show loading indicator when fetching new resources
- Update URL parameters to include map bounds for shareable links

**Files to modify:**
- `src/pages/MilestonePage.jsx` - handleMapMove function
- `src/services/careResourceService.js` - already has getResourcesInBounds function

---

### 3. Sort by Distance Functionality
**Status:** Partially Working  
**Description:** The "Sort by Distance" option should calculate and display distance from user's current location or searched location.

**Current Issue:**
- Distance is only calculated when location is provided to fetchResources
- Need to track user's current/searched location separately
- Distance should persist across filtering operations

**Implementation:**
- Add `userLocation` state to MilestonePage
- Set userLocation when user searches or uses "Use My Location"
- Pass userLocation to ResourceListings
- Calculate distances in ResourceListings when sorting by distance
- Display distance on resource cards when available

**Files to modify:**
- `src/pages/MilestonePage.jsx` - add userLocation state
- `src/components/ResourceListings.jsx` - calculate distances for sorting
- `src/components/ResourceCard.jsx` - display distance if available

---

### 4. Write Review Button Functionality (Status: Completed)
**Status:** Not Started  
**Description:** Implement the "Write a Review" button on the resource detail page.

**Implementation Options:**

**Option A: Simple Modal (Quick Implementation)**
- Create ReviewModal component
- Form fields: rating (1-5 stars), review text, reviewer name
- Submit review to database (care_reviews table)
- Show success message
- Refresh reviews list

**Option B: Full Review System (Complete Implementation)**
- Create care_reviews table in database
- Add authentication requirement (must be logged in)
- Create ReviewForm component with validation
- Implement review submission API
- Add review moderation (admin approval)
- Display user's own reviews differently
- Add edit/delete for user's own reviews

**Recommended:** Start with Option A for MVP, upgrade to Option B later

**Files to create:**
- `src/components/ReviewModal.jsx`
- `src/components/ReviewModal.css`
- Database migration for care_reviews table (if implementing Option B)

**Files to modify:**
- `src/pages/ResourceDetailPage.jsx` - add modal state and handler

---

### 5. Test Admin Panel for Resource Upload $([char]13)$([char]10)**Status:** Completed  
**Description:** Test the admin panel functionality for uploading and managing care resources. Ensure the admin interface works correctly for adding new resources to the database.

**Testing Checklist:**
- [x] Access admin panel (verify authentication/authorization)
- [x] Test adding a new care resource with all fields
- [x] Verify geocoding works for address input
- [x] Test uploading resources via CSV (if available)
- [x] Verify resources appear on the map immediately after adding
- [x] Test editing existing resources
- [x] Test deleting resources
- [x] Verify validation for required fields
- [x] Test with invalid data (missing fields, invalid coordinates)
- [x] Check that lat/lng columns are populated correctly

**Files to review:**
- `src/pages/admin/AdminCareResources.jsx` - Admin interface for care resources
- `src/pages/admin/AdminDashboard.jsx` - Main admin dashboard
- Check if CSV upload functionality exists

**Potential Issues to Watch For:**
- Geocoding API limits or failures
- Missing lat/lng population when adding resources
- Permission issues for non-admin users
- Validation errors not displaying properly

---

## Additional Improvements (Lower Priority)

### 6. Map Clustering Performance
- Optimize marker clustering for large datasets
- Add custom cluster icons with resource count
- Implement cluster click to zoom

### 7. Resource Card Enhancements
- Add "Save" or "Favorite" functionality
- Show distance on cards when location is available
- Add "Get Directions" button

### 8. Search Improvements
- Add search suggestions/autocomplete
- Highlight search terms in results
- Add recent searches

### 9. Mobile Responsiveness
- Test and optimize for mobile devices
- Improve touch interactions on map
- Optimize layout for small screens

---

## Completed Today ✅

1. ✅ Fixed CSS layout shift issue (renamed main-content to milestone-main-content)
2. ✅ Fixed RPC function type mismatches (added lat/lng columns)
3. ✅ Removed duplicate resources from database
4. ✅ Updated ResourceDetailPage to fetch from database instead of dummy data
5. ✅ Added embedded map to detail page using OpenStreetMap iframe
6. ✅ Removed filter panel from left side
7. ✅ Moved tags dropdown to header next to search
8. ✅ Fixed layout so resources take full width without filter panel
9. ✅ Fixed navigation to detail pages (removed modal, using routing)
10. ✅ All 15 resources now display at correct individual locations on map
11. ✅ Fixed z-index hierarchy: main header (1300) > tags dropdown (1100) > map overlay (1000)

---

## Known Issues

1. **Map bounds filtering not implemented** - Resources don't update when map moves
2. **Distance sorting incomplete** - Need to track user location for distance calculations
3. **Write review button non-functional** - Needs modal/form implementation
4. **No loading state for map movement** - Should show indicator when fetching new resources

---

## Database Schema Notes

### Current Tables:
- `care_resources` - Main resources table with lat/lng columns added
- Columns: id, milestone, name, description, address, city, state, zip_code, country, coordinates (PostGIS), lat, lng, phone, email, website, experience_years, tags, rating, review_count, verified, created_at, updated_at

### Tables Needed:
- `care_reviews` (for review functionality)
  - id, resource_id, user_id, rating, review_text, reviewer_name, created_at, updated_at, approved (boolean)

---

## Testing Checklist

- [ ] Test map movement filtering
- [ ] Test distance sorting with different locations
- [ ] Test review submission and display
- [ ] Test on mobile devices
- [ ] Test with large dataset (100+ resources)
- [ ] Test search with special characters
- [ ] Test tag filtering combinations
- [ ] Test country flag navigation

