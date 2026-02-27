const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'src', 'pages', 'MyCourses.css');
let content = fs.readFileSync(cssPath, 'utf8');

// Replace the stat-value color to use a more visible color
content = content.replace(
  /\.stat-value \{\r\n  font-size: 2\.5rem;\r\n  font-weight: 700;\r\n  color: var\(--primary-color\);\r\n  margin-bottom: 0\.5rem;\r\n\}/,
  `.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #4f46e5;
  margin-bottom: 0.5rem;
}`
);

fs.writeFileSync(cssPath, content, 'utf8');
console.log('✓ Fixed stat-value color in MyCourses.css');
console.log('  - Changed from var(--primary-color) to explicit #4f46e5');
console.log('  - This ensures the numbers are visible on white background');
