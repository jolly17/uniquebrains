#!/usr/bin/env python3
import re

# Fix ReviewModal.jsx
with open('src/components/ReviewModal.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove first duplicate auth check (lines 97-113)
content = re.sub(
    r'  if \(!isOpen\) return null;\s+if \(!user\) \{\s+return \(\s+<div className="review-modal-overlay"[^}]+\}\s+\}\s+\}\s+\);?\s+\}\s+// Show login prompt',
    '  if (!isOpen) return null;\n\n  // Show login prompt',
    content,
    flags=re.DOTALL
)

# Add star character to rating buttons
content = re.sub(
    r'(aria-label=\{`Rate \$\{star\} stars`\}\s*>\s*)\s*(</button>)',
    r'\1★\2',
    content
)

# Add × to close buttons
content = re.sub(
    r'(aria-label="Close modal"\s*>\s*)\s*(</button>)',
    r'\1×\2',
    content
)

with open('src/components/ReviewModal.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

# Fix ResourceDetailPage.jsx
with open('src/pages/ResourceDetailPage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add arrow to back links
content = content.replace(' Back to {milestone}', '← Back to {milestone}')

with open('src/pages/ResourceDetailPage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Files fixed successfully!")
