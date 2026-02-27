const fs = require('fs');

let content = fs.readFileSync('src/pages/MilestonePage.jsx', 'utf8');

// Remove the duplicate hoveredResourceId declaration
content = content.replace(
  /const \[showTagsDropdown, setShowTagsDropdown\] = useState\(false\);\s+const \[hoveredResourceId, setHoveredResourceId\] = useState\(null\);\s+const \[hoveredResourceId, setHoveredResourceId\] = useState\(null\);/,
  `const [showTagsDropdown, setShowTagsDropdown] = useState(false);
  const [hoveredResourceId, setHoveredResourceId] = useState(null);`
);

fs.writeFileSync('src/pages/MilestonePage.jsx', content, 'utf8');

console.log('✓ Removed duplicate hoveredResourceId declaration');
