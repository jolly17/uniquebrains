# Remaining Tasks for Care Roadmap

## Priority Tasks for Tomorrow

### 1. Map Search/Movement Filtering
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

### 2. Sort by Distance Functionality
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

### 3. Write Review Button Functionality
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

## Additional Improvements (Lower Priority)

### 4. Map Clustering Performance
- Optimize marker clustering for large datasets
- Add custom cluster icons with resource count
- Implement cluster click to zoom

### 5. Resource Card Enhancements
- Add "Save" or "Favorite" functionality
- Show distance on cards when location is available
- Add "Get Directions" button

### 6. Search Improvements
- Add search suggestions/autocomplete
- Highlight search terms in results
- Add recent searches

### 7. Mobile Responsiveness
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
