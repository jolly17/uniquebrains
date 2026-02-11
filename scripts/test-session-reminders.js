/**
 * Test script for session reminder emails
 * This will check for sessions scheduled for tomorrow and test the email function
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testSessionReminders() {
  console.log('🔍 Testing Session Reminder Emails\n')
  console.log('=' .repeat(60))

  try {
    // Calculate tomorrow's date range
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const tomorrowStart = new Date(tomorrow)
    tomorrowStart.setHours(0, 0, 0, 0)
    
    const tomorrowEnd = new Date(tomorrow)
    tomorrowEnd.setHours(23, 59, 59, 999)

    console.log('\n📅 Date Information:')
    console.log(`   Current time: ${now.toISOString()}`)
    console.log(`   Tomorrow start: ${tomorrowStart.toISOString()}`)
    console.log(`   Tomorrow end: ${tomorrowEnd.toISOString()}`)

    // Check for sessions scheduled for tomorrow
    console.log('\n🔎 Searching for sessions scheduled for tomorrow...')
    
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        id,
        title,
        session_date,
        duration_minutes,
        meeting_link,
        status,
        course_id,
        courses (
          id,
          title,
          instructor_id,
          timezone,
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
      console.error('❌ Error fetching sessions:', sessionsError)
      return
    }

    console.log(`\n📊 Found ${sessions?.length || 0} sessions scheduled for tomorrow`)

    if (!sessions || sessions.length === 0) {
      console.log('\n⚠️  No sessions found for tomorrow!')
      console.log('\n💡 To test the reminder emails:')
      console.log('   1. Create a course in your app')
      console.log('   2. Add a session scheduled for tomorrow')
      console.log('   3. Enroll at least one student')
      console.log('   4. Run this script again')
      
      // Show all upcoming sessions
      console.log('\n📋 Checking all upcoming sessions...')
      const { data: allSessions } = await supabase
        .from('sessions')
        .select('id, title, session_date, status, courses(title)')
        .eq('status', 'scheduled')
        .gte('session_date', now.toISOString())
        .order('session_date', { ascending: true })
        .limit(10)

      if (allSessions && allSessions.length > 0) {
        console.log(`\n   Found ${allSessions.length} upcoming sessions:`)
        allSessions.forEach((s, idx) => {
          const sessionDate = new Date(s.session_date)
          const daysUntil = Math.ceil((sessionDate - now) / (1000 * 60 * 60 * 24))
          console.log(`   ${idx + 1}. "${s.title}" in "${s.courses.title}"`)
          console.log(`      Date: ${sessionDate.toLocaleString('en-US')}`)
          console.log(`      Days until: ${daysUntil}`)
        })
      } else {
        console.log('   No upcoming sessions found at all.')
      }
      
      return
    }

    // Display session details
    console.log('\n📝 Session Details:')
    for (const session of sessions) {
      console.log(`\n   Session: "${session.title}"`)
      console.log(`   Course: "${session.courses.title}"`)
      console.log(`   Date: ${new Date(session.session_date).toLocaleString('en-US')}`)
      console.log(`   Duration: ${session.duration_minutes} minutes`)
      console.log(`   Meeting Link: ${session.meeting_link || 'Not set'}`)
      console.log(`   Instructor: ${session.courses.profiles.full_name} (${session.courses.profiles.email})`)

      // Get enrolled students
      const { data: enrollments, error: enrollmentError } = await supabase
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

      if (enrollmentError) {
        console.error(`   ❌ Error fetching enrollments:`, enrollmentError)
      } else {
        console.log(`   Enrolled Students: ${enrollments?.length || 0}`)
        if (enrollments && enrollments.length > 0) {
          enrollments.forEach((e, idx) => {
            console.log(`      ${idx + 1}. ${e.profiles.full_name} (${e.profiles.email})`)
          })
        }
      }
    }

    // Test the email function
    console.log('\n' + '='.repeat(60))
    console.log('🚀 Testing Email Function...\n')

    const functionUrl = `${process.env.VITE_SUPABASE_URL}/functions/v1/send-session-reminders`
    
    console.log(`   Function URL: ${functionUrl}`)
    console.log('   Invoking function...\n')

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
        console.log('\n🎉 Success! Check your email inbox and Resend dashboard.')
        console.log('   Resend Dashboard: https://resend.com/emails')
      } else if (result.sessionsProcessed === 0) {
        console.log('\n⚠️  No sessions were processed. This might mean:')
        console.log('   - No sessions scheduled for exactly tomorrow')
        console.log('   - Sessions exist but are not in "scheduled" status')
      }
    } else {
      console.error('❌ Function execution failed!')
      console.error('   Status:', response.status)
      console.error('   Error:', result)
    }

    console.log('\n' + '='.repeat(60))

  } catch (error) {
    console.error('\n💥 Unexpected error:', error)
  }
}

// Check cron job status
async function checkCronJob() {
  console.log('\n🔧 Checking Cron Job Status...\n')
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: "SELECT * FROM cron.job WHERE jobname = 'send-session-reminders'"
    }).single()

    if (error) {
      // Try alternative method
      console.log('   Using alternative method to check cron...')
      const { data: cronData, error: cronError } = await supabase
        .from('cron.job')
        .select('*')
        .eq('jobname', 'send-session-reminders')

      if (cronError) {
        console.log('   ⚠️  Cannot check cron job status automatically')
        console.log('   Please run this SQL in Supabase Dashboard:')
        console.log('   SELECT * FROM cron.job WHERE jobname = \'send-session-reminders\';')
      } else if (cronData && cronData.length > 0) {
        console.log('   ✅ Cron job exists!')
        console.log('   Schedule:', cronData[0].schedule)
      } else {
        console.log('   ❌ Cron job not found!')
      }
    } else if (data) {
      console.log('   ✅ Cron job exists!')
      console.log('   Schedule:', data.schedule)
    }
  } catch (error) {
    console.log('   ⚠️  Cannot check cron job status')
    console.log('   Please verify in Supabase Dashboard')
  }
}

// Run tests
async function runTests() {
  await testSessionReminders()
  await checkCronJob()
  
  console.log('\n✨ Test complete!\n')
}

runTests()
