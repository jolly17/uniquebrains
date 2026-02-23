# Implementation Plan: Care Roadmap

## Overview

This implementation plan creates an interactive care roadmap feature with eight milestone stages, location-based resource filtering, and interactive maps. The implementation follows a progressive approach: database setup, core components, map integration, resource management, and comprehensive testing.

## Tasks

- [ ] 1. Set up database schema and PostGIS extension
  - Create care_resources table with PostGIS geography type for coordinates
  - Add photo_url and certifications fields to care_resources table
  - Create care_resource_reviews table with rating and comment fields
  - Create indexes for milestone, coordinates (GIST), tags (GIN), and reviews
  - Create PostgreSQL function for radius-based resource queries
  - Create trigger function to automatically update average ratings when reviews change
  - Set up RLS policies for public read access and admin write access
  - Create database migration file
  - _Requirements: 6.1, 6.2, 6.3, 6.6, 13.1, 13.2, 13.3_

- [ ] 2. Install dependencies and configure testing framework
  - [ ] 2.1 Install Leaflet and React-Leaflet for map functionality
    - Install: leaflet, react-leaflet, react-leaflet-cluster
    - Add Leaflet CSS import to main entry point
    - _Requirements: 4.1, 4.2_
  
  - [ ] 2.2 Install testing dependencies
    - Install: vitest, @testing-library/react, @testing-library/jest-dom, @testing-library/user-event
    - Install: fast-check for property-based testing
    - Install: @axe-core/react for accessibility testing
    - Configure vitest.config.js with React Testing Library setup
    - _Requirements: All testing requirements_
  
  - [ ] 2.3 Install geocoding dependencies
    - Install: nominatim-client for address search (or use fetch directly)
    - _Requirements: 4.2_

- [ ] 3. Create milestone configuration and data models
  - [ ] 3.1 Create src/data/milestones.js with MILESTONES array
    - Define all 8 milestones with id, title, description, icon, path, order
    - Export helper functions: getMilestoneByPath, getMilestoneById, getNextMilestone, getPreviousMilestone
    - _Requirements: 2.1, 3.1, 3.4_
  
  - [ ]* 3.2 Write unit tests for milestone helper functions
    - Test getMilestoneByPath returns correct milestone
    - Test getMilestoneById returns correct milestone
    - Test getNextMilestone returns next in sequence
    - Test getPreviousMilestone returns previous in sequence
    - Test edge cases: first/last milestone navigation
    - _Requirements: 8.2, 8.3_

- [ ] 4. Create care resource service layer
  - [ ] 4.1 Create src/services/careResourceService.js
    - Implement getResourcesByMilestoneAndLocation with PostGIS query
    - Implement createCareResource (admin only) with automatic geocoding
    - Implement updateCareResource (admin only)
    - Implement deleteCareResource (admin only)
    - Implement geocodeAddress using Nominatim API
    - Implement getResourceReviews to fetch reviews with user names
    - Implement submitReview to create or update user reviews
    - Implement getUserReview to fetch user's existing review
    - Transform PostGIS coordinates to/from {lat, lng} format
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 6.6, 13.1, 13.2, 13.4, 13.5_
  
  - [ ]* 4.2 Write property test for resource query parameters
    - **Property 9: Resource Query Parameters**
    - **Validates: Requirements 6.1**
    - Generate random milestone and location combinations
    - Verify query includes milestone type and geographic parameters
    - Tag: `Feature: care-roadmap, Property 9: Resource Query Parameters`
  
  - [ ]* 4.3 Write property test for resource data structure
    - **Property 10: Resource Data Structure**
    - **Validates: Requirements 6.2**
    - Generate random resource objects
    - Verify all required fields present: milestone, name, address, coordinates, description
    - Tag: `Feature: care-roadmap, Property 10: Resource Data Structure`
  
  - [ ]* 4.4 Write property test for multiple resources support
    - **Property 11: Multiple Resources Support**
    - **Validates: Requirements 6.3**
    - Generate random sets of resources for same milestone/location
    - Verify all resources stored and retrieved without loss
    - Tag: `Feature: care-roadmap, Property 11: Multiple Resources Support`
  
  - [ ]* 4.5 Write property test for resource update consistency
    - **Property 12: Resource Update Consistency**
    - **Validates: Requirements 6.4**
    - Generate random resource updates
    - Verify updated data returned on next query
    - Tag: `Feature: care-roadmap, Property 12: Resource Update Consistency`
  
  - [ ]* 4.6 Write property test for database error handling
    - **Property 13: Database Error Handling**
    - **Validates: Requirements 6.5**
    - Generate random database error scenarios
    - Verify error caught and appropriate message displayed
    - Tag: `Feature: care-roadmap, Property 13: Database Error Handling`
  
  - [ ]* 4.7 Write unit tests for service error handling
    - Test network errors display appropriate messages
    - Test invalid coordinates return 400 error
    - Test unauthorized access returns 401/403
    - _Requirements: 6.5_
  
  - [ ]* 4.8 Write property test for address geocoding
    - **Property 33: Address Geocoding**
    - **Validates: Requirements 6.6**
    - Generate random valid addresses
    - Verify coordinates are populated after resource creation
    - Tag: `Feature: care-roadmap, Property 33: Address Geocoding`
  
  - [ ]* 4.9 Write property test for rating storage
    - **Property 25: Rating Storage**
    - **Validates: Requirements 13.1**
    - Generate random ratings (1-5) and user/resource combinations
    - Verify rating, user ID, and resource ID stored correctly
    - Tag: `Feature: care-roadmap, Property 25: Rating Storage`
  
  - [ ]* 4.10 Write property test for review storage
    - **Property 26: Review Storage**
    - **Validates: Requirements 13.2**
    - Generate random reviews with text, rating, user, and resource
    - Verify all fields stored with timestamp
    - Tag: `Feature: care-roadmap, Property 26: Review Storage`
  
  - [ ]* 4.11 Write property test for rating update not duplicate
    - **Property 27: Rating Update Not Duplicate**
    - **Validates: Requirements 13.4, 13.6**
    - Generate user/resource pair, submit rating twice
    - Verify only one record exists and it's updated
    - Tag: `Feature: care-roadmap, Property 27: Rating Update Not Duplicate`
  
  - [ ]* 4.12 Write property test for review update not duplicate
    - **Property 28: Review Update Not Duplicate**
    - **Validates: Requirements 13.5, 13.6**
    - Generate user/resource pair, submit review twice
    - Verify only one record exists and it's updated
    - Tag: `Feature: care-roadmap, Property 28: Review Update Not Duplicate`

- [ ] 5. Checkpoint - Ensure database and service layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Create CareTimeline landing page component
  - [ ] 6.1 Create src/pages/CareTimeline.jsx
    - Import MILESTONES configuration
    - Render grid of milestone cards (responsive layout)
    - Handle milestone card clicks to navigate to milestone pages
    - Add page title and subtitle
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [ ] 6.2 Create src/pages/CareTimeline.css
    - Style milestone cards with hover effects
    - Implement responsive grid (1 column mobile, 2-3 columns desktop)
    - Add timeline visual indicators
    - Match existing UniqueBrains design system
    - _Requirements: 2.4, 7.1_
  
  - [ ]* 6.3 Write unit test for timeline rendering
    - Test all 8 milestone cards render
    - Test cards display in correct order
    - Test cards have titles and descriptions
    - _Requirements: 2.1_
  
  - [ ]* 6.4 Write property test for milestone cards completeness
    - **Property 2: Milestone Cards Completeness**
    - **Validates: Requirements 2.2**
    - Generate milestone configurations
    - Verify each card has title and description
    - Tag: `Feature: care-roadmap, Property 2: Milestone Cards Completeness`
  
  - [ ]* 6.5 Write property test for milestone navigation routing
    - **Property 3: Milestone Navigation Routing**
    - **Validates: Requirements 2.3**
    - Generate random milestone selections
    - Verify navigation goes to correct path
    - Tag: `Feature: care-roadmap, Property 3: Milestone Navigation Routing`

- [ ] 7. Create LocationSearch component
  - [ ] 7.1 Create src/components/LocationSearch.jsx
    - Implement search input with debouncing (300ms)
    - Integrate Nominatim API for address geocoding
    - Display autocomplete suggestions
    - Add "Use My Location" button with geolocation API
    - Handle geolocation errors with appropriate messages
    - _Requirements: 4.2_
  
  - [ ] 7.2 Create src/components/LocationSearch.css
    - Style search input and suggestions dropdown
    - Style "Use My Location" button
    - Add loading states
    - _Requirements: 4.2_
  
  - [ ]* 7.3 Write unit tests for location search
    - Test search input debouncing
    - Test geolocation success updates location
    - Test geolocation errors display messages
    - Test address search returns suggestions
    - _Requirements: 4.2_

- [ ] 8. Create InteractiveMap component
  - [ ] 8.1 Create src/components/InteractiveMap.jsx
    - Set up Leaflet MapContainer with OpenStreetMap tiles
    - Configure default center (US geographic center) and zoom level
    - Implement map click handler for location selection
    - Display resource markers with clustering
    - Add zoom and pan controls
    - Integrate LocationSearch component
    - Show selected location marker
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ] 8.2 Create src/components/InteractiveMap.css
    - Style map container (height, width)
    - Style custom markers and popups
    - Style location search overlay
    - Add loading skeleton
    - _Requirements: 4.1, 10.5_
  
  - [ ]* 8.3 Write unit test for map rendering
    - Test map renders with default view
    - Test map displays resource markers
    - Test location search integration
    - _Requirements: 4.1_
  
  - [ ]* 8.4 Write property test for location selection updates filter
    - **Property 6: Location Selection Updates Filter**
    - **Validates: Requirements 4.3**
    - Generate random location coordinates
    - Verify filter state updated correctly
    - Tag: `Feature: care-roadmap, Property 6: Location Selection Updates Filter`

- [ ] 9. Create ResourceCard component with business card layout
  - [ ] 9.1 Create src/components/ResourceCard.jsx
    - Implement business card layout with photo on left 1/3
    - Display resource photo or placeholder if no photo
    - Display institute name in large bold text at top right
    - Display address below institute name
    - Display 3 certification badges or placeholders
    - Display contact info at bottom: email, phone (tel: link), website (external link with target="_blank")
    - Display rating below card with star visualization
    - Make entire card clickable to trigger onCardClick callback
    - Show distance from selected location (if available)
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.1_
  
  - [ ] 9.2 Create src/components/ResourceCard.css
    - Style business card layout with photo on left third
    - Style institute name as large bold heading
    - Style certification badges with placeholders
    - Style contact information with icons
    - Style rating display with stars
    - Add hover effects for entire card
    - Make responsive for mobile
    - _Requirements: 11.1, 11.3, 11.5_
  
  - [ ]* 9.3 Write unit tests for resource card rendering
    - Test card displays photo or placeholder
    - Test institute name and address display
    - Test 3 certification badges always render
    - Test contact info displays when available
    - Test rating displays below card
    - _Requirements: 11.2, 11.3, 11.4, 11.5, 11.6, 11.7_
  
  - [ ]* 9.4 Write property test for photo placeholder display
    - **Property 17: Photo Placeholder Display**
    - **Validates: Requirements 11.2, 14.5**
    - Generate resources with and without photo URLs
    - Verify placeholder shown when photoUrl is null/undefined
    - Tag: `Feature: care-roadmap, Property 17: Photo Placeholder Display`
  
  - [ ]* 9.5 Write property test for certification badge count
    - **Property 18: Certification Badge Count**
    - **Validates: Requirements 11.5, 15.1, 15.2**
    - Generate resources with 0, 1, 2, 3, 4+ certifications
    - Verify exactly 3 badge elements always rendered
    - Tag: `Feature: care-roadmap, Property 18: Certification Badge Count`
  
  - [ ]* 9.6 Write property test for phone tel link
    - **Property 19: Phone Number Tel Link**
    - **Validates: Requirements 11.8**
    - Generate resources with phone numbers
    - Verify href starts with "tel:"
    - Tag: `Feature: care-roadmap, Property 19: Phone Number Tel Link`
  
  - [ ]* 9.7 Write property test for website external link
    - **Property 20: Website External Link**
    - **Validates: Requirements 11.9**
    - Generate resources with website URLs
    - Verify target="_blank" and rel="noopener noreferrer"
    - Tag: `Feature: care-roadmap, Property 20: Website External Link`
  
  - [ ]* 9.8 Write property test for card click opens modal
    - **Property 21: Card Click Opens Modal**
    - **Validates: Requirements 12.1**
    - Generate random resources
    - Verify clicking card triggers onCardClick with resource data
    - Tag: `Feature: care-roadmap, Property 21: Card Click Opens Modal`
  
  - [ ]* 9.9 Write property test for certification display limit
    - **Property 32: Certification Display Limit**
    - **Validates: Requirements 15.3**
    - Generate resources with 4+ certifications
    - Verify only first 3 displayed on card
    - Tag: `Feature: care-roadmap, Property 32: Certification Display Limit`

- [ ] 10. Create ReviewModal component
  - [ ] 10.1 Create src/components/ReviewModal.jsx
    - Implement modal overlay with close button
    - Display full resource details (photo, name, address, certifications, contact)
    - Display current average rating with star visualization and review count
    - Implement interactive rating input (1-5 stars)
    - Implement review textarea with character limit
    - Fetch and display existing reviews sorted by date (newest first)
    - Pre-populate user's existing rating and review if they've already reviewed
    - Handle review submission (create or update)
    - Show loading states for fetching and submitting
    - Show success message after submission
    - Close on overlay click, close button, or ESC key
    - Prevent body scroll when open
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 12.8, 13.4, 13.5, 13.7_
  
  - [ ] 10.2 Create src/components/ReviewModal.css
    - Style modal overlay and container
    - Style resource details section
    - Style rating input (interactive stars)
    - Style review form and textarea
    - Style reviews list and individual review items
    - Style loading and success states
    - Make responsive for mobile
    - _Requirements: 12.2, 12.3, 12.4, 12.5_
  
  - [ ]* 10.3 Write unit tests for review modal
    - Test modal opens and closes correctly
    - Test resource details display
    - Test rating input accepts 1-5 values
    - Test review form submission
    - Test existing reviews display
    - Test user's existing review pre-populates
    - _Requirements: 12.2, 12.3, 12.4, 12.5, 12.8_
  
  - [ ]* 10.4 Write property test for rating update recalculation
    - **Property 22: Rating Update Recalculation**
    - **Validates: Requirements 12.6, 13.3**
    - Generate resources with random existing reviews
    - Submit new rating and verify average recalculated correctly
    - Tag: `Feature: care-roadmap, Property 22: Rating Update Recalculation`
  
  - [ ]* 10.5 Write property test for review display after submission
    - **Property 23: Review Display After Submission**
    - **Validates: Requirements 12.7**
    - Generate random review submissions
    - Verify new review appears in reviews list
    - Tag: `Feature: care-roadmap, Property 23: Review Display After Submission`
  
  - [ ]* 10.6 Write property test for reviews chronological order
    - **Property 24: Reviews Chronological Order**
    - **Validates: Requirements 12.8**
    - Generate random sets of reviews with different timestamps
    - Verify reviews sorted by date descending (newest first)
    - Tag: `Feature: care-roadmap, Property 24: Reviews Chronological Order`

- [ ] 11. Create photo upload and management functionality
  - [ ] 11.1 Create src/components/PhotoUpload.jsx (admin component)
    - Implement file input for photo upload
    - Validate file type (JPEG, PNG, WebP)
    - Validate file size (max 5MB)
    - Upload to Supabase Storage
    - Return photo URL for storage in resource record
    - Show upload progress
    - Display preview of uploaded photo
    - _Requirements: 14.1, 14.2, 14.3, 14.4_
  
  - [ ] 11.2 Create src/services/photoService.js
    - Implement uploadPhoto to Supabase Storage
    - Implement deletePhoto from Supabase Storage
    - Implement getPhotoUrl for public access
    - Handle upload errors gracefully
    - _Requirements: 14.1, 14.2_
  
  - [ ]* 11.3 Write unit tests for photo upload
    - Test file type validation
    - Test file size validation
    - Test successful upload returns URL
    - Test upload errors handled gracefully
    - _Requirements: 14.3, 14.4_
  
  - [ ]* 11.4 Write property test for photo URL storage
    - **Property 29: Photo URL Storage**
    - **Validates: Requirements 14.2**
    - Generate random photo uploads
    - Verify photoUrl field populated after upload
    - Tag: `Feature: care-roadmap, Property 29: Photo URL Storage`
  
  - [ ]* 11.5 Write property test for photo file type validation
    - **Property 30: Photo File Type Validation**
    - **Validates: Requirements 14.3**
    - Generate files with various MIME types
    - Verify only image/jpeg, image/png, image/webp accepted
    - Tag: `Feature: care-roadmap, Property 30: Photo File Type Validation`
  
  - [ ]* 11.6 Write property test for photo file size validation
    - **Property 31: Photo File Size Validation**
    - **Validates: Requirements 14.4**
    - Generate files of various sizes
    - Verify only files ≤ 5MB accepted
    - Tag: `Feature: care-roadmap, Property 31: Photo File Size Validation`

- [ ] 12. Update ResourceListings component
  - [ ] 12.1 Update src/components/ResourceListings.jsx
    - Display list of ResourceCard components
    - Implement sort controls (distance, name, rating)
    - Implement radius filter controls (10, 25, 50, 100 miles)
    - Show loading state with skeleton cards
    - Show empty state when no resources found
    - Handle resource query errors
    - Manage ReviewModal state (open/close, selected resource)
    - Pass onCardClick handler to ResourceCard components
    - _Requirements: 5.1, 5.2, 5.5, 10.3, 12.1_
  
  - [ ] 12.2 Update src/components/ResourceListings.css
    - Style resource list layout
    - Style filter and sort controls
    - Style loading skeletons
    - Style empty state message
    - _Requirements: 5.2, 5.5_
  
  - [ ]* 12.3 Write unit tests for resource listings
    - Test resources render as cards
    - Test loading state displays
    - Test empty state displays when no resources
    - Test sort controls re-order resources
    - Test radius filter triggers new query
    - Test card click opens review modal
    - _Requirements: 5.1, 5.2, 5.5, 12.1_
  
  - [ ]* 12.4 Write property test for location-based filtering
    - **Property 7: Location-Based Resource Filtering**
    - **Validates: Requirements 5.1**
    - Generate random locations, resources, and radii
    - Verify only resources within radius returned
    - Tag: `Feature: care-roadmap, Property 7: Location-Based Resource Filtering`

- [ ] 13. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Create MilestoneNavigation component
  - [ ] 14.1 Create src/components/MilestoneNavigation.jsx
    - Display Previous, Back to Timeline, and Next buttons
    - Disable Previous on first milestone
    - Disable Next on last milestone
    - Preserve location in URL when navigating
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5_
  
  - [ ] 14.2 Create src/components/MilestoneNavigation.css
    - Style navigation buttons
    - Style disabled states
    - Make responsive for mobile
    - _Requirements: 8.1_
  
  - [ ]* 14.3 Write unit tests for milestone navigation
    - Test navigation controls render
    - Test Previous disabled on first milestone
    - Test Next disabled on last milestone
    - Test Back to Timeline button navigates correctly
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ]* 14.4 Write property test for back to timeline link
    - **Property 14: Back to Timeline Link**
    - **Validates: Requirements 8.4**
    - Generate random milestone pages
    - Verify back link present and functional
    - Tag: `Feature: care-roadmap, Property 14: Back to Timeline Link`
  
  - [ ]* 14.5 Write property test for location persistence
    - **Property 15: Location Persistence Across Navigation**
    - **Validates: Requirements 8.5**
    - Generate random location and milestone navigation sequences
    - Verify location preserved in URL and state
    - Tag: `Feature: care-roadmap, Property 15: Location Persistence Across Navigation`

- [ ] 15. Create MilestonePage component
  - [ ] 15.1 Create src/pages/MilestonePage.jsx
    - Get milestone from URL parameter
    - Manage selectedLocation state
    - Fetch resources based on milestone and location
    - Render MilestoneHero with InteractiveMap
    - Render MilestoneNavigation
    - Render ResourceListings
    - Handle URL parameters for location (lat, lng, zoom)
    - Update URL when location changes
    - _Requirements: 3.1, 3.2, 3.3, 3.5, 4.3, 5.1, 8.5_
  
  - [ ] 15.2 Create src/pages/MilestonePage.css
    - Style page layout (hero section, listings section)
    - Style milestone title
    - Make responsive for mobile
    - _Requirements: 3.2, 3.3, 3.5, 7.3_
  
  - [ ]* 15.3 Write unit tests for milestone page
    - Test hero section renders
    - Test resource listings render below hero
    - Test milestone title displays
    - Test location from URL loads correctly
    - Test location changes update URL
    - _Requirements: 3.2, 3.3, 3.5_
  
  - [ ]* 15.4 Write property test for unique milestone routes
    - **Property 4: Unique Milestone Routes**
    - **Validates: Requirements 3.1**
    - Generate all milestone combinations
    - Verify no duplicate paths
    - Tag: `Feature: care-roadmap, Property 4: Unique Milestone Routes`
  
  - [ ]* 15.5 Write property test for milestone title display
    - **Property 5: Milestone Title Display**
    - **Validates: Requirements 3.5**
    - Generate random milestone pages
    - Verify title matches milestone
    - Tag: `Feature: care-roadmap, Property 5: Milestone Title Display`

- [ ] 16. Update navigation and routing
  - [ ] 16.1 Update src/components/Layout.jsx
    - Add "Care" navigation link after "Content"
    - Add active state styling for care routes
    - _Requirements: 1.1, 1.2, 1.4_
  
  - [ ] 16.2 Update src/App.jsx
    - Add route for /care → CareTimeline
    - Add route for /care/:milestone → MilestonePage
    - Import new components
    - _Requirements: 1.2, 3.1_
  
  - [ ]* 16.3 Write unit tests for navigation integration
    - Test "Care" link appears in navigation
    - Test clicking "Care" navigates to /care
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 16.4 Write property test for active navigation highlighting
    - **Property 1: Active Navigation Highlighting**
    - **Validates: Requirements 1.4**
    - Generate random care roadmap routes
    - Verify active class applied to "Care" link
    - Tag: `Feature: care-roadmap, Property 1: Active Navigation Highlighting`

- [ ] 17. Add accessibility features
  - [ ] 17.1 Add ARIA labels to all interactive components
    - Add labels to milestone cards
    - Add labels to map controls
    - Add labels to resource cards
    - Add labels to navigation buttons
    - Add labels to filter/sort controls
    - Add labels to review modal and rating inputs
    - _Requirements: 9.2_
  
  - [ ] 17.2 Ensure keyboard navigation works
    - Test tab order is logical
    - Test all buttons accessible via keyboard
    - Test map controls have keyboard alternatives
    - Test review modal keyboard navigation
    - _Requirements: 9.1, 9.4_
  
  - [ ]* 17.3 Write property test for ARIA labels
    - **Property 16: ARIA Labels for Interactive Components**
    - **Validates: Requirements 9.2**
    - Generate all interactive component types
    - Verify ARIA labels present and descriptive
    - Tag: `Feature: care-roadmap, Property 16: ARIA Labels for Interactive Components`
  
  - [ ]* 17.4 Run automated accessibility tests
    - Use @axe-core/react to test all pages
    - Fix any accessibility violations found
    - _Requirements: 9.1, 9.2, 9.5_

- [ ] 18. Implement lazy loading for map component
  - [ ] 18.1 Use React.lazy() to code-split InteractiveMap
    - Wrap InteractiveMap in lazy import
    - Add Suspense boundary with loading placeholder
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 18.2 Write unit test for lazy loading
    - Test loading placeholder displays
    - Test map loads after placeholder
    - _Requirements: 10.5_

- [ ] 19. Create seed data for testing
  - [ ] 19.1 Create scripts/seed-care-resources.js
    - Generate sample resources for each milestone
    - Include photo URLs and certifications for resources
    - Distribute resources across different US locations
    - Include variety of tags and verified status
    - Generate sample reviews for some resources
    - Insert into database
    - _Requirements: 6.2, 6.3, 13.1, 13.2_
  
  - [ ] 19.2 Run seed script to populate test data
    - Execute seed script
    - Verify resources appear in database
    - Verify reviews appear in database
    - _Requirements: 6.2, 6.3, 13.1, 13.2_

- [ ] 20. Integration testing
  - [ ]* 20.1 Write end-to-end integration tests
    - Test complete flow: timeline → milestone → location selection → resources
    - Test location search → resource filtering
    - Test navigation with location persistence
    - Test resource card click → review modal → submit review
    - Test photo upload and display
    - Test error scenarios (network failures, empty results)
    - _Requirements: All requirements_
  
  - [ ]* 20.2 Test responsive behavior
    - Test mobile layout (320px width)
    - Test tablet layout (768px width)
    - Test desktop layout (1920px width)
    - Test review modal on mobile
    - _Requirements: 7.1, 7.3, 7.4_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Update documentation and sitemap
  - [ ] 22.1 Update scripts/generate-sitemap.js
    - Add /care route
    - Add all 8 milestone routes
    - _Requirements: 1.1_
  
  - [ ] 22.2 Update package.json reactSnap configuration
    - Add care routes to pre-rendering list
    - _Requirements: 10.1, 10.2_
  
  - [ ] 22.3 Create README documentation for care roadmap
    - Document feature overview
    - Document resource card business card layout
    - Document ratings and reviews system
    - Document how to add new resources with photos (admin)
    - Document geocoding functionality
    - Document testing approach
    - _Requirements: All requirements_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- The implementation uses React, React Router, Leaflet, Supabase, and Vitest
- PostGIS extension required for efficient geographic queries
- All interactive components must have ARIA labels for accessibility
