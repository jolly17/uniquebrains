// Supabase Edge Function for sending enrollment emails via Resend
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface EnrollmentEmailData {
  type: 'student_enrolled' | 'student_unenrolled' | 'instructor_notification'
  studentEmail: string
  studentName: string
  instructorEmail?: string
  instructorName?: string
  courseTitle: string
  courseId: string
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Parse request body
    const emailData: EnrollmentEmailData = await req.json()

    // Validate required fields
    if (!emailData.type || !emailData.studentEmail || !emailData.courseTitle) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Send appropriate email based on type
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
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid email type' }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        )
    }

    return new Response(
      JSON.stringify({ success: true, data: emailResponse }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

async function sendStudentEnrollmentEmail(data: EnrollmentEmailData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
          
          <p>Here's what happens next:</p>
          <ul>
            <li>Access your course materials anytime from your dashboard</li>
            <li>Join live sessions as scheduled</li>
            <li>Connect with your instructor for personalized support</li>
          </ul>
          
          <a href="https://uniquebrains.org/learn/my-courses" class="button">Go to My Courses</a>
          
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
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
          
          <a href="https://uniquebrains.org/learn/marketplace" class="button">Browse Courses</a>
          
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
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
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
          
          <a href="https://uniquebrains.org/teach/course/${data.courseId}/students" class="button">View Student Details</a>
          
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

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'UniqueBrains <notifications@uniquebrains.org>',
      to: [to],
      subject,
      html,
      reply_to: 'hello@uniquebrains.org',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Resend API error: ${error}`)
  }

  return await response.json()
}
