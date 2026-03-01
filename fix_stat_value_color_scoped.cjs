const fs = require('fs');

// Read the InstructorProfile.css file
const filePath = 'src/pages/InstructorProfile.css';
let content = fs.readFileSync(filePath, 'utf8');

// Replace unscoped .stat-value and .stat-label with scoped versions
content = content.replace(
  /^\.stat-value \{/gm,
  '.instructor-hero .stat-value {'
);

content = content.replace(
  /^\.stat-label \{/gm,
  '.instructor-hero .stat-label {'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed stat-value and stat-label to be scoped to .instructor-hero');
