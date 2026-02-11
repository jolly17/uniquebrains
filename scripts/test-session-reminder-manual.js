/**
 * Manual test for session reminder emails
 * This will temporarily move a session to tomorrow, test emails, then restore it
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testWithTemporarySession() {
  console.log('🧪 Manual Session Reminder Email Test\n')
  console.log('=' .repeat(60))

  try {
    // Get the first upcoming session
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        session_date,
        duration_minutes,
        course_id,
        courses (
          id,
          title,
          instructor_id,
          profiles (
            full_name,
            email
          )
        )
      `)
      .eq('status', 'scheduled')
      .gte('session_date', new Date().toISOString())
      .order('session_date', { ascending: true })
      .limit(1)

    if (sessionError || !sessions || sessions.length === 0) {
      console.error('❌ No upcoming sessions found to test with')
      return
    }

    const session = sessions[0]
    const originalDate = session.session_date

    console.log('\n📝 Selected Session for Testing:')
    console.log(`   Title: "${session.title}"`)
    console.log(`   Course: "${session.courses.title}"`)
    console.log(`   Original Date: ${new Date(originalDate).toLocaleString('en-US')}`)
    console.log(`   Instructor: ${session.courses.profiles.full_name}`)

    // Get enrolled students
    const { data: enrollments } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        profiles (
          full_name,
          email
        )
      `)
      .eq('course_id', session.course_id)
      .eq('status', 'active')

    console.log(`   Enrolled Students: ${enrollments?.length || 0}`)
    if (enrollments && enrollments.length > 0) {
      enrollments.forEach((e, idx) => {
        console.log(`      ${idx + 1}. ${e.profiles.full_name} (${e.profiles.email})`)
      })
    } else {
      console.log('\n⚠️  No enrolled students! Emails will only go to instructor.')
    }

    // Calculate tomorrow's date at the same time
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const originalTime = new Date(originalDate)
    tomorrow.setHours(originalTime.getHours(), originalTime.getMinutes(), 0, 0)

    console.log(`\n🔄 Temporarily moving session to tomorrow: ${tomorrow.toLocaleString('en-US')}`)

    // Update session to tomorrow
    const { error: updateError } = await supabase
      .from('sessions')
      .update({ session_date: tomorrow.toISOString() })
      .eq('id', session.id)

    if (updateError) {
      console.error('❌ Failed to update session:', updateError)
      return
    }

    console.log('✅ Session moved to tomorrow')

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Call the email function
    console.log('\n🚀 Invoking email function...\n')

    const functionUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/send-session-reminders`
    
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({})
    })

    const result = await response.json()

    if (response.ok) {
      console.log('✅ Function executed successfully!')
      console.log('\n📧 Email Results:')
      console.log(`   Sessions processed: ${result.sessionsProcessed || 0}`)
      console.log(`   Emails sent: ${result.emailsSent || 0}`)
      console.log(`   Emails failed: ${result.emailsFailed || 0}`)
      
      if (result.emailsSent > 0) {
        console.log('\n🎉 Success! Emails were sent!')
        console.log('   Check your email inbox and Resend dashboard:')
        console.log('   https://resend.com/emails')
      } else {
        console.log('\n⚠️  No emails were sent. Check function logs in Supabase.')
      }
    } else {
      console.error('\n❌ Function execution failed!')
      console.error('   Status:', response.status)
      console.error('   Error:', JSON.stringify(result, null, 2))
    }

    // Restore original date
    console.log(`\n🔄 Restoring session to original date: ${new Date(originalDate).toLocaleString('en-US')}`)

    const { error: restoreError } = await supabase
      .from('sessions')
      .update({ session_date: originalDate })
      .eq('id', session.id)

    if (restoreError) {
      console.error('❌ Failed to restore session:', restoreError)
      console.error('⚠️  IMPORTANT: Session is still set to tomorrow!')
      console.error(`   Session ID: ${session.id}`)
      console.error(`   Please manually restore it in the database`)
    } else {
      console.log('✅ Session restored to original date')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ Test complete!\n')

  } catch (error) {
    console.error('\n💥 Unexpected error:', error)
  }
}

testWithTemporarySession()
