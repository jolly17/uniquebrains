const fs = require('fs');

// 1. Update MilestonePage.jsx to add hoveredResourceId state and map bounds filtering
let milestonePage = fs.readFileSync('src/pages/MilestonePage.jsx', 'utf8');

// Add hoveredResourceId state
milestonePage = milestonePage.replace(
  'const [showTagsDropdown, setShowTagsDropdown] = useState(false);',
  `const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [hoveredResourceId, setHoveredResourceId] = useState(null);`
);

// Update handleMapMove to fetch resources in bounds with debounce
milestonePage = milestonePage.replace(
  /\/\*\*\s+\* Handle map movement\s+\*\/\s+const handleMapMove = \(bounds, center\) => \{[\s\S]*?\};/,
  `/**
   * Handle map movement with debounced resource fetching
   */
  const mapMoveTimeoutRef = useRef(null);
  
  const handleMapMove = (bounds, center) => {
    // Update map center state
    setMapCenter(center);
    
    // Update URL parameters
    updateURLParams(center);
    
    // Debounce resource fetching - wait 500ms after user stops moving map
    if (mapMoveTimeoutRef.current) {
      clearTimeout(mapMoveTimeoutRef.current);
    }
    
    mapMoveTimeoutRef.current = setTimeout(() => {
      // Fetch resources in new bounds
      fetchResourcesInBounds(bounds, milestone);
    }, 500);
  };
  
  /**
   * Fetch resources within map bounds
   */
  const fetchResourcesInBounds = async (bounds, milestone) => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('care_resources')
        .select('*')
        .eq('milestone', milestone)
        .gte('lat', bounds.south)
        .lte('lat', bounds.north)
        .gte('lng', bounds.west)
        .lte('lng', bounds.east);
      
      if (error) throw error;
      
      // Transform to include coordinates object
      const transformedData = (data || []).map(resource => ({
        ...resource,
        coordinates: resource.lat && resource.lng 
          ? { lat: resource.lat, lng: resource.lng }
          : null
      }));
      
      console.log(\`Fetched \${transformedData.length} resources in bounds\`);
      setResources(transformedData);
    } catch (err) {
      console.error('Error fetching resources in bounds:', err);
      setError(err.message || 'Failed to load resources');
    } finally {
      setLoading(false);
    }
  };`
);

// Add useRef import
milestonePage = milestonePage.replace(
  "import { useState, useEffect, lazy, Suspense } from 'react';",
  "import { useState, useEffect, useRef, lazy, Suspense } from 'react';"
);

// Pass hoveredResourceId to InteractiveMap and ResourceListings
milestonePage = milestonePage.replace(
  /<InteractiveMap\s+resources=\{resources\}\s+mapCenter=\{mapCenter\}\s+onMapMove=\{handleMapMove\}\s+onResourceClick=\{handleResourceClick\}\s+onLocationFound=\{handleLocationFound\}\s+\/>/,
  `<InteractiveMap
                resources={resources}
                mapCenter={mapCenter}
                onMapMove={handleMapMove}
                onResourceClick={handleResourceClick}
                onLocationFound={handleLocationFound}
                hoveredResourceId={hoveredResourceId}
                onMarkerHover={setHoveredResourceId}
              />`
);

milestonePage = milestonePage.replace(
  /<ResourceListings\s+resources=\{resources\}\s+loading=\{loading\}\s+milestone=\{milestone\}\s+milestoneInfo=\{milestoneInfo\}\s+onResourceClick=\{handleResourceClick\}\s+availableTags=\{AVAILABLE_TAGS\}\s+searchQuery=\{resourceSearchQuery\}\s+selectedTags=\{selectedTags\}\s+showFilters=\{false\}\s+\/>/,
  `<ResourceListings
            resources={resources}
            loading={loading}
            milestone={milestone}
            milestoneInfo={milestoneInfo}
            onResourceClick={handleResourceClick}
            availableTags={AVAILABLE_TAGS}
            searchQuery={resourceSearchQuery}
            selectedTags={selectedTags}
            showFilters={false}
            hoveredResourceId={hoveredResourceId}
            onResourceHover={setHoveredResourceId}
          />`
);

fs.writeFileSync('src/pages/MilestonePage.jsx', milestonePage, 'utf8');

// 2. Update InteractiveMap.jsx to handle hover events
let interactiveMap = fs.readFileSync('src/components/InteractiveMap.jsx', 'utf8');

// Update component props
interactiveMap = interactiveMap.replace(
  /export default function InteractiveMap\(\{[\s\S]*?\}\) \{/,
  `export default function InteractiveMap({
  resources = [],
  mapCenter = { lat: 39.8283, lng: -98.5795, zoom: 4 },
  onMapMove,
  onResourceClick,
  selectedResourceId = null,
  onLocationFound,
  hoveredResourceId = null,
  onMarkerHover
}) {`
);

// Update marker to use hoveredResourceId from props
interactiveMap = interactiveMap.replace(
  'const isHovered = hoveredMarkerId === resource.id;',
  'const isHovered = hoveredMarkerId === resource.id || hoveredResourceId === resource.id;'
);

// Update marker event handlers to call onMarkerHover
interactiveMap = interactiveMap.replace(
  /eventHandlers=\{\{\s+click: \(\) => handleMarkerClick\(resource\.id\),\s+mouseover: \(\) => setHoveredMarkerId\(resource\.id\),\s+mouseout: \(\) => setHoveredMarkerId\(null\)\s+\}\}/,
  `eventHandlers={{
                      click: () => handleMarkerClick(resource.id),
                      mouseover: () => {
                        setHoveredMarkerId(resource.id);
                        if (onMarkerHover) onMarkerHover(resource.id);
                      },
                      mouseout: () => {
                        setHoveredMarkerId(null);
                        if (onMarkerHover) onMarkerHover(null);
                      }
                    }}`
);

fs.writeFileSync('src/components/InteractiveMap.jsx', interactiveMap, 'utf8');

// 3. Update ResourceListings.jsx to handle hover highlighting
let resourceListings = fs.readFileSync('src/components/ResourceListings.jsx', 'utf8');

// Add hoveredResourceId and onResourceHover to props
resourceListings = resourceListings.replace(
  /export default function ResourceListings\(\{[\s\S]*?\}\) \{/,
  `export default function ResourceListings({
  resources,
  loading,
  milestone,
  milestoneInfo,
  onResourceClick,
  availableTags = [],
  searchQuery = '',
  selectedTags = [],
  showFilters = true,
  hoveredResourceId = null,
  onResourceHover
}) {`
);

// Pass hover props to ResourceCard
resourceListings = resourceListings.replace(
  /<ResourceCard\s+key=\{resource\.id\}\s+resource=\{resource\}\s+onClick=\{\(\) => onResourceClick\(resource\.id\)\}\s+\/>/g,
  `<ResourceCard
                key={resource.id}
                resource={resource}
                onClick={() => onResourceClick(resource.id)}
                isHovered={hoveredResourceId === resource.id}
                onHover={() => onResourceHover && onResourceHover(resource.id)}
                onHoverEnd={() => onResourceHover && onResourceHover(null)}
              />`
);

fs.writeFileSync('src/components/ResourceListings.jsx', resourceListings, 'utf8');

// 4. Update ResourceCard.jsx to handle hover highlighting
let resourceCard = fs.readFileSync('src/components/ResourceCard.jsx', 'utf8');

// Add hover props
resourceCard = resourceCard.replace(
  /export default function ResourceCard\(\{ resource, onClick \}\) \{/,
  `export default function ResourceCard({ resource, onClick, isHovered = false, onHover, onHoverEnd }) {`
);

// Add hover class and event handlers
resourceCard = resourceCard.replace(
  /<div className="resource-card" onClick=\{onClick\}>/,
  `<div 
      className={\`resource-card \${isHovered ? 'hovered' : ''}\`}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onHoverEnd}
    >`
);

fs.writeFileSync('src/components/ResourceCard.jsx', resourceCard, 'utf8');

// 5. Add CSS for hover highlighting
let resourceCardCSS = fs.readFileSync('src/components/ResourceCard.css', 'utf8');

if (!resourceCardCSS.includes('.resource-card.hovered')) {
  resourceCardCSS += `

.resource-card.hovered {
  border-color: #7c3aed;
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
  transform: translateY(-2px);
}
`;
  fs.writeFileSync('src/components/ResourceCard.css', resourceCardCSS, 'utf8');
}

console.log('✓ Updated MilestonePage.jsx - added map bounds filtering with debounce');
console.log('✓ Updated InteractiveMap.jsx - added marker hover event handling');
console.log('✓ Updated ResourceListings.jsx - added hover prop passing');
console.log('✓ Updated ResourceCard.jsx - added hover highlighting');
console.log('✓ Updated ResourceCard.css - added hover styles');
