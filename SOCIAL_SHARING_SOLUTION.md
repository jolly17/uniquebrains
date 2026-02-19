# Social Media Sharing for Course Pages

## Current Limitation

Our application is a Single Page Application (SPA) built with React and hosted on GitHub Pages. When social media crawlers (WhatsApp, Facebook, Twitter, LinkedIn) visit a course URL, they only see the initial HTML without JavaScript execution, so they can't see course-specific meta tags that are dynamically generated.

## Current Implementation

- **Default meta tags** in `index.html` show UniqueBrains branding for all shared links
- **Dynamic meta tags** in `src/utils/metaTags.js` update for logged-in users but don't affect social crawlers

## Solutions

### Option 1: Prerendering Service (Recommended - Free)
Use a service like **Prerender.io** or **react-snap** to generate static HTML for each route.

**Steps:**
1. Install react-snap: `npm install --save-dev react-snap`
2. Add to package.json:
   ```json
   "scripts": {
     "postbuild": "react-snap"
   }
   ```
3. This generates static HTML for each route that crawlers can read

**Pros:** Free, works with GitHub Pages
**Cons:** Requires rebuild when content changes

### Option 2: Netlify/Vercel with Prerendering
Move hosting to Netlify or Vercel which have built-in prerendering.

**Pros:** Automatic, handles dynamic content
**Cons:** Requires migration from GitHub Pages

### Option 3: Server-Side Rendering (SSR)
Convert to Next.js or add a Node.js server.

**Pros:** Full dynamic meta tags, SEO benefits
**Cons:** Requires significant refactoring, hosting costs

### Option 4: Meta Tag Service
Use a service like **Metatags.io** or **Cloudflare Workers** to intercept crawler requests.

**Pros:** No code changes needed
**Cons:** Additional service dependency

## Quick Fix (Current)

Updated `index.html` to use the better thumbnail image (`uniquebrains-thumbnail.png.png`) so all shared links show proper branding, even if not course-specific.

## Recommended Next Step

Implement **Option 1 (react-snap)** as it's:
- Free
- Works with current GitHub Pages setup
- Minimal code changes
- Provides static HTML for crawlers

Would you like me to implement react-snap prerendering?
