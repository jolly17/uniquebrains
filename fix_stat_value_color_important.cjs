const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'MyCourses.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Add !important to the color to ensure it overrides any other rules
content = content.replace(
  /\.stat-value \{\r\n  font-size: 2\.5rem;\r\n  font-weight: 700;\r\n  color: #4f46e5;\r\n  margin-bottom: 0\.5rem;\r\n\}/,
  `.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4f46e5 !important;
  margin-bottom: 0.5rem;
}`
);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('✓ Added !important to stat-value color in MyCourses.css');
console.log('  - Color: #4f46e5 !important');
console.log('  - This will override any conflicting CSS rules');
