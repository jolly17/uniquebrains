import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const routes = {
  '/courses': {
    title: 'Free Courses for Neurodivergent Learners | UniqueBrains',
    description: 'Explore free courses designed for neurodivergent learners. Anyone can teach, anyone can learn. Connect with passionate instructors who celebrate unique learning styles.',
    url: 'https://uniquebrains.org/courses',
    keywords: 'neurodiversity courses, neurodivergent learning, ADHD courses, autism courses, dyslexia courses, free online learning, special education courses'
  },
  '/community': {
    title: 'Community Support for Neurodiverse Families | UniqueBrains',
    description: 'Connect with other parents, share experiences, and get support from people who understand. Join our supportive community for neurodiverse families.',
    url: 'https://uniquebrains.org/community',
    keywords: 'neurodiversity community, parent support, ADHD support, autism support, neurodiverse families, parenting community'
  },
  '/content': {
    title: 'Neurodiversity Content & Resources | UniqueBrains',
    description: 'Tired of explaining the same things over and over to family, teachers, and friends who just don\'t get it? Use our curated content to help them finally understand your world.',
    url: 'https://uniquebrains.org/content',
    keywords: 'neurodiversity resources, autism resources, ADHD resources, neurodivergent content, special education resources'
  },
  '/content/neurodiversity': {
    title: 'Understanding Neurodiversity | UniqueBrains',
    description: 'Learn about neurodiversity and how different brains work. Resources to help explain neurodivergent experiences to others.',
    url: 'https://uniquebrains.org/content/neurodiversity',
    keywords: 'neurodiversity, neurodivergent, ADHD, autism, dyslexia, understanding neurodiversity'
  },
  '/content/sensory-differences': {
    title: 'Sensory Differences & Processing | UniqueBrains',
    description: 'Understanding sensory processing differences in neurodivergent individuals. Resources for families and educators.',
    url: 'https://uniquebrains.org/content/sensory-differences',
    keywords: 'sensory processing, sensory differences, autism sensory, ADHD sensory, neurodivergent sensory'
  }
};

function updateMetaTags(filePath, meta) {
  let html = readFileSync(filePath, 'utf-8');
  
  // Update title
  html = html.replace(
    /<title>.*?<\/title>/,
    `<title>${meta.title}</title>`
  );
  
  // Update description
  html = html.replace(
    /<meta name="description" content=".*?">/,
    `<meta name="description" content="${meta.description}">`
  );
  
  // Update keywords
  html = html.replace(
    /<meta name="keywords" content=".*?">/,
    `<meta name="keywords" content="${meta.keywords}">`
  );
  
  // Update canonical URL
  html = html.replace(
    /<link rel="canonical" href=".*?">/,
    `<link rel="canonical" href="${meta.url}">`
  );
  
  // Update OG tags
  html = html.replace(
    /<meta property="og:url" content=".*?">/,
    `<meta property="og:url" content="${meta.url}">`
  );
  
  html = html.replace(
    /<meta property="og:title" content=".*?">/,
    `<meta property="og:title" content="${meta.title}">`
  );
  
  html = html.replace(
    /<meta property="og:description" content=".*?">/,
    `<meta property="og:description" content="${meta.description}">`
  );
  
  // Update Twitter tags
  html = html.replace(
    /<meta property="twitter:url" content=".*?">/,
    `<meta property="twitter:url" content="${meta.url}">`
  );
  
  html = html.replace(
    /<meta property="twitter:title" content=".*?">/,
    `<meta property="twitter:title" content="${meta.title}">`
  );
  
  html = html.replace(
    /<meta property="twitter:description" content=".*?">/,
    `<meta property="twitter:description" content="${meta.description}">`
  );
  
  writeFileSync(filePath, html, 'utf-8');
  console.log(`✓ Updated meta tags for ${filePath}`);
}

// Update meta tags for each route
Object.entries(routes).forEach(([route, meta]) => {
  const filePath = join('docs', route, 'index.html');
  try {
    updateMetaTags(filePath, meta);
  } catch (error) {
    console.error(`✗ Failed to update ${filePath}:`, error.message);
  }
});

console.log('\n✓ All meta tags updated successfully!');
