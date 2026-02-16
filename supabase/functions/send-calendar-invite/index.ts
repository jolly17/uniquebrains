import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

interface Session {
  id: string
  session_date: string
  session_time: string
  session_duration: number
  title: string
  description: string
  meeting_link: string
  course_id: string
}

interface Course {
  id: string
  title: string
  description: string
  instructor_id: string
  timezone: string
}

interface Enrollment {
  student_id: string
  course_id: string
}

interface Profile {
  id: string
  email: string
  first_name: string
  last_name: string
}

/**
 * Generate iCalendar (.ics) content for a session
 */
function generateICS(
  session: Session,
  course: Course,
  instructor: Profile,
  student: Profile,
  action: 'REQUEST' | 'CANCEL' = 'REQUEST'
): string {
  // Parse session date and time
  const sessionDateTime = new Date(`${session.session_date}T${session.session_time}`)
  const endDateTime = new Date(sessionDateTime.getTime() + session.session_duration * 60000)

  // Format dates for iCalendar (YYYYMMDDTHHMMSSZ)
  const formatICalDate = (date: Date) => {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
  }

  const dtStart = formatICalDate(sessionDateTime)
  const dtEnd = formatICalDate(endDateTime)
  const dtStamp = formatICalDate(new Date())

  // Generate unique UID for the event
  const uid = `session-${session.id}@uniquebrains.org`

  // Build description with meeting link
  const description = `${session.description || course.description}\\n\\nMeeting Link: ${session.meeting_link}\\n\\nCourse: ${course.title}`

  // Status based on action
  const status = action === 'CANCEL' ? 'CANCELLED' : 'CONFIRMED'
  const method = action

  const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//UniqueBrains//Course Session//EN
METHOD:${method}
CALSCALE:GREGORIAN
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtStamp}
DTSTART:${dtStart}
DTEND:${dtEnd}
SUMMARY:${course.title} - ${session.title}
DESCRIPTION:${description}
LOCATION:${session.meeting_link}
ORGANIZER;CN=${instructor.first_name} ${instructor.last_name}:mailto:${instructor.email}
ATTENDEE;CN=${student.first_name} ${student.last_name};RSVP=TRUE:mailto:${student.email}
STATUS:${status}
SEQUENCE:0
BEGIN:VALARM
TRIGGER:-PT15M
ACTION:DISPLAY
DESCRIPTION:Class starts in 15 minutes
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Class starts in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`

  return ics
}

/**
 * Send calendar invite email using Resend
 */
async function sendCalendarEmail(
  studentEmail: string,
  studentName: string,
  courseName: string,
  sessions: Session[],
  course: Course,
  instructor: Profile,
  student: Profile,
  action: 'REQUEST' | 'CANCEL' = 'REQUEST'
) {
  // Generate .ics files for all sessions
  const attachments = sessions.map(session => {
    const icsContent = generateICS(session, course, instructor, student, action)
    const filename = `${course.title.replace(/[^a-z0-9]/gi, '_')}_${session.title.replace(/[^a-z0-9]/gi, '_')}.ics`
    
    return {
      filename,
      content: btoa(icsContent), // Base64 encode
      content_type: 'text/calendar; charset=utf-8; method=REQUEST'
    }
  })

  const actionText = action === 'CANCEL' ? 'cancelled' : 'scheduled'
  const subject = action === 'CANCEL' 
    ? `Session Cancelled: ${courseName}`
    : `Add to Calendar: ${courseName} Sessions`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; border-radius: 0 0 8px 8px; }
        .session { background: white; padding: 15px; margin: 10px 0; border-radius: 6px; border-left: 4px solid #4f46e5; }
        .button { display: inline-block; background: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${action === 'CANCEL' ? '❌ Session Cancelled' : '📅 Add Sessions to Your Calendar'}</h1>
        </div>
        <div class="content">
          <p>Hi ${studentName},</p>
          
          ${action === 'CANCEL' 
            ? `<p>The following session(s) for <strong>${courseName}</strong> have been cancelled:</p>`
            : `<p>You're enrolled in <strong>${courseName}</strong>! Add these sessions to your calendar so you don't miss any classes:</p>`
          }
          
          ${sessions.map(session => `
            <div class="session">
              <h3>${session.title}</h3>
              <p><strong>Date:</strong> ${new Date(session.session_date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              <p><strong>Time:</strong> ${session.session_time} (${course.timezone || 'UTC'})</p>
              <p><strong>Duration:</strong> ${session.session_duration} minutes</p>
              ${action !== 'CANCEL' ? `<p><strong>Meeting Link:</strong> <a href="${session.meeting_link}">${session.meeting_link}</a></p>` : ''}
            </div>
          `).join('')}
          
          ${action === 'CANCEL' 
            ? `<p>If you have any questions, please contact your instructor.</p>`
            : `
              <p><strong>📎 Calendar files are attached to this email.</strong> Click on any .ics file to add it to your calendar app (Google Calendar, Outlook, Apple Calendar, etc.)</p>
              
              <p><strong>💡 Tip:</strong> Your calendar app will automatically remind you before each session!</p>
              
              <p>See you in class!</p>
            `
          }
          
          <div class="footer">
            <p>UniqueBrains - Where every brain learns differently</p>
            <p><a href="https://uniquebrains.org">Visit our website</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  // Send email with Resend
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${RESEND_API_KEY}`
    },
    body: JSON.stringify({
      from: 'UniqueBrains <noreply@uniquebrains.org>',
      to: studentEmail,
      subject,
      html: htmlContent,
      attachments: action === 'CANCEL' ? [] : attachments // Don't attach .ics files for cancellations
    })
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send email: ${error}`)
  }

  return await response.json()
}

serve(async (req) => {
  try {
    const { type, enrollment_id, course_id, session_id } = await req.json()

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!)

    if (type === 'enrollment_created') {
      // Student enrolled - send calendar invites for all upcoming sessions
      
      // Get enrollment details
      const { data: enrollment, error: enrollmentError } = await supabase
        .from('enrollments')
        .select('student_id, course_id')
        .eq('id', enrollment_id)
        .single()

      if (enrollmentError) throw enrollmentError

      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', enrollment.course_id)
        .single()

      if (courseError) throw courseError

      // Get all upcoming sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .eq('course_id', enrollment.course_id)
        .gte('session_date', new Date().toISOString().split('T')[0])
        .order('session_date', { ascending: true })

      if (sessionsError) throw sessionsError

      if (!sessions || sessions.length === 0) {
        return new Response(JSON.stringify({ message: 'No upcoming sessions' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 200
        })
      }

      // Get student details
      const { data: student, error: studentError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', enrollment.student_id)
        .single()

      if (studentError) throw studentError

      // Get instructor details
      const { data: instructor, error: instructorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', course.instructor_id)
        .single()

      if (instructorError) throw instructorError

      // Send calendar invite
      await sendCalendarEmail(
        student.email,
        `${student.first_name} ${student.last_name}`,
        course.title,
        sessions,
        course,
        instructor,
        student,
        'REQUEST'
      )

      return new Response(
        JSON.stringify({ message: 'Calendar invites sent successfully' }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    if (type === 'session_updated' || type === 'session_deleted') {
      // Session updated or deleted - send updated/cancelled invites to all enrolled students
      
      const action = type === 'session_deleted' ? 'CANCEL' : 'REQUEST'

      // Get session details
      const { data: session, error: sessionError } = await supabase
        .from('sessions')
        .select('*')
        .eq('id', session_id)
        .single()

      if (sessionError && type !== 'session_deleted') throw sessionError

      const targetCourseId = session?.course_id || course_id

      // Get course details
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', targetCourseId)
        .single()

      if (courseError) throw courseError

      // Get instructor details
      const { data: instructor, error: instructorError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', course.instructor_id)
        .single()

      if (instructorError) throw instructorError

      // Get all enrolled students
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('student_id')
        .eq('course_id', targetCourseId)
        .eq('status', 'active')

      if (enrollmentsError) throw enrollmentsError

      // Send updated/cancelled invite to each student
      for (const enrollment of enrollments) {
        const { data: student, error: studentError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', enrollment.student_id)
          .single()

        if (studentError) continue

        await sendCalendarEmail(
          student.email,
          `${student.first_name} ${student.last_name}`,
          course.title,
          session ? [session] : [],
          course,
          instructor,
          student,
          action
        )
      }

      return new Response(
        JSON.stringify({ message: `Calendar ${action === 'CANCEL' ? 'cancellations' : 'updates'} sent successfully` }),
        { headers: { 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid request type' }),
      { headers: { 'Content-Type': 'application/json' }, status: 400 }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
