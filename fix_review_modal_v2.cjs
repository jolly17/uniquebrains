const fs = require('fs');

// Fix ReviewModal.jsx
let content = fs.readFileSync('src/components/ReviewModal.jsx', 'utf8');

// Split by the two auth checks and keep only the second one
const lines = content.split('\n');
let inFirstAuthCheck = false;
let firstAuthCheckStart = -1;
let firstAuthCheckEnd = -1;
let braceCount = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // Find first "if (!user)" after "if (!isOpen)"
  if (!inFirstAuthCheck && line.includes('if (!isOpen) return null;')) {
    // Look for the next "if (!user)"
    for (let j = i + 1; j < lines.length; j++) {
      if (lines[j].trim().startsWith('if (!user)')) {
        firstAuthCheckStart = j;
        inFirstAuthCheck = true;
        braceCount = 0;
        break;
      }
    }
  }
  
  if (inFirstAuthCheck) {
    // Count braces to find the end
    for (let char of line) {
      if (char === '{') braceCount++;
      if (char === '}') braceCount--;
    }
    
    // When we close all braces and find the closing of the if statement
    if (braceCount === 0 && line.includes('}') && i > firstAuthCheckStart) {
      firstAuthCheckEnd = i;
      break;
    }
  }
}

// Remove the first auth check block
if (firstAuthCheckStart > 0 && firstAuthCheckEnd > 0) {
  lines.splice(firstAuthCheckStart, firstAuthCheckEnd - firstAuthCheckStart + 1);
}

content = lines.join('\n');

// Fix star buttons - ensure they have the star character
content = content.replace(
  /aria-label=\{`Rate \$\{star\} stars`\}\s*>\s*\n\s*\n?\s*★?<\/button>/g,
  'aria-label={`Rate ${star} stars`}>\n                    ★\n                  </button>'
);

// Fix close button × character
content = content.replace(
  /aria-label="Close modal"\s*>\s*\n\s*\n?\s*×?<\/button>/g,
  'aria-label="Close modal">\n              ×\n            </button>'
);

fs.writeFileSync('src/components/ReviewModal.jsx', content, 'utf8');

// Fix ResourceDetailPage.jsx - already done, but ensure it's correct
let resourceDetail = fs.readFileSync('src/pages/ResourceDetailPage.jsx', 'utf8');
resourceDetail = resourceDetail.replace(/ Back to \{milestone\}/g, '← Back to {milestone}');
fs.writeFileSync('src/pages/ResourceDetailPage.jsx', resourceDetail, 'utf8');

console.log('✓ Fixed ReviewModal.jsx - removed duplicate auth check, added stars and × symbols');
console.log('✓ Fixed ResourceDetailPage.jsx - added ← arrows to back links');
