/**
 * Database Tables Verification Script
 * 
 * Checks if required database tables exist in Supabase
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

console.log('\n🔍 Database Tables Verification\n')
console.log('=' .repeat(50))

// Check environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Required tables for OAuth to work
const requiredTables = [
  'profiles',
  'courses',
  'enrollments',
  'sessions'
]

console.log('\nChecking required tables...\n')

let allTablesExist = true

for (const table of requiredTables) {
  try {
    const { error } = await supabase.from(table).select('id').limit(1)
    
    if (error) {
      if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
        console.log(`❌ Table "${table}" does NOT exist`)
        allTablesExist = false
      } else if (error.code === '42P01') {
        console.log(`❌ Table "${table}" does NOT exist`)
        allTablesExist = false
      } else {
        console.log(`⚠️  Table "${table}" - Unknown error: ${error.message}`)
      }
    } else {
      console.log(`✅ Table "${table}" exists`)
    }
  } catch (err) {
    console.log(`❌ Table "${table}" - Error: ${err.message}`)
    allTablesExist = false
  }
}

console.log('\n' + '=' .repeat(50))

if (allTablesExist) {
  console.log('\n✅ All required tables exist!')
  console.log('\nYou can now test OAuth login:')
  console.log('1. Go to http://localhost:3001/login')
  console.log('2. Click "Continue with Google"')
  console.log('3. Complete the OAuth flow')
  console.log('')
} else {
  console.log('\n❌ Some tables are missing!')
  console.log('\n📋 To fix this:')
  console.log('1. Open Supabase Dashboard → SQL Editor')
  console.log('2. Copy contents of: supabase/migrations/001_create_core_tables.sql')
  console.log('3. Paste and run in SQL Editor')
  console.log('4. Run this script again to verify')
  console.log('\nDetailed instructions: APPLY_DATABASE_MIGRATIONS.md')
  console.log('')
  process.exit(1)
}
