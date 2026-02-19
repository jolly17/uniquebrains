# Scripts Documentation

## generate-sitemap.js

Automatically generates a dynamic sitemap.xml file that includes all pages from your Supabase database.

### What It Does

Fetches data from Supabase and generates a complete sitemap including:
- **Static pages** (10 pages): Home, courses, community, content pages, auth pages, legal pages
- **Course pages** (7 courses): Individual course detail pages
- **Instructor profiles** (2 instructors): Individual instructor profile pages
- **Community topics** (6 topics): Topic landing pages
- **Community questions** (6 questions): Individual question pages

**Total URLs in sitemap: 31**

### When It Runs

The sitemap is automatically regenerated:
1. **Before every build**: Via `prebuild` script in package.json
2. **Manually**: Run `npm run generate-sitemap`

### How It Works

1. Connects to Supabase using credentials from `.env` file
2. Fetches all courses, instructors, topics, and questions
3. Generates XML sitemap with proper priorities and change frequencies
4. Saves to `docs/sitemap.xml`

### Priority Levels

- **1.0** - Homepage (highest priority)
- **0.9** - Courses listing page
- **0.8** - Individual courses, content pages, community
- **0.7** - Instructors, community topics, neurodiversity content
- **0.6** - Individual questions
- **0.5** - Auth pages (login, register)
- **0.3** - Legal pages (privacy, terms)

### Change Frequencies

- **Daily** - Homepage, courses, community (content changes frequently)
- **Weekly** - Individual courses, instructors, questions
- **Monthly** - Content pages, auth pages
- **Yearly** - Legal pages

### Requirements

- `.env` file with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Internet connection to fetch data from Supabase

### Output

Generates `docs/sitemap.xml` in standard XML sitemap format that search engines can crawl.

### SEO Benefits

- Search engines discover all your pages automatically
- Proper priority signals help search engines understand page importance
- Change frequencies help search engines know when to re-crawl
- Last modified dates show content freshness

### Troubleshooting

If the script fails:
1. Check that `.env` file exists with correct Supabase credentials
2. Verify internet connection
3. Check Supabase database is accessible
4. Review console output for specific error messages

### Manual Usage

```bash
# Generate sitemap manually
npm run generate-sitemap

# Build (automatically generates sitemap first)
npm run build

# Deploy (builds and deploys, sitemap included)
npm run deploy
```
