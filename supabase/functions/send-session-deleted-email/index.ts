// Supabase Edge Function for sending session deletion notification emails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface SessionDeletedData {
  sessionTitle: string
  sessionDate: string
  courseTitle: string
  courseId: string
  instructorName: string
  studentEmails: string[]
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const data: SessionDeletedData = await req.json()

    if (!data.studentEmails || data.studentEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No students to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send a single email with BCC to all students to avoid rate limits
    try {
      await sendSessionDeletedEmail(data)
      
      return new Response(
        JSON.stringify({ success: true, emailsSent: data.studentEmails.length }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } catch (error) {
      console.error('Failed to send email:', error)
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendSessionDeletedEmail(data: SessionDeletedData) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .session-details { background: #fef2f2; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #dc2626; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Session Cancelled</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>We're writing to inform you that a session has been cancelled by your instructor:</p>
          
          <div class="session-details">
            <h3 style="margin-top: 0; color: #dc2626;">${data.sessionTitle}</h3>
            <p><strong>Course:</strong> ${data.courseTitle}</p>
            <p><strong>Instructor:</strong> ${data.instructorName}</p>
            <p><strong>Originally scheduled:</strong> ${new Date(data.sessionDate).toLocaleString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric', 
              hour: 'numeric', 
              minute: '2-digit' 
            })}</p>
          </div>
          
          <p>Please check your course page for any updates or rescheduled sessions.</p>
          
          <a href="https://uniquebrains.org/learn/course/${data.courseId}" class="button" style="color: #ffffff !important;">View Course</a>
          
          <p>If you have any questions, please contact your instructor or reach out to us at <a href="mailto:hello@uniquebrains.org">hello@uniquebrains.org</a></p>
          
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

  // Send single email with BCC to all students
  return await sendEmail({
    to: 'hello@uniquebrains.org', // Primary recipient (required by Resend)
    bcc: data.studentEmails, // All students in BCC
    subject: `Session Cancelled: ${data.sessionTitle}`,
    html,
  })
}

async function sendEmail({ to, bcc, subject, html }: { to: string; bcc?: string[]; subject: string; html: string }) {
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

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend API error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}
