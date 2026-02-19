# Social Media Sharing Solution

## Current Status: ✅ IMPLEMENTED (with limitations)

React-snap has been successfully configured and is prerendering static pages. However, due to the async/dynamic nature of the application (Supabase data fetching), the prerendered pages contain the HTML structure but not the dynamic content.

## What's Working

1. **React-snap is installed and configured** in `package.json`
2. **Prerendering runs automatically** after each build via `postbuild` script
3. **Static pages are prerendered** including:
   - Home page (/)
   - Courses (/courses)
   - Content (/content)
   - Neurodiversity (/content/neurodiversity)
   - Sensory Differences (/content/sensory-differences)
   - Community (/community)
   - Privacy Policy (/privacy-policy)
   - Terms of Service (/terms-of-service)

4. **Meta tags are in place** for all pages with proper Open Graph and Twitter Card data
5. **Hydration support** added to `main.jsx` for seamless client-side takeover

## Limitations

### Why Dynamic Content Isn't Prerendered

Your app fetches data from Supabase (courses, instructors, community topics) which happens asynchronously after the page loads. React-snap captures the initial HTML before this data loads, so:

- Course listings won't show in prerendered HTML
- Instructor profiles won't be prerendered
- Community topics won't be prerendered
- Individual course pages won't be prerendered

### What Social Media Crawlers See

Social media crawlers (Facebook, Twitter, LinkedIn, WhatsApp) will see:
- ✅ Proper meta tags (title, description, image)
- ✅ Page structure and layout
- ❌ Dynamic content (courses, instructors, etc.)

## How It Works

1. **Build Process**: When you run `npm run build`, Vite builds the app and then react-snap automatically runs
2. **Crawling**: React-snap launches a headless browser and visits each configured route
3. **Snapshot**: It captures the HTML at that moment and saves it as `index.html` in each route folder
4. **Hydration**: When users visit, React hydrates the prerendered HTML for full interactivity

## Configuration

The react-snap configuration in `package.json`:

```json
"reactSnap": {
  "source": "docs",
  "include": [
    "/",
    "/courses",
    "/content",
    "/content/neurodiversity",
    "/content/sensory-differences",
    "/community",
    "/privacy-policy",
    "/terms-of-service"
  ]
}
```

## For Better Course-Specific Sharing

To get course-specific meta tags working, you would need one of these approaches:

### Option 1: Server-Side Rendering (SSR)
Convert to Next.js which can fetch data server-side and generate proper meta tags for each course.

**Pros:** Full dynamic meta tags, best SEO
**Cons:** Requires significant refactoring, hosting costs

### Option 2: Static Site Generation (SSG)
Generate static HTML for each course at build time.

**Pros:** Fast, works with GitHub Pages
**Cons:** Requires rebuild when courses change

### Option 3: Edge Functions
Use Cloudflare Workers or Vercel Edge Functions to intercept crawler requests and inject meta tags.

**Pros:** No rebuild needed, dynamic
**Cons:** Requires migration from GitHub Pages

### Option 4: Prerender.io Service
Use a paid service that prerenders pages on-demand for crawlers.

**Pros:** Works with current setup
**Cons:** Monthly cost ($20-200/month)

## Current Recommendation

For now, the default meta tags provide good branding for all shared links. If course-specific sharing becomes critical, consider migrating to Next.js with Vercel hosting for full SSR support.

## Files Modified

- `src/main.jsx` - Added hydration support
- `package.json` - Added react-snap configuration and postbuild script
- `index.html` - Already has proper meta tags

## Testing

To test prerendering locally:
1. Run `npm run build`
2. Check `docs/courses/index.html` - should contain prerendered HTML
3. Run `npm run preview` to test the built site

## Notes

- The MIME type warnings during build are expected with Vite's ES modules
- React-snap successfully crawls and prerenders all configured routes
- The 404 page warning can be ignored
