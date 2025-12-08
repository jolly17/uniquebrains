#!/usr/bin/env node

/**
 * Supabase Setup Verification Script
 * 
 * This script verifies that your Supabase project is properly configured
 * and all required environment variables are set.
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

// Load environment variables
config()

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

const OPTIONAL_ENV_VARS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'VITE_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_SECRET_KEY',
  'VITE_CLOUDINARY_CLOUD_NAME',
  'ZOOM_API_KEY',
  'RESEND_API_KEY',
]

console.log('🔍 Verifying Supabase Setup...\n')

// Check required environment variables
let missingRequired = []
let missingOptional = []

console.log('📋 Checking Environment Variables:')
REQUIRED_ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`)
  } else {
    console.log(`  ❌ ${varName}: Missing`)
    missingRequired.push(varName)
  }
})

console.log('\n📋 Optional Environment Variables:')
OPTIONAL_ENV_VARS.forEach(varName => {
  if (process.env[varName]) {
    console.log(`  ✅ ${varName}: Set`)
  } else {
    console.log(`  ⚠️  ${varName}: Not set (optional for now)`)
    missingOptional.push(varName)
  }
})

if (missingRequired.length > 0) {
  console.log('\n❌ Setup Incomplete!')
  console.log('\nMissing required environment variables:')
  missingRequired.forEach(varName => console.log(`  - ${varName}`))
  console.log('\nPlease follow the SUPABASE_SETUP.md guide to complete setup.')
  process.exit(1)
}

// Test Supabase connection
console.log('\n🔌 Testing Supabase Connection...')

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY

try {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  // Try a simple query (will fail if table doesn't exist, but connection works)
  const { error } = await supabase.from('_test').select('*').limit(1)
  
  // PGRST116 or "Could not find the table" means table doesn't exist, which is expected
  const isTableNotFoundError = error && (
    error.code === 'PGRST116' || 
    error.message?.includes('Could not find the table')
  )
  
  if (error && !isTableNotFoundError) {
    console.log('  ❌ Connection failed:', error.message)
    console.log('\nPlease verify:')
    console.log('  1. Your Supabase project is active (not paused)')
    console.log('  2. The URL and API key are correct')
    console.log('  3. Your internet connection is working')
    process.exit(1)
  }
  
  console.log('  ✅ Successfully connected to Supabase!')
  if (isTableNotFoundError) {
    console.log('  ℹ️  (Table not found error is expected - no tables created yet)')
  }
  
  // Parse and display project info
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
  if (projectRef) {
    console.log(`  📍 Project Reference: ${projectRef}`)
  }
  
} catch (error) {
  console.log('  ❌ Connection error:', error.message)
  process.exit(1)
}

// Summary
console.log('\n✅ Supabase Setup Verification Complete!')
console.log('\n📝 Next Steps:')
console.log('  1. Task 2: Create Database Schema')
console.log('  2. Task 3: Implement Row Level Security')
console.log('  3. Task 4: Set up Authentication')

if (missingOptional.length > 0) {
  console.log('\n⚠️  Optional services not configured yet:')
  if (missingOptional.includes('VITE_STRIPE_PUBLISHABLE_KEY')) {
    console.log('  - Stripe (for payments)')
  }
  if (missingOptional.includes('VITE_CLOUDINARY_CLOUD_NAME')) {
    console.log('  - Cloudinary (for image optimization)')
  }
  if (missingOptional.includes('ZOOM_API_KEY')) {
    console.log('  - Zoom (for video conferencing)')
  }
  if (missingOptional.includes('RESEND_API_KEY')) {
    console.log('  - Resend (for email notifications)')
  }
  console.log('\n  These will be configured in later tasks.')
}

console.log('\n🎉 You can now proceed with database setup!')
