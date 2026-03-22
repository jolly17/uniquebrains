// Supabase Edge Function for sending enrollment emails via Resend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface EnrollmentEmailData {
  type: 'student_enrolled' | 'student_unenrolled' | 'instructor_notification' | 'instructor_unenrollment_notification'
  studentEmail?: string
  studentName: string
  instructorEmail?: string
  instructorName?: string
  courseTitle: string
  courseId?: string  // Optional for unenrollment emails
  courseStartDate?: string  // Course start date (ISO date string)
  sessionTime?: string  // Session time (HH:MM format)
  meetingLink?: string  // Meeting link (Zoom, Google Meet, Jitsi, etc.)
  selectedDays?: string[]  // Days of the week for sessions
  timezone?: string  // Course timezone
}

serve(async (req) => {
  console.log('=== Email Function Invoked ===')
  console.log('Method:', req.method)
  console.log('URL:', req.url)
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-application-name',
  }

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Method not allowed:', req.method)
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const emailData: EnrollmentEmailData = await req.json()
    console.log('Email data received:', JSON.stringify(emailData, null, 2))

    // Validate required fields based on email type
    const isInstructorNotification = emailData.type === 'instructor_notification' || emailData.type === 'instructor_unenrollment_notification'
    const emailAddress = isInstructorNotification ? emailData.instructorEmail : emailData.studentEmail
    
    if (!emailData.type || !emailAddress || !emailData.courseTitle) {
      console.log('Missing required fields:', { 
        type: !!emailData.type,
        emailAddress: !!emailAddress,
        studentEmail: !!emailData.studentEmail,
        instructorEmail: !!emailData.instructorEmail,
        courseTitle: !!emailData.courseTitle 
      })
      console.log('Full email data:', JSON.stringify(emailData, null, 2))
      return new Response(
        JSON.stringify({ 
          error: 'Missing required fields',
          received: {
            type: emailData.type,
            hasStudentEmail: !!emailData.studentEmail,
            hasInstructorEmail: !!emailData.instructorEmail,
            hasCourseTitle: !!emailData.courseTitle
          }
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send appropriate email based on type
    console.log('Sending email of type:', emailData.type)
    let emailResponse
    switch (emailData.type) {
      case 'student_enrolled':
        emailResponse = await sendStudentEnrollmentEmail(emailData)
        break
      case 'student_unenrolled':
        emailResponse = await sendStudentUnenrollmentEmail(emailData)
        break
      case 'instructor_notification':
        emailResponse = await sendInstructorNotificationEmail(emailData)
        break
      case 'instructor_unenrollment_notification':
        emailResponse = await sendInstructorUnenrollmentNotificationEmail(emailData)
        break
      default:
        console.log('Invalid email type:', emailData.type)
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }

    console.log('Email sent successfully!')
    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('=== ERROR in Email Function ===')
    console.error('Error message:', error.message)
    console.error('Error stack:', error.stack)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function formatStartDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + 'T00:00:00')
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
  } catch {
    return dateStr
  }
}

function formatMultipleTimezones(timeStr: string, timezone?: string): string {
  try {
    // timeStr is in HH:MM or HH:MM:SS format
    // Create a reference date using the course timezone to get correct UTC offset
    const [hours, minutes] = timeStr.split(':')
    const refDate = new Date()
    refDate.setHours(parseInt(hours), parseInt(minutes || '0'), 0, 0)

    // If we have a course timezone, construct a proper date in that timezone
    // by finding the UTC time that corresponds to the given local time
    if (timezone) {
      // Create a date string in the course timezone and parse it
      const dateStr = refDate.toISOString().split('T')[0]
      // Use a known date with the given time, interpreted in the course timezone
      const localDateStr = `${dateStr}T${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}:00`
      
      // Get the offset by comparing local interpretation
      const tempDate = new Date(localDateStr)
      const localTime = tempDate.toLocaleString('en-US', { timeZone: timezone, hour: 'numeric', minute: '2-digit', hour12: false })
      const [localHour, localMin] = localTime.split(':').map(Number)
      const diffMinutes = (parseInt(hours) - localHour) * 60 + (parseInt(minutes || '0') - localMin)
      
      // Adjust to get the UTC time that represents the given time in the course timezone
      refDate.setMinutes(refDate.getMinutes() + diffMinutes)
    }

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
      const time = refDate.toLocaleString('en-US', options)
      return `${time} ${name}`
    })

    return times.join(' | ')
  } catch {
    return timeStr
  }
}

function formatSelectedDays(days: string[]): string {
  if (!days || days.length === 0) return ''
  // Capitalize first letter of each day
  return days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
}

async function sendStudentEnrollmentEmail(data: EnrollmentEmailData) {
  // Build course details section if any schedule info is available
  const hasCourseDetails = data.courseStartDate || data.sessionTime || data.meetingLink
  
  let courseDetailsHtml = ''
  if (hasCourseDetails) {
    let detailRows = ''
    
    if (data.courseStartDate) {
      const formattedDate = formatStartDate(data.courseStartDate)
      detailRows += `<tr><td style="padding: 8px 12px; font-weight: 600; color: #4f46e5; white-space: nowrap; vertical-align: top;">📅 Start Date</td><td style="padding: 8px 12px;">${formattedDate}</td></tr>`
    }
    
    if (data.selectedDays && data.selectedDays.length > 0) {
      const formattedDays = formatSelectedDays(data.selectedDays)
      detailRows += `<tr><td style="padding: 8px 12px; font-weight: 600; color: #4f46e5; white-space: nowrap; vertical-align: top;">🗓️ Session Days</td><td style="padding: 8px 12px;">${formattedDays}</td></tr>`
    }
    
    if (data.meetingLink) {
      detailRows += `<tr><td style="padding: 8px 12px; font-weight: 600; color: #4f46e5; white-space: nowrap; vertical-align: top;">🔗 Meeting Link</td><td style="padding: 8px 12px;"><a href="${data.meetingLink}" style="color: #4f46e5; text-decoration: underline;">${data.meetingLink}</a></td></tr>`
    }
    
    // Build timezone box for session time (similar to session reminder emails)
    let timezoneBoxHtml = ''
    if (data.sessionTime) {
      const multiTimezones = formatMultipleTimezones(data.sessionTime, data.timezone)
      timezoneBoxHtml = `
        <div style="background: #eff6ff; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #4f46e5;">
          <p style="margin: 0 0 8px 0; font-weight: 600; color: #1e40af;">🌍 Session Time (Multiple Timezones):</p>
          <p style="margin: 0; font-size: 14px; color: #1f2937;">${multiTimezones}</p>
        </div>
      `
    }

    courseDetailsHtml = `
      <div style="background: #f0f0ff; border: 1px solid #e0e0ff; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <h3 style="margin: 0 0 12px 0; color: #4f46e5; font-size: 16px;">📋 Course Details</h3>
        <table style="width: 100%; border-collapse: collapse;">
          ${detailRows}
        </table>
        ${timezoneBoxHtml}
      </div>
    `
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to ${data.courseTitle}!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.studentName},</p>
          
          <p>Congratulations! You've successfully enrolled in <strong>${data.courseTitle}</strong>.</p>
          
          ${courseDetailsHtml}
          
          <p>Here's what happens next:</p>
          <ul>
            <li>Access your course materials anytime from your dashboard</li>
            <li>Join live sessions as scheduled</li>
            <li>Connect with your instructor for personalized support</li>
          </ul>
          
          <a href="https://uniquebrains.org/learn/my-courses" class="button" style="color: #ffffff !important;">Go to My Courses</a>
          
          <p>If you have any questions, feel free to reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
          <p>Happy learning! 🌟</p>
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
    to: data.studentEmail,
    subject: `Welcome to ${data.courseTitle}! 🎉`,
    html,
  })
}

async function sendStudentUnenrollmentEmail(data: EnrollmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Unenrollment Confirmation</h1>
        </div>
        <div class="content">
          <p>Hi ${data.studentName},</p>
          
          <p>This confirms that you've been unenrolled from <strong>${data.courseTitle}</strong>.</p>
          
          <p>We're sorry to see you go! If you'd like to re-enroll or explore other courses, you're always welcome back.</p>
          
          <a href="https://uniquebrains.org/learn/marketplace" class="button" style="color: #ffffff !important;">Browse Courses</a>
          
          <p>If you have any feedback or questions, please reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
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
    to: data.studentEmail,
    subject: `Unenrollment Confirmation - ${data.courseTitle}`,
    html,
  })
}

async function sendInstructorNotificationEmail(data: EnrollmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 New Student Enrolled!</h1>
        </div>
        <div class="content">
          <p>Hi ${data.instructorName},</p>
          
          <p>Great news! <strong>${data.studentName}</strong> has enrolled in your course <strong>${data.courseTitle}</strong>.</p>
          
          <p>You can view their profile and neurodiversity information in your course dashboard to provide the best learning experience.</p>
          
          <a href="https://uniquebrains.org/teach/course/${data.courseId}/manage?tab=students" class="button" style="color: #ffffff !important;">View Student Details</a>
          
          <p>Keep up the amazing work! 🌟</p>
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
    to: data.instructorEmail!,
    subject: `New Student Enrolled in ${data.courseTitle}`,
    html,
  })
}

async function sendInstructorUnenrollmentNotificationEmail(data: EnrollmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .info-box { background: #fef3c7; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b; }
        .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 Student Unenrolled</h1>
        </div>
        <div class="content">
          <p>Hi ${data.instructorName},</p>
          
          <p>This is to inform you that <strong>${data.studentName}</strong> has unenrolled from your course <strong>${data.courseTitle}</strong>.</p>
          
          <div class="info-box">
            <p style="margin: 0;"><strong>Student:</strong> ${data.studentName}</p>
            <p style="margin: 5px 0 0;"><strong>Course:</strong> ${data.courseTitle}</p>
          </div>
          
          <p>You can view your current student roster in your course dashboard.</p>
          
          <a href="https://uniquebrains.org/teach/course/${data.courseId}/manage?tab=students" class="button" style="color: #ffffff !important;">View Course Students</a>
          
          <p>If you have any questions, please reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
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

  return await sendEmail({
    to: data.instructorEmail!,
    subject: `Student Unenrolled from ${data.courseTitle}`,
    html,
  })
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  console.log('Attempting to send email to:', to)
  console.log('Subject:', subject)
  console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY)
  
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

  console.log('Email payload:', JSON.stringify(emailPayload, null, 2))

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
  console.log('Resend API response:', JSON.stringify(responseData, null, 2))

  if (!response.ok) {
    throw new Error(`Resend API error (${response.status}): ${JSON.stringify(responseData)}`)
  }

  return responseData
}
