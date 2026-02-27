const fs = require('fs');

let content = fs.readFileSync('src/components/InteractiveMap.jsx', 'utf8');

// Add MapEventHandler component after MapViewController
content = content.replace(
  /function MapViewController\(\{ center, zoom \}\) \{[\s\S]*?\n\}/,
  `function MapViewController({ center, zoom }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || 13, {
        animate: true,
        duration: 0.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

/**
 * Component to handle map movement events
 */
function MapEventHandler({ onMapMove }) {
  const map = useMap();
  
  useEffect(() => {
    if (!onMapMove) return;
    
    const handleMoveEnd = () => {
      const bounds = map.getBounds();
      const center = map.getCenter();
      const zoom = map.getZoom();

      onMapMove(
        {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
          east: bounds.getEast(),
          west: bounds.getWest()
        },
        {
          lat: center.lat,
          lng: center.lng,
          zoom: zoom
        }
      );
    };
    
    map.on('moveend', handleMoveEnd);
    
    return () => {
      map.off('moveend', handleMoveEnd);
    };
  }, [map, onMapMove]);
  
  return null;
}`
);

// Add MapEventHandler to the MapContainer
content = content.replace(
  '{/* Map view controller */}\n          <MapViewController center={mapCenter} zoom={mapCenter.zoom} />',
  `{/* Map view controller */}
          <MapViewController center={mapCenter} zoom={mapCenter.zoom} />
          
          {/* Map event handler */}
          <MapEventHandler onMapMove={onMapMove} />`
);

// Remove the unused handleMapMoveEnd function
content = content.replace(
  /\/\*\*\s+\* Handle map movement end\s+\*\/\s+const handleMapMoveEnd = \(\) => \{[\s\S]*?\};/,
  ''
);

fs.writeFileSync('src/components/InteractiveMap.jsx', content, 'utf8');

console.log('✓ Added MapEventHandler component to listen to map moveend events');
console.log('✓ Removed unused handleMapMoveEnd function');
