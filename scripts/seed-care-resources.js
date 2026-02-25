#!/usr/bin/env node

/**
 * Seed script for care resources
 * Inserts dummy data from src/data/dummyCareResources.js into the database
 * 
 * Usage: node scripts/seed-care-resources.js
 * 
 * Requirements:
 * - VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env
 * - care_resources table must exist in the database
 * 
 * Note: This script uses the service role key to bypass RLS policies
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Validate environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing Supabase environment variables')
  console.error('Please ensure VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env')
  console.error('\nNote: This script requires the service role key to bypass RLS policies')
  process.exit(1)
}

// Create Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Load dummy data
// Note: We need to read and parse the file since it's an ES module
const dummyDataPath = join(__dirname, '../src/data/dummyCareResources.js')
const dummyDataContent = readFileSync(dummyDataPath, 'utf-8')

// Extract DUMMY_RESOURCES array from the file content
// This is a simple parser - in production you might want to use a proper JS parser
const resourcesMatch = dummyDataContent.match(/export const DUMMY_RESOURCES = (\[[\s\S]*?\]);/)
if (!resourcesMatch) {
  console.error('❌ Error: Could not parse DUMMY_RESOURCES from dummyCareResources.js')
  process.exit(1)
}

// Use eval to parse the array (safe in this context since we control the source)
const DUMMY_RESOURCES = eval(resourcesMatch[1])

/**
 * Transform dummy resource to database format
 */
function transformResourceForDB(resource) {
  return {
    // Don't include ID - let the database generate UUIDs
    milestone: resource.milestone,
    name: resource.name,
    description: resource.description,
    address: resource.address,
    city: resource.city,
    state: resource.state,
    zip_code: resource.zipCode,
    country: resource.country,
    // Transform coordinates to PostGIS POINT format
    coordinates: `POINT(${resource.coordinates.lng} ${resource.coordinates.lat})`,
    phone: resource.phone || null,
    email: resource.email || null,
    website: resource.website || null,
    experience_years: resource.experienceYears || null,
    tags: resource.tags || [],
    rating: resource.rating || null,
    review_count: resource.reviewCount || 0,
    verified: resource.verified || false
  }
}

/**
 * Seed care resources
 */
async function seedCareResources() {
  console.log('🌱 Starting care resources seed...\n')
  console.log(`📊 Found ${DUMMY_RESOURCES.length} resources to seed\n`)

  let successCount = 0
  let errorCount = 0
  const errors = []

  // Check if table exists and is accessible
  console.log('🔍 Checking database connection...')
  const { error: connectionError } = await supabase
    .from('care_resources')
    .select('id')
    .limit(1)

  if (connectionError) {
    console.error('❌ Database connection error:', connectionError.message)
    console.error('\nPlease ensure:')
    console.error('1. The care_resources table exists')
    console.error('2. Your Supabase credentials are correct')
    console.error('3. RLS policies allow inserts (or are disabled for testing)')
    process.exit(1)
  }

  console.log('✅ Database connection successful\n')

  // Check if data already exists
  const { data: existingResources, error: checkError } = await supabase
    .from('care_resources')
    .select('id')

  if (checkError) {
    console.error('❌ Error checking existing resources:', checkError.message)
    process.exit(1)
  }

  if (existingResources && existingResources.length > 0) {
    console.log(`⚠️  Warning: Found ${existingResources.length} existing resources in the database`)
    console.log('This script will attempt to insert new resources (may fail if IDs conflict)\n')
  }

  // Insert resources one by one for better error reporting
  for (let i = 0; i < DUMMY_RESOURCES.length; i++) {
    const resource = DUMMY_RESOURCES[i]
    const dbResource = transformResourceForDB(resource)

    try {
      const { error } = await supabase
        .from('care_resources')
        .insert([dbResource])

      if (error) {
        throw error
      }

      successCount++
      console.log(`✅ [${i + 1}/${DUMMY_RESOURCES.length}] Inserted: ${resource.name}`)
    } catch (error) {
      errorCount++
      errors.push({
        name: resource.name,
        error: error.message
      })
      console.log(`❌ [${i + 1}/${DUMMY_RESOURCES.length}] Failed: ${resource.name} - ${error.message}`)
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 Seed Summary')
  console.log('='.repeat(60))
  console.log(`✅ Successfully inserted: ${successCount}`)
  console.log(`❌ Failed: ${errorCount}`)
  console.log(`📝 Total: ${DUMMY_RESOURCES.length}`)

  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(({ name, error }) => {
      console.log(`  - ${name}: ${error}`)
    })
  }

  console.log('\n✨ Seed complete!\n')

  // Exit with error code if any failures
  if (errorCount > 0) {
    process.exit(1)
  }
}

// Run the seed
seedCareResources().catch(error => {
  console.error('❌ Unexpected error:', error)
  process.exit(1)
})
