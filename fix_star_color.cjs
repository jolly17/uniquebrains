const fs = require('fs');

let css = fs.readFileSync('src/components/StarRating.css', 'utf8');

// Replace var(--primary-color) with #fbbf24 (the yellow color used for filled stars)
css = css.replace('var(--primary-color)', '#fbbf24');

fs.writeFileSync('src/components/StarRating.css', css, 'utf8');

console.log('✓ Fixed half-filled star color to match yellow filled stars');
