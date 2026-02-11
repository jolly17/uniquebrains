// Supabase Edge Function for sending answer notification emails
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

interface AnswerNotificationData {
  questionTitle: string
  questionId: string
  topicSlug: string
  answerAuthorName: string
  answerContent: string
  questionAuthorEmail: string
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
    const data: AnswerNotificationData = await req.json()

    if (!data.questionAuthorEmail) {
      return new Response(
        JSON.stringify({ success: true, message: 'No email to notify' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    await sendAnswerNotificationEmail(data)

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function sendAnswerNotificationEmail(data: AnswerNotificationData) {
  // Truncate answer if too long
  const answerPreview = data.answerContent.length > 200 
    ? data.answerContent.substring(0, 200) + '...' 
    : data.answerContent

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; }
        .answer-box { background: #f0fdf4; padding: 20px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981; }
        .button { display: inline-block; background: #10b981; color: #ffffff !important; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Someone Answered Your Question!</h1>
        </div>
        <div class="content">
          <p>Great news!</p>
          
          <p><strong>${data.answerAuthorName}</strong> has answered your question:</p>
          
          <h3 style="color: #4f46e5; margin: 20px 0 10px;">"${data.questionTitle}"</h3>
          
          <div class="answer-box">
            <p style="margin: 0; font-style: italic;">${answerPreview}</p>
          </div>
          
          <p>Click below to view the full answer and continue the conversation:</p>
          
          <a href="https://uniquebrains.org/community/${data.topicSlug}/question/${data.questionId}" class="button" style="color: #ffffff !important;">View Answer</a>
          
          <p>Thank you for being part of the UniqueBrains community!</p>
          
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
    to: data.questionAuthorEmail,
    subject: `New answer to your question: "${data.questionTitle}"`,
    html,
  })
}

async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY environment variable is not set')
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'UniqueBrains <hello@uniquebrains.org>',
      to: [to],
      subject,
      html,
      reply_to: 'hello@uniquebrains.org',
    }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Resend API error: ${JSON.stringify(error)}`)
  }

  return await response.json()
}
