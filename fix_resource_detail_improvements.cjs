const fs = require('fs');

let content = fs.readFileSync('src/pages/ResourceDetailPage.jsx', 'utf8');

// 1. Fix double arrow - replace ←← with single ←
content = content.replace(/←← Back to/g, '← Back to');

// 2. Make map marker clickable to open Google Maps
// Replace the iframe + link with just an iframe that has onclick
content = content.replace(
  /<div className="resource-map">\s+<iframe[\s\S]*?title="Resource location map"\s+\/>\s+<a[\s\S]*?<\/a>\s+<\/div>/,
  `<div className="resource-map">
              <iframe
                width="100%"
                height="300"
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                src={\`https://www.openstreetmap.org/export/embed.html?bbox=\${resource.coordinates.lng-0.01},\${resource.coordinates.lat-0.01},\${resource.coordinates.lng+0.01},\${resource.coordinates.lat+0.01}&layer=mapnik&marker=\${resource.coordinates.lat},\${resource.coordinates.lng}\`}
                title="Resource location map"
                style={{ cursor: 'pointer' }}
                onClick={() => window.open(\`https://www.google.com/maps/search/?api=1&query=\${resource.coordinates.lat},\${resource.coordinates.lng}\`, '_blank')}
              />
            </div>`
);

// 3. Replace share buttons with functional icon buttons
content = content.replace(
  /<div className="share-section">[\s\S]*?<\/div>\s+<\/div>/,
  `<div className="share-section">
          <h3>Share this resource</h3>
          <div className="share-buttons">
            <button 
              className="share-icon-btn" 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
              }}
              title="Copy link"
              aria-label="Copy link to clipboard"
            >
              🔗
            </button>
            <button 
              className="share-icon-btn"
              onClick={() => {
                const subject = encodeURIComponent(\`Check out \${resource.name}\`);
                const body = encodeURIComponent(\`I found this resource that might interest you: \${window.location.href}\`);
                window.location.href = \`mailto:?subject=\${subject}&body=\${body}\`;
              }}
              title="Share via email"
              aria-label="Share via email"
            >
              ✉️
            </button>
            <button 
              className="share-icon-btn"
              onClick={() => {
                const text = encodeURIComponent(\`Check out \${resource.name}: \${window.location.href}\`);
                window.open(\`https://wa.me/?text=\${text}\`, '_blank');
              }}
              title="Share on WhatsApp"
              aria-label="Share on WhatsApp"
            >
              💬
            </button>
          </div>
        </div>`
);

fs.writeFileSync('src/pages/ResourceDetailPage.jsx', content, 'utf8');

// 4. Update CSS for share icon buttons
let css = fs.readFileSync('src/pages/ResourceDetailPage.css', 'utf8');

// Remove old share button styles and add new icon button styles
if (!css.includes('.share-icon-btn')) {
  css += `

.share-icon-btn {
  background: none;
  border: none;
  font-size: 2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: transform 0.2s;
  border-radius: 8px;
}

.share-icon-btn:hover {
  transform: scale(1.2);
  background-color: rgba(0, 0, 0, 0.05);
}

.share-buttons {
  display: flex;
  gap: 1rem;
  align-items: center;
}
`;
}

fs.writeFileSync('src/pages/ResourceDetailPage.css', css, 'utf8');

// 5. Add meta tags to index.html for better social sharing
let indexHtml = fs.readFileSync('index.html', 'utf8');

if (!indexHtml.includes('og:title')) {
  // Add Open Graph and Twitter Card meta tags
  const metaTags = `
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://jolly17.github.io/uniquebrains/">
    <meta property="og:title" content="UniqueBrains - Neurodiversity Support & Resources">
    <meta property="og:description" content="Comprehensive resources and support for neurodivergent individuals and families">
    <meta property="og:image" content="https://jolly17.github.io/uniquebrains/og-image.png">

    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://jolly17.github.io/uniquebrains/">
    <meta property="twitter:title" content="UniqueBrains - Neurodiversity Support & Resources">
    <meta property="twitter:description" content="Comprehensive resources and support for neurodivergent individuals and families">
    <meta property="twitter:image" content="https://jolly17.github.io/uniquebrains/og-image.png">
  `;
  
  indexHtml = indexHtml.replace('</head>', metaTags + '\n  </head>');
  fs.writeFileSync('index.html', indexHtml, 'utf8');
}

console.log('✓ Fixed double arrow in back link');
console.log('✓ Made map clickable to open Google Maps');
console.log('✓ Replaced share buttons with functional icon buttons');
console.log('✓ Updated CSS for share icon buttons');
console.log('✓ Added Open Graph and Twitter Card meta tags');
