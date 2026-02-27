const fs = require('fs');
const path = require('path');

// Fix mobile map height in MilestonePage.css
const milestoneCssPath = path.join(__dirname, 'src', 'pages', 'MilestonePage.css');
let milestoneCss = fs.readFileSync(milestoneCssPath, 'utf8');

// Update 768px breakpoint - increase from 500px to 70vh (viewport height)
milestoneCss = milestoneCss.replace(
  /@media \(max-width: 768px\) \{[\s\S]*?\.map-container \{\r\n    height: 500px;\r\n  \}/,
  (match) => match.replace('height: 500px;', 'height: 70vh;\r\n    min-height: 500px;')
);

// Update 480px breakpoint - increase from 300px to 60vh
milestoneCss = milestoneCss.replace(
  /@media \(max-width: 480px\) \{[\s\S]*?\.map-container \{\r\n    height: 300px;\r\n  \}/,
  (match) => match.replace('height: 300px;', 'height: 60vh;\r\n    min-height: 400px;')
);

fs.writeFileSync(milestoneCssPath, milestoneCss, 'utf8');
console.log('✓ Updated mobile map heights in MilestonePage.css');

// Fix mobile map height in InteractiveMap.css
const interactiveMapCssPath = path.join(__dirname, 'src', 'components', 'InteractiveMap.css');
let interactiveMapCss = fs.readFileSync(interactiveMapCssPath, 'utf8');

// Update 768px breakpoint
interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 768px\) \{[\s\S]*?\.leaflet-map \{\r\n    min-height: 500px;/,
  (match) => match.replace('min-height: 500px;', 'min-height: 70vh;')
);

interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 768px\) \{[\s\S]*?\.map-wrapper \{\r\n    min-height: 500px;\r\n  \}/,
  (match) => match.replace('min-height: 500px;', 'min-height: 70vh;')
);

interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 768px\) \{[\s\S]*?\.interactive-map-container \{\r\n    min-height: 500px;/,
  (match) => match.replace('min-height: 500px;', 'min-height: 70vh;')
);

// Update 480px breakpoint
interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 480px\) \{[\s\S]*?\.leaflet-map \{\r\n    min-height: 350px;\r\n  \}/,
  (match) => match.replace('min-height: 350px;', 'min-height: 60vh;')
);

interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 480px\) \{[\s\S]*?\.map-wrapper \{\r\n    min-height: 350px;\r\n  \}/,
  (match) => match.replace('min-height: 350px;', 'min-height: 60vh;')
);

interactiveMapCss = interactiveMapCss.replace(
  /@media \(max-width: 480px\) \{[\s\S]*?\.interactive-map-container \{\r\n    min-height: 350px;\r\n  \}/,
  (match) => match.replace('min-height: 350px;', 'min-height: 60vh;')
);

fs.writeFileSync(interactiveMapCssPath, interactiveMapCss, 'utf8');
console.log('✓ Updated mobile map heights in InteractiveMap.css');

console.log('\n✅ Mobile map height fixes applied!');
console.log('📱 Tablet (768px): 70vh with 500px minimum');
console.log('📱 Mobile (480px): 60vh with 400px minimum');
