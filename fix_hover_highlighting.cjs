const fs = require('fs');
const path = require('path');

// Fix 1: Remove duplicate hoveredResourceId declaration in MilestonePage.jsx
const milestonePath = path.join(__dirname, 'src', 'pages', 'MilestonePage.jsx');
let milestoneContent = fs.readFileSync(milestonePath, 'utf8');

// Remove the line with stray backtick and the duplicate declaration
milestoneContent = milestoneContent.replace(
  /  const \[showTagsDropdown, setShowTagsDropdown\] = useState\(false\);`r`n  const \[hoveredResourceId, setHoveredResourceId\] = useState\(null\);/,
  '  const [showTagsDropdown, setShowTagsDropdown] = useState(false);\r\n  const [hoveredResourceId, setHoveredResourceId] = useState(null);'
);

fs.writeFileSync(milestonePath, milestoneContent, 'utf8');
console.log('✓ Fixed duplicate hoveredResourceId in MilestonePage.jsx');

// Fix 2: Update CSS selector in ResourceCard.css
const cssPath = path.join(__dirname, 'src', 'components', 'ResourceCard.css');
let cssContent = fs.readFileSync(cssPath, 'utf8');

cssContent = cssContent.replace(
  '.resource-card.hovered {',
  '.resource-card-compact.hovered {'
);

fs.writeFileSync(cssPath, cssContent, 'utf8');
console.log('✓ Updated CSS selector to .resource-card-compact.hovered');

// Fix 3: Update ResourceListings to pass hover props
const listingsPath = path.join(__dirname, 'src', 'components', 'ResourceListings.jsx');
let listingsContent = fs.readFileSync(listingsPath, 'utf8');

// Add hoveredResourceId and onResourceHover to function parameters
listingsContent = listingsContent.replace(
  'function ResourceListings({ \r\n  resources, \r\n  loading, \r\n  milestone,\r\n  milestoneInfo,\r\n  onResourceClick,\r\n  availableTags,\r\n  searchQuery = \'\',\r\n  selectedTags = [],\r\n  showFilters = true\r\n}) {',
  'function ResourceListings({ \r\n  resources, \r\n  loading, \r\n  milestone,\r\n  milestoneInfo,\r\n  onResourceClick,\r\n  availableTags,\r\n  searchQuery = \'\',\r\n  selectedTags = [],\r\n  showFilters = true,\r\n  hoveredResourceId = null,\r\n  onResourceHover = null\r\n}) {'
);

// Update ResourceCard to pass hover props
listingsContent = listingsContent.replace(
  '<ResourceCard \r\n                  resource={resource} \r\n                  onClick={onResourceClick}\r\n                />',
  '<ResourceCard \r\n                  resource={resource} \r\n                  onClick={onResourceClick}\r\n                  isHovered={hoveredResourceId === resource.id}\r\n                  onHover={() => onResourceHover && onResourceHover(resource.id)}\r\n                  onHoverEnd={() => onResourceHover && onResourceHover(null)}\r\n                />'
);

fs.writeFileSync(listingsPath, listingsContent, 'utf8');
console.log('✓ Updated ResourceListings to pass hover props');

console.log('\n✅ All hover highlighting fixes applied!');
