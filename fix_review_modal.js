const fs = require('fs');

// Fix ReviewModal.jsx
let reviewModal = fs.readFileSync('src/components/ReviewModal.jsx', 'utf8');

// Remove first duplicate auth check (keep only the one with Sign In button)
const duplicatePattern = /  if \(!isOpen\) return null;\s+if \(!user\) \{\s+return \(\s+<div className="review-modal-overlay"[^}]+onClick={onClose} aria-label="Close modal"><\/button>\s+<\/div>\s+<div className="review-modal-body">\s+<p>You must be signed in to write a review\.<\/p>\s+<div className="review-modal-actions">\s+<button type="button" className="btn-cancel" onClick={onClose}>Close<\/button>\s+<\/div>\s+<\/div>\s+<\/div>\s+<\/div>\s+\);?\s+\}\s+\/\/ Show login prompt/s;

reviewModal = reviewModal.replace(duplicatePattern, '  if (!isOpen) return null;\n\n  // Show login prompt');

// Add star character to rating buttons
reviewModal = reviewModal.replace(
  /(aria-label=\{`Rate \$\{star\} stars`\}\s*>\s*)\s*(<\/button>)/g,
  '$1★$2'
);

// Add × to close buttons  
reviewModal = reviewModal.replace(
  /(aria-label="Close modal"\s*>\s*)\s*(<\/button>)/g,
  '$1×$2'
);

fs.writeFileSync('src/components/ReviewModal.jsx', reviewModal, 'utf8');

// Fix ResourceDetailPage.jsx
let resourceDetail = fs.readFileSync('src/pages/ResourceDetailPage.jsx', 'utf8');

// Add arrow to back links
resourceDetail = resourceDetail.replace(/ Back to \{milestone\}/g, '← Back to {milestone}');

fs.writeFileSync('src/pages/ResourceDetailPage.jsx', resourceDetail, 'utf8');

console.log('Files fixed successfully!');
