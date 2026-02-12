// Supabase Edge Function for sending chat message notification emails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface ChatNotificationData {
  senderName: string
  messageContent: string
  courseTitle: string
  courseId: string
  recipientEmails: string[]
  isInstructor: boolean
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
    const data: ChatNotificationData = await req.json()

    if (!data.recipientEmails || data.recipientEmails.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No recipients to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Send a single email with BCC to all recipients to avoid rate limits
    try {
      await sendChatNotificationEmail(data)
      
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

async function sendChatNotificationEmail(data: ChatNotificationData) {
  // Truncate message if too long
  const messagePreview = data.messageContent.length > 150 
    ? data.messageContent.substring(0, 150) + '...' 
    : data.messageContent

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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 New Message in ${data.courseTitle}</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          
          <p><strong>${data.senderName}</strong> ${data.isInstructor ? '(Instructor)' : ''} sent a message in your course:</p>
          
          <div class="message-box">
            <p style="margin: 0; font-style: italic;">"${messagePreview}"</p>
          </div>
          
          <p>Click below to view the full message and reply:</p>
          
          <a href="https://uniquebrains.org/learn/course/${data.courseId}/chat" class="button" style="color: #ffffff !important;">View Message</a>
          
          <p>Stay connected with your course community!</p>
          
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

  // Send single email with BCC to all recipients
  return await sendEmail({
    to: 'hello@uniquebrains.org', // Primary recipient (required by Resend)
    bcc: data.recipientEmails, // All actual recipients in BCC
    subject: `New message from ${data.senderName} in ${data.courseTitle}`,
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
