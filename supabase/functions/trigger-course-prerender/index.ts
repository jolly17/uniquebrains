/**
 * Supabase Edge Function: trigger-course-prerender
 * 
 * Called by a Supabase Database Webhook when a course is inserted or updated.
 * Triggers a GitHub Actions workflow via repository_dispatch to regenerate
 * the pre-rendered course OG meta tag pages.
 * 
 * Setup:
 * 1. Create a GitHub Personal Access Token (PAT) with 'repo' scope
 * 2. Add it as a Supabase secret: GITHUB_PAT
 * 3. Set up a Database Webhook in Supabase Dashboard:
 *    - Table: courses
 *    - Events: INSERT, UPDATE
 *    - Type: Supabase Edge Function
 *    - Function: trigger-course-prerender
 */
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const GITHUB_PAT = Deno.env.get('GITHUB_PAT')
const GITHUB_REPO = 'jolly17/uniquebrains'

// Debounce: Don't trigger more than once every 2 minutes
let lastTriggerTime = 0
const DEBOUNCE_MS = 2 * 60 * 1000 // 2 minutes

interface WebhookPayload {
  type: 'INSERT' | 'UPDATE' | 'DELETE'
  table: string
  record: {
    id: string
    title: string
    status: string
    is_published: boolean
    [key: string]: unknown
  }
  old_record?: {
    id: string
    title: string
    status: string
    is_published: boolean
    [key: string]: unknown
  }
}

serve(async (req) => {
  console.log('=== Course Prerender Trigger ===')
  console.log('Method:', req.method)

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (!GITHUB_PAT) {
      throw new Error('GITHUB_PAT secret is not configured. Please add it in Supabase Dashboard → Edge Functions → Secrets.')
    }

    // Parse the webhook payload
    const payload: WebhookPayload = await req.json()
    console.log('Webhook event:', payload.type, 'on table:', payload.table)
    console.log('Course:', payload.record?.title, '(ID:', payload.record?.id, ')')

    // Only trigger for published courses or courses that just got published/unpublished
    const isPublished = payload.record?.is_published && payload.record?.status === 'published'
    const wasPublished = payload.old_record?.is_published && payload.old_record?.status === 'published'
    const publishStateChanged = isPublished !== wasPublished

    if (!isPublished && !publishStateChanged) {
      console.log('Skipping: Course is not published and publish state did not change')
      return new Response(
        JSON.stringify({ message: 'Skipped: course not published' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Debounce: prevent rapid-fire triggers
    const now = Date.now()
    if (now - lastTriggerTime < DEBOUNCE_MS) {
      console.log('Skipping: debounce active (last trigger was', Math.round((now - lastTriggerTime) / 1000), 'seconds ago)')
      return new Response(
        JSON.stringify({ message: 'Skipped: debounce active, will be picked up by next trigger' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Trigger GitHub Actions workflow via repository_dispatch
    console.log('Triggering GitHub Actions workflow...')
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/dispatches`,
      {
        method: 'POST',
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'Authorization': `token ${GITHUB_PAT}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_type: 'course-updated',
          client_payload: {
            course_id: payload.record?.id,
            course_title: payload.record?.title,
            event: payload.type,
            triggered_at: new Date().toISOString(),
          },
        }),
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`GitHub API error (${response.status}): ${errorText}`)
    }

    lastTriggerTime = now
    console.log('✅ GitHub Actions workflow triggered successfully!')

    return new Response(
      JSON.stringify({
        success: true,
        message: 'GitHub Actions workflow triggered',
        course: payload.record?.title,
        event: payload.type,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('❌ Error:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
