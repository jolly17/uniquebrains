// Supabase Edge Function for sending appreciation emails to students after sessions
// Scheduled to run daily at 5 PM GMT via cron job
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SessionData {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  courseId: string
  courseTitle: string
  instructorName: string
}

serve(async (req) => {
  console.log('=== Appreciation Email Function Invoked ===')
  console.log('Method:', req.method)
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method === 'GET') {
    console.log('GET request - no body to parse')
  }
  
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Calculate time window: sessions that happened in the last 24 hours
    const now = new Date()
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    console.log('Searching for sessions between:', twentyFourHoursAgo.toISOString(), 'and', now.toISOString())

    // Query sessions that happened in the last 24 hours
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        session_date,
        course_id,
        courses (
          id,
          title,
          instructor_id,
          profiles (
            id,
            full_name
          )
        )
      `)
      .eq('status', 'scheduled')
      .gte('session_date', twentyFourHoursAgo.toISOString())
      .lte('session_date', now.toISOString())

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    console.log(`Found ${sessions?.length || 0} sessions in the last 24 hours`)

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No sessions found in the last 24 hours', count: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailsSent = 0
    let emailsFailed = 0

    // Process each session
    for (const session of sessions) {
      try {
        console.log(`Processing session: ${session.title} (${session.id})`)

        // Get enrolled students for this course
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('enrollments')
          .select(`
            student_id,
            profiles (
              id,
              full_name,
              email
            )
          `)
          .eq('course_id', session.course_id)
          .eq('status', 'active')

        if (enrollmentsError) {
          console.error(`Error fetching enrollments for course ${session.course_id}:`, enrollmentsError)
          emailsFailed++
          continue
        }

        console.log(`Found ${enrollments?.length || 0} enrolled students`)

        // Prepare session data
        const sessionData: SessionData = {
          sessionId: session.id,
          sessionTitle: session.title,
          sessionDate: session.session_date,
          courseId: session.courses.id,
          courseTitle: session.courses.title,
          instructorName: session.courses.profiles.full_name
        }

        // Send appreciation email to all enrolled students
        if (enrollments && enrollments.length > 0) {
          for (const enrollment of enrollments) {
            if (enrollment.profiles?.email) {
              try {
                await sendAppreciationEmail(
                  sessionData,
                  enrollment.profiles.full_name,
                  enrollment.profiles.email
                )
                emailsSent++
                console.log(`✓ Sent appreciation email to: ${enrollment.profiles.email}`)
              } catch (error) {
                console.error(`✗ Failed to send email to: ${enrollment.profiles.email}`, error)
                emailsFailed++
              }
            }
          }
        }

      } catch (error) {
        console.error(`Error processing session ${session.id}:`, error)
        emailsFailed++
      }
    }

    console.log(`=== Summary ===`)
    console.log(`Sessions processed: ${sessions.length}`)
    console.log(`Emails sent: ${emailsSent}`)
    console.log(`Emails failed: ${emailsFailed}`)

    return new Response(
      JSON.stringify({ 
        success: true, 
        sessionsProcessed: sessions.length,
        emailsSent,
        emailsFailed
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('=== ERROR in Appreciation Email Function ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendAppreciationEmail(
  data: SessionData,
  studentName: string,
  studentEmail: string
) {
  const courseUrl = `https://uniquebrains.org/courses/${data.courseId}`
  const indiaDonateLink = 'https://milaap.org/fundraisers/support-autistic-kids-1'
  const internationalDonateLink = 'https://www.gofundme.com/f/help-me-support-autism-awareness-and-families-with-genai'

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
        .heart-icon { font-size: 3rem; margin-bottom: 1rem; }
        .message { font-size: 1.1rem; margin: 20px 0; color: #374151; }
        .highlight { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .action-section { margin: 30px 0; }
        .action-title { font-size: 1.2rem; font-weight: 600; color: #1f2937; margin-bottom: 15px; }
        .action-card { background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e5e7eb; }
        .action-card h3 { margin: 0 0 10px 0; color: #4f46e5; font-size: 1.1rem; }
        .action-card p { margin: 0 0 15px 0; color: #6b7280; font-size: 0.95rem; }
        .button { display: inline-block; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; text-align: center; transition: all 0.2s; margin: 5px; }
        .btn-primary { background: #4f46e5; color: #ffffff !important; }
        .btn-primary:hover { background: #4338ca; transform: translateY(-2px); }
        .btn-india { background: #10b981; color: #ffffff !important; }
        .btn-india:hover { background: #059669; transform: translateY(-2px); }
        .btn-international { background: #3b82f6; color: #ffffff !important; }
        .btn-international:hover { background: #2563eb; transform: translateY(-2px); }
        .donate-buttons { display: flex; gap: 10px; flex-wrap: wrap; }
        .gratitude { background: #ecfdf5; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center; border: 2px solid #10b981; }
        .gratitude-text { font-size: 1.1rem; color: #065f46; font-weight: 500; margin: 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .signature { margin-top: 30px; font-style: italic; color: #6b7280; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="heart-icon">💜</div>
          <h1>Thank You for Being Part of Our Journey!</h1>
        </div>
        <div class="content">
          <p class="message">Dear ${studentName},</p>
          
          <p class="message">
            We hope you enjoyed your recent session of <strong>${data.courseTitle}</strong> with ${data.instructorName}. 
            Your presence and participation make our community special, and we're grateful to have you as part of the UniqueBrains family.
          </p>

          <div class="highlight">
            <p style="margin: 0; font-size: 1.05rem;">
              <strong>🌟 Your voice matters!</strong> Every session, every interaction, and every moment of learning contributes to building 
              a more inclusive and understanding world for neurodiverse learners.
            </p>
          </div>

          <p class="message">
            If you found value in your learning experience, we would be deeply grateful if you could take a moment to support us in one of these meaningful ways:
          </p>

          <div class="action-section">
            <div class="action-card">
              <h3>📝 Share Your Experience</h3>
              <p>
                Your feedback helps other families discover courses that might change their lives. A few words about your experience 
                can make all the difference for someone searching for the right learning opportunity.
              </p>
              <a href="${courseUrl}" class="button btn-primary">Leave a Course Review</a>
            </div>

            <div class="action-card">
              <h3>💝 Help Keep UniqueBrains Free</h3>
              <p>
                We believe quality education should be accessible to all neurodiverse learners, regardless of their financial situation. 
                Your donation, no matter how small, helps us keep the platform free and continue supporting our community.
              </p>
              <div class="donate-buttons">
                <a href="${indiaDonateLink}" class="button btn-india">🇮🇳 Donate (India - Milaap)</a>
                <a href="${internationalDonateLink}" class="button btn-international">🌍 Donate (International - GoFundMe)</a>
              </div>
            </div>
          </div>

          <div class="gratitude">
            <p class="gratitude-text">
              "Together, we're creating a world where every neurodiverse learner can thrive. Thank you for being part of this mission." ✨
            </p>
          </div>

          <p class="message">
            Whether you choose to share your feedback, make a donation, or simply continue learning with us, 
            please know that your presence in our community is valued and appreciated.
          </p>

          <p class="signature">
            With heartfelt gratitude,<br>
            The UniqueBrains Team 💜<br>
            <em>Celebrating Neurodiversity in Learning</em>
          </p>
        </div>
        <div class="footer">
          <p>UniqueBrains - Empowering Neurodiverse Learners</p>
          <p><a href="https://uniquebrains.org" style="color: #4f46e5;">uniquebrains.org</a></p>
          <p style="font-size: 12px; color: #9ca3af; margin-top: 10px;">
            You received this email because you recently attended a session on UniqueBrains.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: studentEmail,
    subject: `💜 Thank you for learning with us, ${studentName}!`,
    html,
  })
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log('Attempting to send email to:', to)
  console.log('Subject:', subject)
  
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const emailPayload = {
    from: 'UniqueBrains <hello@uniquebrains.org>',
    to: [to],
    subject,
    html,
    reply_to: 'hello@uniquebrains.org',
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailPayload),
  })

  const responseData = await response.json()
  console.log('Resend API response status:', response.status)

  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${JSON.stringify(responseData)}`)
  }

  return responseData
}
