const fs = require('fs');

// Read the InstructorProfile.css file
const filePath = 'src/pages/InstructorProfile.css';
let content = fs.readFileSync(filePath, 'utf8');

// Find the responsive section and scope the stat-value there too
content = content.replace(
  /(@media \(max-width: 640px\) \{[\s\S]*?)(\.stat-value \{)/,
  '$1.instructor-hero .stat-value {'
);

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Fixed responsive stat-value to be scoped to .instructor-hero');
