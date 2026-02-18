// Supabase Edge Function for sending session reminder emails via Resend
// This function should be scheduled to run daily via cron job
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SessionReminderData {
  sessionId: string
  sessionTitle: string
  sessionDate: string
  sessionTime: string
  duration: number
  meetingLink: string | null
  courseTitle: string
  courseId: string
  instructorName: string
  instructorEmail: string
  timezone: string
}

serve(async (req) => {
  console.log('=== Session Reminder Function Invoked ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle GET requests (no body to parse)
  if (req.method === 'GET') {
    console.log('GET request - no body to parse')
  }
  
  try {
    // Initialize Supabase client with service role key
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Calculate the time window for tomorrow (24 hours from now)
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    // Set time window: tomorrow at 00:00 to tomorrow at 23:59
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    console.log('Searching for sessions between:', tomorrowStart.toISOString(), 'and', tomorrowEnd.toISOString())

    // Query sessions happening tomorrow
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        session_date,
        duration_minutes,
        status,
        course_id,
        courses (
          id,
          title,
          instructor_id,
          timezone,
          meeting_link,
          profiles (
            id,
            full_name,
            email
          )
        )
      `)
      .eq('status', 'scheduled')
      .gte('session_date', tomorrowStart.toISOString())
      .lte('session_date', tomorrowEnd.toISOString())

    if (sessionsError) {
      console.error('Error fetching sessions:', sessionsError)
      throw sessionsError
    }

    console.log(`Found ${sessions?.length || 0} sessions happening tomorrow`)

    if (!sessions || sessions.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No sessions found for tomorrow', count: 0 }),
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
        const sessionData: SessionReminderData = {
          sessionId: session.id,
          sessionTitle: session.title,
          sessionDate: session.session_date,
          sessionTime: formatSessionTime(session.session_date, session.courses.timezone),
          duration: session.duration_minutes,
          meetingLink: session.courses.meeting_link,
          courseTitle: session.courses.title,
          courseId: session.courses.id,
          instructorName: session.courses.profiles.full_name,
          instructorEmail: session.courses.profiles.email,
          timezone: session.courses.timezone || 'UTC'
        }

        // Send reminder to instructor
        try {
          await sendInstructorReminderEmail(sessionData)
          emailsSent++
          console.log(`✓ Sent reminder to instructor: ${sessionData.instructorEmail}`)
        } catch (error) {
          console.error(`✗ Failed to send reminder to instructor: ${sessionData.instructorEmail}`, error)
          emailsFailed++
        }

        // Send reminders to all enrolled students
        if (enrollments && enrollments.length > 0) {
          for (const enrollment of enrollments) {
            if (enrollment.profiles?.email) {
              try {
                await sendStudentReminderEmail(
                  sessionData,
                  enrollment.profiles.full_name,
                  enrollment.profiles.email
                )
                emailsSent++
                console.log(`✓ Sent reminder to student: ${enrollment.profiles.email}`)
              } catch (error) {
                console.error(`✗ Failed to send reminder to student: ${enrollment.profiles.email}`, error)
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
    console.error('=== ERROR in Session Reminder Function ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function formatSessionTime(sessionDate: string, timezone: string): string {
  const date = new Date(sessionDate)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone,
    timeZoneName: 'short'
  }
  return date.toLocaleString('en-US', options)
}

function formatMultipleTimezones(sessionDate: string): string {
  const date = new Date(sessionDate)
  const timezones = [
    { name: 'IST', tz: 'Asia/Kolkata' },
    { name: 'GMT', tz: 'Europe/London' },
    { name: 'EST', tz: 'America/New_York' },
    { name: 'PST', tz: 'America/Los_Angeles' }
  ]
  
  const times = timezones.map(({ name, tz }) => {
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
      hour12: true
    }
    const time = date.toLocaleString('en-US', options)
    return `${time} ${name}`
  })
  
  return times.join(' | ')
}

function formatDateOnly(sessionDate: string): string {
  const date = new Date(sessionDate)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  return date.toLocaleString('en-US', options)
}

function generateGoogleCalendarLink(data: SessionReminderData): string {
  const startDate = new Date(data.sessionDate)
  const endDate = new Date(startDate.getTime() + data.duration * 60000)
  
  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }
  
  const title = encodeURIComponent(`${data.courseTitle}: ${data.sessionTitle}`)
  const description = encodeURIComponent(
    `Course: ${data.courseTitle}\nInstructor: ${data.instructorName}\n${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : 'Meeting link will be shared by instructor'}`
  )
  const location = encodeURIComponent(data.meetingLink || 'Online')
  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}`
}

async function sendInstructorReminderEmail(data: SessionReminderData) {
  const meetingLinkSection = data.meetingLink 
    ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #4f46e5;">${data.meetingLink}</a></p>`
    : `<p><em>Note: Please share the meeting link with your students before the session.</em></p>`

  const dateOnly = formatDateOnly(data.sessionDate)
  const timezones = formatMultipleTimezones(data.sessionDate)
  const calendarLink = generateGoogleCalendarLink(data)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .session-details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .timezone-box { background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Session Reminder - Tomorrow!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.instructorName},</p>
          
          <p>This is a friendly reminder that you have a session scheduled for <strong>tomorrow</strong>:</p>
          
          <div class="session-details">
            <h3 style="margin-top: 0;">${data.sessionTitle}</h3>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Date:</strong> ${dateOnly}</p>
            <p><strong>Duration:</strong> ${data.duration} minutes</p>
            ${meetingLinkSection}
          </div>
          
          <div class="timezone-box">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #065f46;">🌍 Session Time (Multiple Timezones):</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${timezones}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${calendarLink}" class="button" style="background: #059669; color: #ffffff !important; text-decoration: none;">📅 Add to Calendar</a>
          </div>
          
          <p>Make sure you're prepared and ready to inspire your students! 🌟</p>
          
          <a href="https://uniquebrains.org/teach/course/${data.courseId}/students" class="button" style="color: #ffffff !important;">View Course Dashboard</a>
          
          <p>If you need to make any changes, please update your course details or contact us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
          <p>Best wishes,</p>
          <p>The UniqueBrains Team</p>
        </div>
        <div class="footer">
          <p>UniqueBrains - Celebrating Neurodiversity in Learning</p>
          <p><a href="https://uniquebrains.org">uniquebrains.org</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: data.instructorEmail,
    subject: `Reminder: ${data.sessionTitle} - Tomorrow`,
    html,
  })
}

async function sendStudentReminderEmail(
  data: SessionReminderData,
  studentName: string,
  studentEmail: string
) {
  const meetingLinkSection = data.meetingLink 
    ? `<p><strong>Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #4f46e5;">${data.meetingLink}</a></p>`
    : `<p><em>Your instructor will share the meeting link before the session.</em></p>`

  const dateOnly = formatDateOnly(data.sessionDate)
  const timezones = formatMultipleTimezones(data.sessionDate)
  const calendarLink = generateGoogleCalendarLink(data)

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .session-details { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .timezone-box { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4f46e5; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Class Reminder - Tomorrow!</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName},</p>
          
          <p>This is a friendly reminder that you have a class session scheduled for <strong>tomorrow</strong>:</p>
          
          <div class="session-details">
            <h3 style="margin-top: 0;">${data.sessionTitle}</h3>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Instructor:</strong> ${data.instructorName}</p>
            <p><strong>Date:</strong> ${dateOnly}</p>
            <p><strong>Duration:</strong> ${data.duration} minutes</p>
            ${meetingLinkSection}
          </div>
          
          <div class="timezone-box">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🌍 Session Time (Multiple Timezones):</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${timezones}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${calendarLink}" class="button" style="background: #7c3aed; color: #ffffff !important; text-decoration: none;">📅 Add to Calendar</a>
          </div>
          
          <p>We're excited to see you in class! Don't forget to:</p>
          <ul>
            <li>Review any materials or homework beforehand</li>
            <li>Test your audio and video setup</li>
            <li>Join a few minutes early to get settled</li>
          </ul>
          
          <a href="https://uniquebrains.org/learn/course/${data.courseId}" class="button" style="color: #ffffff !important;">View Course Details</a>
          
          <p>If you have any questions, feel free to reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
          <p>See you tomorrow! 🌟</p>
          <p>The UniqueBrains Team</p>
        </div>
        <div class="footer">
          <p>UniqueBrains - Celebrating Neurodiversity in Learning</p>
          <p><a href="https://uniquebrains.org">uniquebrains.org</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  return await sendEmail({
    to: studentEmail,
    subject: `Reminder: ${data.courseTitle} - Tomorrow`,
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
