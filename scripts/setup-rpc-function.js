#!/usr/bin/env node

/**
 * Setup RPC Function Script
 * Creates the get_care_resources_with_coords RPC function in Supabase
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY)')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function setupRPCFunction() {
  console.log('🔧 Setting up RPC function...\n')

  try {
    // Read SQL file
    const sqlPath = join(__dirname, 'create-rpc-function.sql')
    const sql = readFileSync(sqlPath, 'utf8')

    console.log('📝 Executing SQL...')
    
    // Execute the SQL using Supabase RPC
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

    if (error) {
      console.error('❌ Error creating RPC function:', error.message)
      console.log('\n⚠️  Note: You may need to run this SQL manually in the Supabase SQL Editor:')
      console.log('   1. Go to your Supabase project dashboard')
      console.log('   2. Navigate to SQL Editor')
      console.log('   3. Copy and paste the contents of scripts/create-rpc-function.sql')
      console.log('   4. Click "Run"\n')
      process.exit(1)
    }

    console.log('✅ RPC function created successfully!')
    
    // Test the function
    console.log('\n🧪 Testing RPC function...')
    const { data: testData, error: testError } = await supabase.rpc('get_care_resources_with_coords', {
      p_milestone: 'diagnosis',
      p_limit: 1
    })

    if (testError) {
      console.error('❌ Error testing RPC function:', testError.message)
      process.exit(1)
    }

    console.log('✅ RPC function test successful!')
    console.log(`   Found ${testData?.length || 0} test resource(s)`)
    
    if (testData && testData.length > 0) {
      console.log(`   Sample: ${testData[0].name} at (${testData[0].lat}, ${testData[0].lng})`)
    }

    console.log('\n✨ Setup complete!')

  } catch (error) {
    console.error('❌ Unexpected error:', error.message)
    process.exit(1)
  }
}

setupRPCFunction()
