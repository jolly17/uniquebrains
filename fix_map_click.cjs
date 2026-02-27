const fs = require('fs');

let content = fs.readFileSync('src/pages/ResourceDetailPage.jsx', 'utf8');

// Replace the iframe with a clickable wrapper div
content = content.replace(
  /<div className="resource-map">[\s\S]*?<\/div>/,
  `<div 
              className="resource-map" 
              onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${resource.coordinates.lat},\${resource.coordinates.lng}\`, '_blank')}
              style={{ cursor: 'pointer' }}
              title="Click to open in Google Maps"
            >
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={\`https://www.openstreetmap.org/export/embed.html?bbox=\${resource.coordinates.lng-0.01},\${resource.coordinates.lat-0.01},\${resource.coordinates.lng+0.01},\${resource.coordinates.lat+0.01}&layer=mapnik&marker=\${resource.coordinates.lat},\${resource.coordinates.lng}\`}
                title="Resource location map"
                style={{ pointerEvents: 'none' }}
              />
            </div>`
);

fs.writeFileSync('src/pages/ResourceDetailPage.jsx', content, 'utf8');

console.log('✓ Fixed map click - wrapped iframe in clickable div');
