import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables
dotenv.config()

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Supabase credentials not found in environment variables')
  console.error('Make sure .env file exists with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const BASE_URL = 'https://uniquebrains.org'
const DEFAULT_IMAGE = `${BASE_URL}/uniquebrains-thumbnail.png.png`
const DOCS_DIR = path.join(__dirname, '../docs')
const PUBLIC_DIR = path.join(__dirname, '../public')

// Read mascot image and convert to base64 data URI for embedding in SVG
const MASCOT_PATH = path.join(PUBLIC_DIR, 'Uniquebrains-mascot.png')
const MASCOT_BASE64 = fs.existsSync(MASCOT_PATH)
  ? `data:image/png;base64,${fs.readFileSync(MASCOT_PATH).toString('base64')}`
  : `${BASE_URL}/Uniquebrains-mascot.png`

/**
 * Category-to-icon mapping (matches src/data/constants.js COURSE_CATEGORIES)
 * Each category maps to: emoji icon, display label, and gradient colors for generated OG images
 */
const CATEGORY_MAP = {
  'performing-arts': { icon: '🎭', label: 'Performing Arts', colors: ['#e91e63', '#9c27b0'] },
  'visual-arts':     { icon: '🎨', label: 'Visual Arts',     colors: ['#ff5722', '#e91e63'] },
  'parenting':       { icon: '👨‍👩‍👧‍👦', label: 'Parenting',       colors: ['#4caf50', '#009688'] },
  'academics':       { icon: '📚', label: 'Academics',       colors: ['#2196f3', '#3f51b5'] },
  'language':        { icon: '🌍', label: 'Language',        colors: ['#00bcd4', '#2196f3'] },
  'spirituality':    { icon: '🧘', label: 'Spirituality',    colors: ['#9c27b0', '#673ab7'] },
  'lifeskills':      { icon: '🐷', label: 'Life Skills',     colors: ['#ff9800', '#f44336'] },
  'hobbies':         { icon: '🎮', label: 'Hobbies & Fun',   colors: ['#8bc34a', '#4caf50'] },
}

// Default fallback for unknown categories
const DEFAULT_CATEGORY = { icon: '🌟', label: 'Course', colors: ['#7c3aed', '#6978e1'] }

/**
 * Generate an SVG-based OG image for a category (1200x630)
 * This creates a visually appealing card with the category emoji, 
 * course title, and UniqueBrains branding
 */
function generateCategoryOgSvg(course, categoryInfo) {
  const { icon, colors } = categoryInfo
  // Truncate title for the SVG (max ~60 chars to fit nicely)
  const title = course.title.length > 60 
    ? course.title.substring(0, 57) + '...' 
    : course.title
  
  // Escape XML special characters for SVG
  const safeTitle = title
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

  const instructorName = course.profiles
    ? `${course.profiles.first_name || ''} ${course.profiles.last_name || ''}`.trim()
    : 'UniqueBrains Instructor'
  const safeInstructor = instructorName
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const categoryLabel = categoryInfo.label
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
    </linearGradient>
    <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" style="stop-color:#000;stop-opacity:0" />
      <stop offset="100%" style="stop-color:#000;stop-opacity:0.3" />
    </linearGradient>
  </defs>
  
  <!-- Background gradient -->
  <rect width="1200" height="630" fill="url(#bg)" rx="0"/>
  <rect width="1200" height="630" fill="url(#overlay)" rx="0"/>
  
  <!-- Decorative circles -->
  <circle cx="1050" cy="120" r="200" fill="white" opacity="0.08"/>
  <circle cx="150" cy="530" r="150" fill="white" opacity="0.06"/>
  
  <!-- Category emoji (large) -->
  <text x="100" y="220" font-size="120" font-family="Apple Color Emoji, Segoe UI Emoji, Noto Color Emoji, sans-serif">${icon}</text>
  
  <!-- Course title -->
  <text x="100" y="340" font-size="48" font-weight="bold" fill="white" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    ${safeTitle}
  </text>
  
  <!-- Instructor name -->
  <text x="100" y="400" font-size="28" fill="white" opacity="0.9" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    👨‍🏫 ${safeInstructor}
  </text>
  
  <!-- Category badge -->
  <rect x="100" y="430" width="${categoryLabel.length * 16 + 40}" height="44" rx="22" fill="white" opacity="0.2"/>
  <text x="120" y="460" font-size="22" fill="white" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    ${icon} ${categoryLabel}
  </text>
  
  <!-- UniqueBrains branding with mascot -->
  <image href="${MASCOT_BASE64}" x="80" y="520" width="80" height="80" opacity="0.95"/>
  <text x="170" y="570" font-size="32" font-weight="bold" fill="white" opacity="0.9" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    UniqueBrains
  </text>
  <text x="170" y="600" font-size="18" fill="white" opacity="0.7" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    Where the Neurodiverse Community Connects and Thrives
  </text>
  
  <!-- Free badge (if applicable) -->
  ${course.price === 0 ? `
  <rect x="1020" y="40" width="140" height="50" rx="25" fill="white" opacity="0.95"/>
  <text x="1090" y="73" font-size="24" font-weight="bold" fill="${colors[0]}" text-anchor="middle" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif">
    FREE
  </text>` : ''}
</svg>`
}

/**
 * Escape HTML special characters to prevent XSS in meta tags
 */
function escapeHtml(text) {
  if (!text) return ''
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#039;')
}

/**
 * Truncate description to a reasonable length for OG tags
 */
function truncateDescription(text, maxLength = 200) {
  if (!text) return 'Join this course on UniqueBrains - Where the Neurodiverse Community Connects and Thrives'
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

/**
 * Get the OG image URL for a course based on its category
 * 
 * Priority:
 * 1. Category-specific PNG image (if designer has provided one at /images/categories/{category}.png)
 * 2. Default site thumbnail as fallback
 * 
 * NOTE: Most social media platforms (Facebook, WhatsApp, LinkedIn) do NOT support SVG.
 * OG images MUST be PNG or JPG format, ideally 1200x630px.
 * The generated SVG files are kept as visual references for the designer.
 */
function getCourseOgImage(course) {
  const category = course.category || 'default'
  const categoryImagePath = path.join(DOCS_DIR, 'images', 'categories', `${category}.png`)
  
  // Check if a designer-provided category PNG exists
  if (fs.existsSync(categoryImagePath)) {
    return `${BASE_URL}/images/categories/${category}.png`
  }
  
  // Fallback to default thumbnail
  return DEFAULT_IMAGE
}

/**
 * Generate an HTML page with proper OG meta tags for a course
 * This page serves two purposes:
 * 1. Social media crawlers see the OG tags (they don't execute JS)
 * 2. Real users get redirected to the SPA which takes over rendering
 */
function generateCourseHtml(course) {
  const title = escapeHtml(`${course.title} - UniqueBrains`)
  const description = escapeHtml(truncateDescription(course.description))
  const url = `${BASE_URL}/courses/${course.id}`
  const image = getCourseOgImage(course)
  const instructorName = course.profiles
    ? `${course.profiles.first_name || ''} ${course.profiles.last_name || ''}`.trim()
    : 'UniqueBrains Instructor'
  const categoryInfo = CATEGORY_MAP[course.category] || DEFAULT_CATEGORY
  const category = escapeHtml(categoryInfo.label)
  const price = course.price === 0 ? 'Free' : `$${course.price}`

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/png" href="/Uniquebrains-mascot.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- Primary Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}" />
    <meta name="keywords" content="neurodiversity, ${category}, online course, neurodivergent learning, ${escapeHtml(course.title)}" />
    <meta name="author" content="${escapeHtml(instructorName)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${url}" />
    
    <!-- Open Graph / Facebook / WhatsApp -->
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:image" content="${escapeHtml(image)}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${title}" />
    <meta property="og:site_name" content="UniqueBrains" />
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${url}" />
    <meta property="twitter:title" content="${title}" />
    <meta property="twitter:description" content="${description}" />
    <meta property="twitter:image" content="${escapeHtml(image)}" />
    
    <!-- Structured Data (JSON-LD) for Course -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "${title}",
      "description": "${description}",
      "url": "${url}",
      "provider": {
        "@type": "Organization",
        "name": "UniqueBrains",
        "url": "${BASE_URL}"
      },
      "instructor": {
        "@type": "Person",
        "name": "${escapeHtml(instructorName)}"
      },
      "isAccessibleForFree": ${course.price === 0 ? 'true' : 'false'},
      "offers": {
        "@type": "Offer",
        "price": "${course.price || 0}",
        "priceCurrency": "USD",
        "availability": "https://schema.org/InStock"
      }
    }
    </script>

    <!-- Google Analytics -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-81HF8BMHMH"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-81HF8BMHMH', { send_page_view: false });
    </script>

    <!-- SPA Redirect: Send real users to the app -->
    <script type="text/javascript">
      // Social media crawlers won't execute this JS, so they see the meta tags above.
      // Real users get redirected to the SPA root which handles client-side routing.
      (function() {
        // Check if this is a real browser (not a crawler)
        var isBot = /bot|crawl|spider|slurp|facebookexternalhit|Twitterbot|WhatsApp|LinkedInBot|Discordbot|TelegramBot/i.test(navigator.userAgent);
        if (!isBot) {
          // Let the SPA handle routing - redirect to root with path info
          var l = window.location;
          l.replace(
            l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
            '/?/' + l.pathname.slice(1).replace(/&/g, '~and~') +
            (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
            l.hash
          );
        }
      })();
    </script>
  </head>
  <body>
    <div id="root">
      <!-- Fallback content for crawlers and no-JS users -->
      <div style="max-width: 800px; margin: 0 auto; padding: 2rem; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <a href="${BASE_URL}" style="text-decoration: none;">
          <img src="/uniquebrains-logo.png.png" alt="UniqueBrains" style="height: 60px; width: auto;" />
        </a>
        <h1 style="color: #1a1a2e; margin-top: 1.5rem;">${title}</h1>
        <p style="color: #666; font-size: 1.1rem;">${description}</p>
        <p style="color: #7c3aed; font-weight: 600;">👨‍🏫 Instructor: ${escapeHtml(instructorName)}</p>
        <p style="color: #7c3aed; font-weight: 600;">💰 Price: ${price}</p>
        <p style="color: #7c3aed; font-weight: 600;">📂 Category: ${category}</p>
        <a href="${url}" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #7c3aed, #6978e1); color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
          View Course on UniqueBrains
        </a>
      </div>
    </div>
  </body>
</html>`
}

/**
 * Fetch all published courses from Supabase
 */
async function fetchPublishedCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select(`
        id, title, description, category, price,
        course_type, is_self_paced, age_group,
        profiles!instructor_id(first_name, last_name)
      `)
      .eq('status', 'published')
      .eq('is_published', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

/**
 * Main function: Pre-render course pages with OG meta tags
 */
async function prerenderCoursePages() {
  console.log('🚀 Pre-rendering course pages with OG meta tags...\n')

  // Ensure output directories exist
  const courseImagesDir = path.join(DOCS_DIR, 'images', 'courses')
  fs.mkdirSync(courseImagesDir, { recursive: true })

  // Also create in public for dev server
  const publicCourseImagesDir = path.join(PUBLIC_DIR, 'images', 'courses')
  fs.mkdirSync(publicCourseImagesDir, { recursive: true })

  // Fetch all published courses
  const courses = await fetchPublishedCourses()
  console.log(`📚 Found ${courses.length} published courses\n`)

  if (courses.length === 0) {
    console.log('⚠️  No published courses found. Skipping pre-rendering.')
    return
  }

  let successCount = 0
  let errorCount = 0

  for (const course of courses) {
    try {
      // Get category info for this course
      const categoryInfo = CATEGORY_MAP[course.category] || DEFAULT_CATEGORY

      // 1. Generate the SVG OG image for this course
      const svgContent = generateCategoryOgSvg(course, categoryInfo)
      const svgFileName = `${course.id}-og.svg`
      
      // Write to docs (production)
      fs.writeFileSync(path.join(courseImagesDir, svgFileName), svgContent, 'utf-8')
      // Write to public (dev)
      fs.writeFileSync(path.join(publicCourseImagesDir, svgFileName), svgContent, 'utf-8')

      // 2. Create directory for the course HTML
      const courseDir = path.join(DOCS_DIR, 'courses', course.id)
      fs.mkdirSync(courseDir, { recursive: true })

      // 3. Generate and write the HTML file with OG meta tags
      const html = generateCourseHtml(course)
      const filePath = path.join(courseDir, 'index.html')
      fs.writeFileSync(filePath, html, 'utf-8')

      console.log(`   ✅ ${categoryInfo.icon} ${course.title} → /courses/${course.id}/`)
      successCount++
    } catch (error) {
      console.error(`   ❌ Failed: ${course.title} (${course.id}): ${error.message}`)
      errorCount++
    }
  }

  console.log(`\n✅ Pre-rendering complete!`)
  console.log(`   Success: ${successCount} | Failed: ${errorCount}`)
  console.log(`   HTML pages: ${path.join(DOCS_DIR, 'courses/')}`)
  console.log(`   OG images:  ${courseImagesDir}\n`)
}

// Run the pre-renderer
prerenderCoursePages().catch(error => {
  console.error('❌ Error pre-rendering course pages:', error)
  process.exit(1)
})
