/**
 * Apply Age Group Migration Script
 * 
 * Applies the age_group column migration to the courses table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🚀 Applying Age Group Migration\n')
console.log('=' .repeat(50))

// Check environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyMigration() {
  try {
    console.log('\n📖 Reading migration file...\n')
    
    // Read the migration file
    const migrationSQL = readFileSync('supabase/migrations/068_add_age_group_to_courses.sql', 'utf8')
    
    console.log('Migration SQL:')
    console.log('-'.repeat(50))
    console.log(migrationSQL)
    console.log('-'.repeat(50))
    
    console.log('\n⚠️  Note: This script cannot execute raw SQL directly.')
    console.log('Please apply the migration manually using one of these methods:\n')
    
    console.log('Method 1: Supabase Dashboard (Recommended)')
    console.log('1. Go to your Supabase Dashboard')
    console.log('2. Navigate to SQL Editor')
    console.log('3. Copy the SQL above')
    console.log('4. Paste and click "Run"')
    console.log('')
    
    console.log('Method 2: Supabase CLI')
    console.log('1. Install Supabase CLI: npm install -g supabase')
    console.log('2. Link your project: supabase link --project-ref YOUR_PROJECT_REF')
    console.log('3. Run: supabase db push')
    console.log('')
    
    console.log('Method 3: psql')
    console.log('1. Get your database connection string from Supabase Dashboard')
    console.log('2. Run: psql "YOUR_CONNECTION_STRING"')
    console.log('3. Execute: \\i supabase/migrations/068_add_age_group_to_courses.sql')
    console.log('')
    
    console.log('After applying the migration, run:')
    console.log('  node scripts/test-age-group-migration.js')
    console.log('')
    
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

applyMigration()
