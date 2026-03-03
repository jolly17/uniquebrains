// Supabase Edge Function for sending bulk emails to course students
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface BulkEmailData {
  subject: string
  message: string
  courseTitle: string
  courseId: string
  recipientEmails: string[]
  senderName: string
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
    const data: BulkEmailData = await req.json()

    if (!data.recipientEmails || data.recipientEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients to email' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!data.subject || !data.message) {
      return new Response(
        JSON.stringify({ error: 'Subject and message are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    try {
      await sendBulkEmail(data)
      
      return new Response(
        JSON.stringify({ success: true, emailsSent: data.recipientEmails.length }),
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

async function sendBulkEmail(data: BulkEmailData) {
  // Convert newlines to HTML breaks for the message
  const formattedMessage = data.message.replace(/\n/g, '<br>')

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .message-box { background: #f9fafb; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #4f46e5; }
        .button { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .course-badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 14px; margin-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 Message from UniqueBrains</h1>
          <div class="course-badge">${data.courseTitle}</div>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p>You're receiving this message because you're enrolled in <strong>${data.courseTitle}</strong>.</p>
          
          <div class="message-box">
            <p style="margin: 0;">${formattedMessage}</p>
          </div>
          
          <p>Click below to view your course:</p>
          
          <a href="https://uniquebrains.org/learn/course/${data.courseId}" class="button" style="color: #ffffff !important;">View Course</a>
          
          <p>Best regards,</p>
          <p><strong>${data.senderName}</strong><br>UniqueBrains Admin</p>
        </div>
        <div class="footer">
          <p>UniqueBrains - Celebrating Neurodiversity in Learning</p>
          <p><a href="https://uniquebrains.org">uniquebrains.org</a></p>
        </div>
      </div>
    </body>
    </html>
  `

  // Send single email with BCC to all recipients
  return await sendEmail({
    to: 'hello@uniquebrains.org', // Primary recipient (required by Resend)
    bcc: data.recipientEmails, // All actual recipients in BCC
    subject: `[${data.courseTitle}] ${data.subject}`,
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