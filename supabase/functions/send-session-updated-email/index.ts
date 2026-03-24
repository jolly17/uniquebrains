// Supabase Edge Function for sending session date/time change notification emails
// Triggered when an instructor modifies a session's date or time
// Sends email to all enrolled course participants with new date/time in multiple timezones,
// meeting link, and an option to add to calendar (similar to session reminder emails)
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SessionUpdatedData {
  sessionId: string
  sessionTitle: string
  courseId: string
  courseTitle: string
  instructorName: string
  meetingLink: string | null
  timezone: string
  // Old schedule
  oldSessionDate: string
  // New schedule
  newSessionDate: string
  newDurationMinutes: number
  // Recipients
  studentEmails: string[]
  instructorEmail: string
}

serve(async (req) => {
  console.log('=== Session Updated Email Function Invoked ===')
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

  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const data: SessionUpdatedData = await req.json()
    console.log('Session update data received:', JSON.stringify(data, null, 2))

    // Validate required fields
    if (!data.sessionId || !data.courseId || !data.newSessionDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: sessionId, courseId, newSessionDate' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    let emailsSent = 0
    let emailsFailed = 0

    // Send email to all enrolled students (using BCC for efficiency)
    if (data.studentEmails && data.studentEmails.length > 0) {
      try {
        await sendStudentScheduleChangeEmail(data)
        emailsSent += data.studentEmails.length
        console.log(`✓ Sent schedule change notification to ${data.studentEmails.length} students`)
      } catch (error) {
        console.error('✗ Failed to send student notification emails:', error)
        emailsFailed += data.studentEmails.length
      }
    } else {
      console.log('No students to notify')
    }

    // Send notification to instructor as confirmation
    if (data.instructorEmail) {
      try {
        await sendInstructorScheduleChangeConfirmation(data)
        emailsSent++
        console.log(`✓ Sent schedule change confirmation to instructor: ${data.instructorEmail}`)
      } catch (error) {
        console.error(`✗ Failed to send instructor confirmation: ${data.instructorEmail}`, error)
        emailsFailed++
      }
    }

    console.log(`=== Summary: ${emailsSent} sent, ${emailsFailed} failed ===`)

    return new Response(
      JSON.stringify({
        success: true,
        emailsSent,
        emailsFailed,
        studentsNotified: data.studentEmails?.length || 0
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('=== ERROR in Session Updated Email Function ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

// ============================================================
// Helper Functions
// ============================================================

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

function formatSessionTime(sessionDate: string, timezone: string): string {
  const date = new Date(sessionDate)
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: timezone || 'UTC',
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

function formatMultipleTimezonesDetailed(sessionDate: string): string {
  const date = new Date(sessionDate)
  const timezones = [
    { name: 'IST', tz: 'Asia/Kolkata', label: 'India Standard Time' },
    { name: 'GMT', tz: 'Europe/London', label: 'Greenwich Mean Time' },
    { name: 'EST', tz: 'America/New_York', label: 'Eastern Standard Time' },
    { name: 'PST', tz: 'America/Los_Angeles', label: 'Pacific Standard Time' }
  ]

  return timezones.map(({ name, tz, label }) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZone: tz,
      hour12: true
    }
    const time = date.toLocaleString('en-US', options)
    return `<tr>
      <td style="padding: 6px 12px; font-weight: 600; color: #4f46e5;">${name}</td>
      <td style="padding: 6px 12px;">${time}</td>
      <td style="padding: 6px 12px; color: #6b7280; font-size: 13px;">${label}</td>
    </tr>`
  }).join('')
}

function generateGoogleCalendarLink(data: SessionUpdatedData): string {
  const startDate = new Date(data.newSessionDate)
  const endDate = new Date(startDate.getTime() + (data.newDurationMinutes || 60) * 60000)

  // Format dates for Google Calendar (YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const title = encodeURIComponent(`${data.courseTitle}: ${data.sessionTitle}`)
  const description = encodeURIComponent(
    `Course: ${data.courseTitle}\nInstructor: ${data.instructorName}\n${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : 'Meeting link will be shared by instructor'}\n\n⚠️ This session was rescheduled. Please update your calendar.`
  )
  const location = encodeURIComponent(data.meetingLink || 'Online')
  const dates = `${formatGoogleDate(startDate)}/${formatGoogleDate(endDate)}`

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}`
}

function generateOutlookCalendarLink(data: SessionUpdatedData): string {
  const startDate = new Date(data.newSessionDate)
  const endDate = new Date(startDate.getTime() + (data.newDurationMinutes || 60) * 60000)

  const title = encodeURIComponent(`${data.courseTitle}: ${data.sessionTitle}`)
  const description = encodeURIComponent(
    `Course: ${data.courseTitle}\nInstructor: ${data.instructorName}\n${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : 'Meeting link will be shared by instructor'}`
  )
  const location = encodeURIComponent(data.meetingLink || 'Online')

  return `https://outlook.live.com/calendar/0/action/compose?subject=${title}&body=${description}&startdt=${startDate.toISOString()}&enddt=${endDate.toISOString()}&location=${location}`
}

function generateICSContent(data: SessionUpdatedData): string {
  const startDate = new Date(data.newSessionDate)
  const endDate = new Date(startDate.getTime() + (data.newDurationMinutes || 60) * 60000)

  const formatICSDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UniqueBrains//Session//EN
BEGIN:VEVENT
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${data.courseTitle}: ${data.sessionTitle}
DESCRIPTION:Course: ${data.courseTitle}\\nInstructor: ${data.instructorName}\\n${data.meetingLink ? `Meeting Link: ${data.meetingLink}` : ''}
LOCATION:${data.meetingLink || 'Online'}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`
}

// ============================================================
// Email Templates
// ============================================================

async function sendStudentScheduleChangeEmail(data: SessionUpdatedData) {
  const oldDateFormatted = formatDateOnly(data.oldSessionDate)
  const oldTimezones = formatMultipleTimezones(data.oldSessionDate)
  const newDateFormatted = formatDateOnly(data.newSessionDate)
  const newTimezones = formatMultipleTimezones(data.newSessionDate)
  const newTimezonesDetailed = formatMultipleTimezonesDetailed(data.newSessionDate)
  const calendarLink = generateGoogleCalendarLink(data)
  const outlookLink = generateOutlookCalendarLink(data)

  const meetingLinkSection = data.meetingLink
    ? `<p><strong>🔗 Meeting Link:</strong> <a href="${data.meetingLink}" style="color: #4f46e5; text-decoration: underline;">${data.meetingLink}</a></p>`
    : `<p><em>Your instructor will share the meeting link before the session.</em></p>`

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .old-schedule { background: #fef2f2; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #ef4444; text-decoration: line-through; opacity: 0.7; }
        .new-schedule { background: #ecfdf5; padding: 20px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981; }
        .timezone-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        .timezone-table td { padding: 6px 12px; }
        .timezone-box { background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4f46e5; }
        .calendar-buttons { text-align: center; margin: 25px 0; }
        .calendar-btn { display: inline-block; padding: 12px 20px; text-decoration: none; border-radius: 6px; margin: 5px; font-weight: 600; font-size: 14px; }
        .btn-google { background: #4f46e5; color: #ffffff !important; }
        .btn-outlook { background: #0078d4; color: #ffffff !important; }
        .meeting-link-box { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #0ea5e9; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .change-arrow { text-align: center; font-size: 24px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📅 Session Rescheduled</h1>
          <p style="margin: 5px 0 0; opacity: 0.9;">Your session time has been updated</p>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>Your instructor <strong>${data.instructorName}</strong> has rescheduled a session for <strong>${data.courseTitle}</strong>. Please update your calendar with the new date and time.</p>
          
          <h3 style="margin-bottom: 10px; color: #374151;">📋 Session: ${data.sessionTitle}</h3>
          
          <!-- Old Schedule (crossed out) -->
          <div class="old-schedule">
            <p style="margin: 0; font-weight: 600; color: #dc2626;">❌ Previous Schedule:</p>
            <p style="margin: 5px 0 0;">${oldDateFormatted}</p>
            <p style="margin: 3px 0 0; font-size: 13px;">${oldTimezones}</p>
          </div>
          
          <div class="change-arrow">⬇️</div>
          
          <!-- New Schedule (highlighted) -->
          <div class="new-schedule">
            <p style="margin: 0; font-weight: 600; color: #059669;">✅ New Schedule:</p>
            <p style="margin: 5px 0 0; font-size: 16px; font-weight: 600;">${newDateFormatted}</p>
            <p style="margin: 3px 0 0; font-size: 14px; color: #1f2937;">${newTimezones}</p>
          </div>
          
          <!-- Detailed Timezone Table -->
          <div class="timezone-box">
            <p style="margin: 0 0 10px 0; font-weight: 600; color: #1e40af;">🌍 New Time in Multiple Timezones:</p>
            <table class="timezone-table">
              ${newTimezonesDetailed}
            </table>
          </div>
          
          <!-- Meeting Link -->
          <div class="meeting-link-box">
            ${meetingLinkSection}
            <p style="margin: 5px 0 0; font-size: 13px; color: #6b7280;">Duration: ${data.newDurationMinutes || 60} minutes</p>
          </div>
          
          <!-- Add to Calendar Buttons -->
          <div class="calendar-buttons">
            <p style="font-weight: 600; color: #374151; margin-bottom: 10px;">📅 Update Your Calendar:</p>
            <a href="${calendarLink}" class="calendar-btn btn-google" style="color: #ffffff !important; text-decoration: none;">📅 Add to Google Calendar</a>
            <a href="${outlookLink}" class="calendar-btn btn-outlook" style="color: #ffffff !important; text-decoration: none;">📧 Add to Outlook</a>
          </div>
          
          <p style="margin-top: 20px;">Please make sure to:</p>
          <ul>
            <li>Update or remove the old calendar event</li>
            <li>Add the new session time to your calendar</li>
            <li>Test your audio and video setup before the session</li>
            <li>Join a few minutes early to get settled</li>
          </ul>
          
          <a href="https://uniquebrains.org/learn/course/${data.courseId}" class="button" style="color: #ffffff !important;">View Course Details</a>
          
          <p>If you have any questions about this change, please contact your instructor or reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
          <p>Best regards,</p>
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

  // Send single email with BCC to all students (efficient, avoids rate limits)
  return await sendEmail({
    to: 'hello@uniquebrains.org', // Primary recipient (required by Resend)
    bcc: data.studentEmails,
    subject: `⚠️ Session Rescheduled: ${data.sessionTitle} - ${data.courseTitle}`,
    html,
  })
}

async function sendInstructorScheduleChangeConfirmation(data: SessionUpdatedData) {
  const oldDateFormatted = formatSessionTime(data.oldSessionDate, data.timezone)
  const newDateFormatted = formatSessionTime(data.newSessionDate, data.timezone)
  const newTimezones = formatMultipleTimezones(data.newSessionDate)
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
        .change-summary { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; }
        .old-time { color: #dc2626; text-decoration: line-through; }
        .new-time { color: #059669; font-weight: 600; }
        .timezone-box { background: #ecfdf5; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Session Rescheduled Successfully</h1>
        </div>
        <div class="content">
          <p>Hi ${data.instructorName},</p>
          
          <p>This confirms that you've rescheduled the following session, and all enrolled students have been notified:</p>
          
          <div class="change-summary">
            <h3 style="margin-top: 0;">${data.sessionTitle}</h3>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Previous:</strong> <span class="old-time">${oldDateFormatted}</span></p>
            <p><strong>New:</strong> <span class="new-time">${newDateFormatted}</span></p>
            <p><strong>Duration:</strong> ${data.newDurationMinutes || 60} minutes</p>
            <p><strong>Students notified:</strong> ${data.studentEmails?.length || 0}</p>
          </div>
          
          <div class="timezone-box">
            <p style="margin: 0 0 8px 0; font-weight: 600; color: #065f46;">🌍 New Time (Multiple Timezones):</p>
            <p style="margin: 0; font-size: 14px; color: #1f2937;">${newTimezones}</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${calendarLink}" class="button" style="background: #059669; color: #ffffff !important; text-decoration: none;">📅 Update Your Calendar</a>
          </div>
          
          <a href="https://uniquebrains.org/teach/course/${data.courseId}/manage?tab=students" class="button" style="color: #ffffff !important;">View Course Dashboard</a>
          
          <p>If you need to make further changes, you can update the session from your course management page.</p>
          
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
    subject: `✅ Session Rescheduled: ${data.sessionTitle} - ${data.studentEmails?.length || 0} students notified`,
    html,
  })
}

// ============================================================
// Email Sending via Resend
// ============================================================

async function sendEmail({ to, bcc, subject, html }: { to: string; bcc?: string[]; subject: string; html: string }) {
  console.log('Attempting to send email to:', to)
  if (bcc?.length) console.log('BCC recipients:', bcc.length)
  console.log('Subject:', subject)

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const emailData: any = {
    from: 'UniqueBrains <hello@uniquebrains.org>',
    to: [to],
    subject,
    html,
    reply_to: 'hello@uniquebrains.org',
  }

  // Add BCC if provided
  if (bcc && bcc.length > 0) {
    emailData.bcc = bcc
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify(emailData),
  })

  const responseData = await response.json()
  console.log('Resend API response status:', response.status)

  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${JSON.stringify(responseData)}`)
  }

  return responseData
}
