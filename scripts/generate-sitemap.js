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

// Static pages with their priorities and change frequencies
const staticPages = [
  { url: '/', priority: '1.0', changefreq: 'daily' },
  { url: '/courses', priority: '0.9', changefreq: 'daily' },
  { url: '/community', priority: '0.8', changefreq: 'daily' },
  { url: '/content', priority: '0.8', changefreq: 'weekly' },
  { url: '/content/neurodiversity', priority: '0.7', changefreq: 'monthly' },
  { url: '/content/sensory-differences', priority: '0.7', changefreq: 'monthly' },
  { url: '/login', priority: '0.5', changefreq: 'monthly' },
  { url: '/register', priority: '0.5', changefreq: 'monthly' },
  { url: '/privacy-policy', priority: '0.3', changefreq: 'yearly' },
  { url: '/terms-of-service', priority: '0.3', changefreq: 'yearly' }
]

function formatDate(date) {
  return date.toISOString().split('T')[0]
}

function generateUrlEntry(url, lastmod, changefreq, priority) {
  return `  <url>
    <loc>${BASE_URL}${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`
}

async function fetchCourses() {
  try {
    const { data, error } = await supabase
      .from('courses')
      .select('id, updated_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching courses:', error)
    return []
  }
}

async function fetchInstructors() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, updated_at')
      .eq('role', 'instructor')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching instructors:', error)
    return []
  }
}

async function fetchTopics() {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('slug, updated_at')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching topics:', error)
    return []
  }
}

async function fetchQuestions() {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('id, topic_id, updated_at, topics!inner(slug)')
      .order('updated_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching questions:', error)
    return []
  }
}

async function generateSitemap() {
  console.log('🚀 Generating dynamic sitemap...')

  const today = formatDate(new Date())
  let urls = []

  // Add static pages
  console.log('📄 Adding static pages...')
  staticPages.forEach(page => {
    urls.push(generateUrlEntry(page.url, today, page.changefreq, page.priority))
  })

  // Fetch and add courses
  console.log('📚 Fetching courses...')
  const courses = await fetchCourses()
  console.log(`   Found ${courses.length} courses`)
  courses.forEach(course => {
    const lastmod = course.updated_at ? formatDate(new Date(course.updated_at)) : today
    urls.push(generateUrlEntry(`/courses/${course.id}`, lastmod, 'weekly', '0.8'))
  })

  // Fetch and add instructors
  console.log('👨‍🏫 Fetching instructors...')
  const instructors = await fetchInstructors()
  console.log(`   Found ${instructors.length} instructors`)
  instructors.forEach(instructor => {
    const lastmod = instructor.updated_at ? formatDate(new Date(instructor.updated_at)) : today
    urls.push(generateUrlEntry(`/instructor/${instructor.id}`, lastmod, 'weekly', '0.7'))
  })

  // Fetch and add community topics
  console.log('💬 Fetching community topics...')
  const topics = await fetchTopics()
  console.log(`   Found ${topics.length} topics`)
  topics.forEach(topic => {
    const lastmod = topic.updated_at ? formatDate(new Date(topic.updated_at)) : today
    urls.push(generateUrlEntry(`/community/${topic.slug}`, lastmod, 'daily', '0.7'))
  })

  // Fetch and add community questions
  console.log('❓ Fetching community questions...')
  const questions = await fetchQuestions()
  console.log(`   Found ${questions.length} questions`)
  questions.forEach(question => {
    const topicSlug = question.topics?.slug
    if (topicSlug) {
      const lastmod = question.updated_at ? formatDate(new Date(question.updated_at)) : today
      urls.push(generateUrlEntry(`/community/${topicSlug}/question/${question.id}`, lastmod, 'weekly', '0.6'))
    }
  })

  // Generate XML
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  // Write to file
  const sitemapPath = path.join(__dirname, '../docs/sitemap.xml')
  fs.writeFileSync(sitemapPath, sitemap, 'utf8')

  console.log(`✅ Sitemap generated successfully!`)
  console.log(`   Total URLs: ${urls.length}`)
  console.log(`   Location: ${sitemapPath}`)
}

// Run the generator
generateSitemap().catch(error => {
  console.error('❌ Error generating sitemap:', error)
  process.exit(1)
})
