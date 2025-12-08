/**
 * Verification script for Supabase Authentication Configuration
 * 
 * This script verifies that Supabase Auth is properly configured
 * according to the requirements in the backend architecture spec.
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// Load environment variables from .env file
function loadEnv() {
  try {
    const envFile = readFileSync('.env', 'utf-8')
    const env = {}
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=')
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim()
      }
    })
    return env
  } catch (error) {
    console.error('❌ Could not read .env file')
    return {}
  }
}

const env = loadEnv()
const supabaseUrl = env.VITE_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 Verifying Supabase Authentication Configuration...\n')

async function verifyAuthConfig() {
  const results = {
    passed: [],
    failed: [],
    warnings: []
  }

  // Test 1: Check if we can connect to Supabase
  console.log('1️⃣  Testing Supabase connection...')
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error && error.message !== 'Auth session missing!') {
      throw error
    }
    results.passed.push('✅ Supabase connection successful')
  } catch (error) {
    results.failed.push(`❌ Supabase connection failed: ${error.message}`)
  }

  // Test 2: Verify email provider is enabled (by attempting to sign up)
  console.log('2️⃣  Checking email provider...')
  try {
    // Try to sign up with a test email (will fail if email already exists, but that's ok)
    const testEmail = `test.user.${Date.now()}@gmail.com`
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: 'TestPassword123!',
      options: {
        data: {
          first_name: 'Test',
          last_name: 'User'
        }
      }
    })
    
    if (error && !error.message.includes('already registered')) {
      throw error
    }
    
    results.passed.push('✅ Email provider is enabled and working')
    
    // Clean up test user if created
    if (data?.user?.id) {
      await supabase.auth.admin.deleteUser(data.user.id)
    }
  } catch (error) {
    results.failed.push(`❌ Email provider check failed: ${error.message}`)
  }

  // Test 3: Check redirect URLs configuration
  console.log('3️⃣  Checking redirect URL configuration...')
  const expectedRedirects = [
    'http://localhost:5173',
    'http://localhost:5173/auth/callback'
  ]
  
  results.warnings.push('⚠️  Redirect URLs must be manually verified in Supabase Dashboard')
  results.warnings.push('   Navigate to: Authentication → URL Configuration')
  results.warnings.push(`   Expected URLs: ${expectedRedirects.join(', ')}`)

  // Test 4: Verify JWT settings
  console.log('4️⃣  Checking JWT configuration...')
  results.warnings.push('⚠️  JWT expiry must be manually verified in Supabase Dashboard')
  results.warnings.push('   Navigate to: Authentication → Settings')
  results.warnings.push('   Required: JWT Expiry = 3600 seconds (1 hour)')
  results.warnings.push('   Required: Refresh Token Expiry = 2592000 seconds (30 days)')

  // Test 5: Test password reset flow
  console.log('5️⃣  Testing password reset functionality...')
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(
      'test@example.com',
      {
        redirectTo: 'http://localhost:5173/auth/reset-password'
      }
    )
    
    // This should succeed even if email doesn't exist (for security)
    if (error) {
      throw error
    }
    
    results.passed.push('✅ Password reset functionality is working')
  } catch (error) {
    results.failed.push(`❌ Password reset check failed: ${error.message}`)
  }

  // Test 6: Verify session management
  console.log('6️⃣  Testing session management...')
  try {
    const testEmail = `session.test.${Date.now()}@gmail.com`
    const testPassword = 'TestPassword123!'
    
    // Create test user with auto-confirm using admin API
    const { data: adminData, error: adminError } = await supabase.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true
    })
    
    if (adminError) throw adminError
    
    // Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    })
    
    if (signInError) throw signInError
    
    if (signInData?.session) {
      results.passed.push('✅ Session management is working')
      results.passed.push(`   Session expires at: ${new Date(signInData.session.expires_at * 1000).toISOString()}`)
    }
    
    // Clean up
    if (adminData?.user?.id) {
      await supabase.auth.admin.deleteUser(adminData.user.id)
    }
  } catch (error) {
    results.failed.push(`❌ Session management check failed: ${error.message}`)
  }

  // Print results
  console.log('\n' + '='.repeat(60))
  console.log('📊 VERIFICATION RESULTS')
  console.log('='.repeat(60) + '\n')

  if (results.passed.length > 0) {
    console.log('✅ PASSED CHECKS:')
    results.passed.forEach(msg => console.log(`   ${msg}`))
    console.log()
  }

  if (results.warnings.length > 0) {
    console.log('⚠️  MANUAL VERIFICATION REQUIRED:')
    results.warnings.forEach(msg => console.log(`   ${msg}`))
    console.log()
  }

  if (results.failed.length > 0) {
    console.log('❌ FAILED CHECKS:')
    results.failed.forEach(msg => console.log(`   ${msg}`))
    console.log()
  }

  console.log('='.repeat(60))
  
  if (results.failed.length === 0) {
    console.log('✅ All automated checks passed!')
    console.log('⚠️  Please complete manual verification steps above')
    return true
  } else {
    console.log('❌ Some checks failed. Please review and fix the issues.')
    return false
  }
}

// Run verification
verifyAuthConfig()
  .then(success => {
    process.exit(success ? 0 : 1)
  })
  .catch(error => {
    console.error('❌ Verification script error:', error)
    process.exit(1)
  })
