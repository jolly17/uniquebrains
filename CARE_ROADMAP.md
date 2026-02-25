# Care Roadmap Feature

**Interactive location-based resource discovery for neurodiversity care stages**

The Care Roadmap provides an interactive timeline-based navigation system that guides users through various stages of neurodiversity care, from diagnosis through education and employment, with location-based resources available at each stage.

🌐 **Live Feature**: [https://uniquebrains.org/care](https://uniquebrains.org/care)  
📋 **Spec Location**: `.kiro/specs/care-roadmap/`

---

## ✨ Overview

The Care Roadmap feature consists of three main components:

1. **Timeline Landing Page** - Visual overview of all care stages
2. **Milestone Pages** - Individual pages for each care stage with interactive maps
3. **Location-Based Resources** - Filterable listings of services, facilities, and programs

### Key Features

- 🗺️ **Interactive Maps** - Leaflet-based maps with location search and filtering
- 📍 **Location Persistence** - Selected location maintained across milestone navigation
- 🔍 **Smart Filtering** - Filter by tags, rating, distance, experience, and verification status
- 🌍 **Multi-Country Support** - Quick navigation to resources in different countries
- ⭐ **Ratings & Reviews** - User ratings and review counts for each resource
- ✅ **Verified Resources** - Admin-verified resources with badges
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop

---

## 🎯 Care Stages (Milestones)

The roadmap includes six key milestones in the neurodiversity care journey:

1. **Diagnosis** 🔍 - Diagnostic centers, specialists, and assessment services
2. **Therapies** 🧩 - Occupational, speech, behavioral, and specialized interventions
3. **Education** 📚 - Schools, special education programs, and educational resources
4. **Trainings** 🎓 - Vocational training, skill development, and certification courses
5. **NGO/Advocacy** 🤝 - NGOs, advocacy groups, and support organizations
6. **Jobs/Livelihood** 💼 - Employers, job placement services, and career support

Each milestone has its own dedicated page with location-based resource listings.

---

## 🏗️ Architecture

### Component Structure

```
CareRoadmap
├── CareTimeline (Landing Page)
│   └── MilestoneCard (x6)
│
└── MilestonePage (Individual Stage)
    ├── SearchBar
    ├── CountrySelector
    ├── FilterPanel (Left Sidebar)
    ├── ResourceListings (Center)
    │   └── ResourceCard (x N)
    │       └── ResourceDetailModal
    ├── InteractiveMap (Right)
    │   └── LocationSearch
    └── MilestoneNavigation
```

### Data Flow

```
User Selects Location
  ↓
Update URL Params (?lat=X&lng=Y)
  ↓
Trigger Resource Query
  ↓
careResourceService.getByMilestoneAndLocation()
  ↓
Supabase Query with PostGIS (radius-based filtering)
  ↓
Return Filtered Resources
  ↓
Update ResourceListings & Map Markers
```

### Routes

```
/care                    → CareTimeline (landing page)
/care/diagnosis          → MilestonePage (diagnosis resources)
/care/therapies          → MilestonePage (therapy resources)
/care/education          → MilestonePage (education resources)
/care/trainings          → MilestonePage (training resources)
/care/ngo-advocacy       → MilestonePage (NGO/advocacy resources)
/care/jobs-livelihood    → MilestonePage (job/livelihood resources)
```

---

## 🗄️ Database Schema

### care_resources Table

```sql
CREATE TABLE care_resources (
  id UUID PRIMARY KEY,
  milestone VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50),
  zip_code VARCHAR(20),
  country VARCHAR(2) NOT NULL,  -- ISO country code (US, IN, GB, etc.)
  coordinates GEOGRAPHY(POINT, 4326) NOT NULL,  -- PostGIS for lat/lng
  phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),
  experience_years INTEGER,
  tags TEXT[],  -- Array: ['autism', 'adhd', 'speech-therapy']
  rating DECIMAL(2,1),  -- 0.0-5.0
  review_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Indexes:**
- `idx_care_resources_milestone` - Fast milestone filtering
- `idx_care_resources_country` - Country-based queries
- `idx_care_resources_coordinates` (GIST) - Efficient geographic queries
- `idx_care_resources_tags` (GIN) - Tag-based filtering
- `idx_care_resources_rating` - Rating-based sorting

---

## 🔧 Technical Implementation

### Map Integration

**Library**: Leaflet.js with React-Leaflet

**Features**:
- OpenStreetMap tiles (no API key required)
- Marker clustering for performance
- Custom markers with rating-based colors
- Debounced map movement (500ms)
- Lazy loading with Suspense

### Geocoding

**Service**: Nominatim (OpenStreetMap) by default

**Alternatives** (via environment variables):
- Google Geocoding API
- Mapbox Geocoding API

**Configuration**:
```env
VITE_GEOCODING_SERVICE=nominatim  # or 'google' or 'mapbox'
VITE_GOOGLE_GEOCODING_API_KEY=your-key  # if using Google
VITE_MAPBOX_API_KEY=your-key  # if using Mapbox
```

### Location Persistence

Location is stored in URL parameters and maintained across navigation:

```
/care/diagnosis?lat=40.7128&lng=-74.0060&zoom=12
  ↓ Navigate to Therapies
/care/therapies?lat=40.7128&lng=-74.0060&zoom=12
```

### Service Layer

**careResourceService.js** provides:
- `getResourcesByMilestoneAndLocation()` - Query resources with filters
- `createCareResource()` - Admin: Create new resource
- `updateCareResource()` - Admin: Update existing resource
- `deleteCareResource()` - Admin: Delete resource
- `bulkUploadResources()` - Admin: Bulk upload from CSV/Excel

---

## 👨‍💼 Admin Features

### Bulk Upload

Admins can upload multiple resources via CSV or Excel files.

**Access**: `/admin/care-resources`

**CSV Format**:
```csv
milestone,name,address,city,state,zip_code,country,phone,email,website,experience_years,tags,rating,review_count,verified
diagnosis,Autism Center,123 Main St,New York,NY,10001,US,+1-212-555-0123,info@center.com,https://center.com,15,"autism,ADHD",4.8,127,true
```

**Required Fields**:
- milestone (diagnosis, therapies, education, trainings, ngo-advocacy, jobs-livelihood)
- name
- address
- city
- state
- zip_code
- country (ISO 3166-1 alpha-2 code)

**Optional Fields**:
- description
- phone
- email
- website
- experience_years
- tags (comma-separated)
- rating (0.0-5.0)
- review_count
- verified (true/false)

**Process**:
1. Upload CSV/Excel file
2. System validates data
3. Geocodes addresses to coordinates
4. Inserts resources into database
5. Shows success/failure report

**Rate Limiting**: 1 request/second (for Nominatim)

**Template**: Download from `/public/templates/care-resources-template.csv`

### Manual Resource Management

Admins can also create, edit, and delete resources individually through the admin interface.

---

## 🧪 Testing

### Testing Strategy

The feature uses a dual testing approach:

1. **Unit Tests** - Specific examples and edge cases
2. **Property-Based Tests** - Universal correctness properties

**Framework**: Vitest with React Testing Library + fast-check

### Test Coverage

**Component Tests**:
- Timeline renders all milestone cards
- Milestone pages render hero section and listings
- Resource cards display all required fields
- Navigation controls work correctly
- Loading and empty states display appropriately

**Integration Tests**:
- End-to-end flow: timeline → milestone → location → resources
- Location search and filtering
- Navigation with location persistence
- Error handling scenarios

**Property Tests** (16 properties):
- Active navigation highlighting
- Milestone cards completeness
- Location-based filtering
- Resource data structure
- ARIA labels for accessibility
- And more...

### Running Tests

```bash
# Run all tests
npm test

# Run care roadmap tests only
npm test -- care

# Run with coverage
npm test -- --coverage
```

---

## ♿ Accessibility

The Care Roadmap is built with accessibility as a priority:

- ✅ **Keyboard Navigation** - All features accessible via keyboard
- ✅ **ARIA Labels** - Descriptive labels for screen readers
- ✅ **Color Contrast** - WCAG 4.5:1 minimum contrast ratio
- ✅ **Focus Management** - Clear focus indicators
- ✅ **Screen Reader Support** - Tested with NVDA, JAWS, VoiceOver
- ✅ **Responsive Design** - Works on all devices and screen sizes

**Testing Tools**:
- axe-core for automated accessibility testing
- eslint-plugin-jsx-a11y for static analysis
- Manual testing with screen readers

---

## 📱 Responsive Design

### Breakpoints

- **Mobile**: 320px - 767px (single column layout)
- **Tablet**: 768px - 1023px (two column layout)
- **Desktop**: 1024px+ (three column layout with filters, listings, map)

### Mobile Optimizations

- Touch-friendly map controls
- Collapsible filter panel
- Stacked resource cards
- Simplified navigation
- Optimized image loading

---

## 🚀 Performance

### Optimization Techniques

1. **Lazy Loading** - Map component loaded on demand
2. **Code Splitting** - Route-based code splitting
3. **Debouncing** - Map movement and search input debounced
4. **Marker Clustering** - Efficient rendering of many markers
5. **Image Optimization** - Responsive images with lazy loading
6. **Database Indexing** - PostGIS indexes for fast queries

### Performance Targets

- Initial page load: < 2 seconds
- Time to interactive: < 3 seconds
- Map load time: < 1 second
- Resource query: < 500ms
- Bundle size: < 200KB (care roadmap code)

---

## 🔍 SEO & Discoverability

### Sitemap

All care routes are included in the sitemap:

```xml
<url>
  <loc>https://uniquebrains.org/care</loc>
  <priority>0.8</priority>
</url>
<url>
  <loc>https://uniquebrains.org/care/diagnosis</loc>
  <priority>0.7</priority>
</url>
<!-- ... other milestones ... -->
```

### Pre-rendering

Care routes are pre-rendered with react-snap for better SEO and initial load performance.

**Configuration** (package.json):
```json
"reactSnap": {
  "include": [
    "/care",
    "/care/diagnosis",
    "/care/therapies",
    "/care/education",
    "/care/trainings",
    "/care/ngo-advocacy",
    "/care/jobs-livelihood"
  ]
}
```

---

## 🐛 Error Handling

### Client-Side Errors

**Map Loading Failures**:
- Display error message
- Provide fallback: Show listings without map
- Log error for debugging

**Geolocation Errors**:
- Permission denied: Prompt for manual address entry
- Position unavailable: Show error message
- Timeout: Suggest retry or manual entry

**Resource Query Failures**:
- Network error: Show retry button
- Empty results: Suggest expanding search radius
- Invalid location: Prompt for different location

### Server-Side Errors

**Database Errors**:
- Connection failures: 503 Service Unavailable
- Query timeout: 504 Gateway Timeout
- Invalid query: 400 Bad Request with details

**Authentication Errors** (admin operations):
- Unauthorized: 401 with re-authentication prompt
- Forbidden: 403 with permission message

### Recovery Strategies

1. **Retry Logic** - Exponential backoff for transient errors (max 3 attempts)
2. **Graceful Degradation** - Show partial functionality if components fail
3. **User Feedback** - Clear error messages with actionable suggestions

---

## 📊 Analytics & Monitoring

### Key Metrics to Track

- Page views per milestone
- Location searches performed
- Resources viewed (card clicks)
- Filter usage patterns
- Country selection distribution
- Average session duration
- Bounce rate per milestone

### Error Monitoring

- Map loading failures
- Geocoding failures
- Database query errors
- Client-side JavaScript errors

---

## 🔮 Future Enhancements

### Planned Features

- 📝 **User Reviews** - Allow users to write reviews and rate resources
- 🔔 **Notifications** - Alert users about new resources in their area
- 💾 **Saved Resources** - Bookmark favorite resources
- 📤 **Share Resources** - Share via email, social media
- 🗺️ **Directions** - Integrate with Google Maps for directions
- 📊 **Resource Analytics** - Track resource popularity and engagement
- 🌐 **Multi-Language** - Support for multiple languages
- 🔗 **Resource Verification** - Community-driven verification system

### Technical Improvements

- GraphQL API for more efficient queries
- Redis caching for frequently accessed resources
- Elasticsearch for advanced search capabilities
- Progressive Web App (PWA) support
- Offline mode with service workers

---

## 📚 Related Documentation

- **[Requirements](.kiro/specs/care-roadmap/requirements.md)** - Detailed requirements
- **[Design](.kiro/specs/care-roadmap/design.md)** - Technical design document
- **[Tasks](.kiro/specs/care-roadmap/tasks.md)** - Implementation plan
- **[Main README](./README.md)** - Platform overview

---

## 🤝 Contributing

### Adding New Resources

**For Admins**:
1. Navigate to `/admin/care-resources`
2. Upload CSV file or add manually
3. Verify geocoding is correct
4. Mark as verified if appropriate

**CSV Template**: Available at `/public/templates/care-resources-template.csv`

### Adding New Milestones

To add a new milestone:

1. Update `src/data/milestones.js`:
```javascript
{
  id: 'new-milestone',
  title: 'New Milestone',
  description: 'Description here',
  icon: '🎯',
  path: '/care/new-milestone',
  order: 7
}
```

2. Update database schema to allow new milestone value
3. Update sitemap and pre-rendering configuration
4. Add resources for the new milestone

---

## 🆘 Troubleshooting

### Common Issues

**Map not loading**:
- Check browser console for errors
- Verify Leaflet CSS is imported
- Check network tab for tile loading failures

**Resources not showing**:
- Verify resources exist in database for selected milestone
- Check location filter radius (try expanding)
- Verify PostGIS extension is enabled in Supabase

**Geocoding failures**:
- Check rate limiting (1 req/sec for Nominatim)
- Verify address format is correct
- Try alternative geocoding service

**Location not persisting**:
- Check URL parameters are being set
- Verify browser allows URL updates
- Check for JavaScript errors in console

### Debug Mode

Enable debug logging:
```javascript
// In browser console
localStorage.setItem('debug', 'care:*');
```

---

## 📞 Support

- **Documentation**: See links above
- **Issues**: Check main TROUBLESHOOTING.md
- **Website**: [https://uniquebrains.org](https://uniquebrains.org)

---

**Built with ❤️ for neurodivergent families**

*Last Updated: January 2026*  
*Version: 1.0.0*  
*Status: Production Ready 🚀*
