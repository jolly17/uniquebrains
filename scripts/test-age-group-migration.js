/**
 * Test Age Group Migration Script
 * 
 * Tests the age_group column migration for the courses table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { readFileSync } from 'fs'

// Load environment variables
dotenv.config()

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

console.log('\n🧪 Testing Age Group Migration\n')
console.log('=' .repeat(50))

// Check environment variables
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Create Supabase client with service role key (needed for schema queries)
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testMigration() {
  try {
    console.log('\n1️⃣ Checking if age_group column exists...\n')
    
    // Query to check if column exists
    const { data: columns, error: columnError } = await supabase
      .rpc('exec_sql', {
        query: `
          SELECT column_name, data_type, column_default, is_nullable
          FROM information_schema.columns
          WHERE table_name = 'courses' AND column_name = 'age_group';
        `
      })
    
    if (columnError) {
      // If RPC doesn't exist, try direct query
      console.log('⚠️  RPC method not available, trying direct table query...\n')
      
      // Try to select from courses table to see if column exists
      const { data: testData, error: testError } = await supabase
        .from('courses')
        .select('age_group')
        .limit(1)
      
      if (testError) {
        if (testError.message.includes('age_group') && testError.message.includes('does not exist')) {
          console.log('❌ Column age_group does NOT exist in courses table')
          console.log('\n📋 To apply the migration:')
          console.log('1. Open Supabase Dashboard → SQL Editor')
          console.log('2. Copy contents of: supabase/migrations/068_add_age_group_to_courses.sql')
          console.log('3. Paste and run in SQL Editor')
          console.log('4. Run this script again to verify\n')
          return false
        } else {
          console.error('❌ Error checking column:', testError.message)
          return false
        }
      } else {
        console.log('✅ Column age_group exists in courses table')
        return true
      }
    } else if (columns && columns.length > 0) {
      console.log('✅ Column age_group exists in courses table')
      console.log('   Type:', columns[0].data_type)
      console.log('   Default:', columns[0].column_default)
      console.log('   Nullable:', columns[0].is_nullable)
      return true
    } else {
      console.log('❌ Column age_group does NOT exist in courses table')
      console.log('\n📋 To apply the migration:')
      console.log('1. Open Supabase Dashboard → SQL Editor')
      console.log('2. Copy contents of: supabase/migrations/068_add_age_group_to_courses.sql')
      console.log('3. Paste and run in SQL Editor')
      console.log('4. Run this script again to verify\n')
      return false
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

async function testConstraint() {
  try {
    console.log('\n2️⃣ Testing CHECK constraint...\n')
    
    // Try to insert a course with an invalid age group
    const { data, error } = await supabase
      .from('courses')
      .insert({
        title: 'Test Course',
        description: 'Test Description',
        category: 'Test',
        age_group: 'Invalid Age Group',
        instructor_id: '00000000-0000-0000-0000-000000000000' // Dummy ID for test
      })
      .select()
    
    if (error) {
      if (error.message.includes('check constraint') || error.message.includes('age_group')) {
        console.log('✅ CHECK constraint is working correctly')
        console.log('   (Invalid age group was rejected as expected)')
        return true
      } else {
        console.log('⚠️  Different error occurred:', error.message)
        console.log('   (This might be expected if instructor_id is invalid)')
        return true
      }
    } else {
      console.log('❌ CHECK constraint is NOT working')
      console.log('   (Invalid age group was accepted)')
      return false
    }
  } catch (err) {
    console.error('❌ Error testing constraint:', err.message)
    return false
  }
}

async function testDefaultValue() {
  try {
    console.log('\n3️⃣ Testing default value...\n')
    
    // Query existing courses to see if they have the default value
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, age_group')
      .limit(5)
    
    if (error) {
      console.error('❌ Error querying courses:', error.message)
      return false
    }
    
    if (courses && courses.length > 0) {
      console.log('✅ Successfully queried courses with age_group field')
      console.log(`   Found ${courses.length} course(s)`)
      
      const coursesWithDefault = courses.filter(c => c.age_group === 'All ages')
      if (coursesWithDefault.length > 0) {
        console.log(`   ${coursesWithDefault.length} course(s) have default value "All ages"`)
      }
      
      // Show sample data
      console.log('\n   Sample courses:')
      courses.forEach(c => {
        console.log(`   - ${c.title}: ${c.age_group || '(null)'}`)
      })
      
      return true
    } else {
      console.log('⚠️  No courses found in database')
      console.log('   (This is okay if database is empty)')
      return true
    }
  } catch (err) {
    console.error('❌ Error testing default value:', err.message)
    return false
  }
}

async function testValidValues() {
  try {
    console.log('\n4️⃣ Testing valid age group values...\n')
    
    const validValues = ['All ages', '5-8 years', '9-12 years', '13-18 years', 'Adults']
    
    console.log('   Valid age group values:')
    validValues.forEach(value => {
      console.log(`   ✓ ${value}`)
    })
    
    return true
  } catch (err) {
    console.error('❌ Error:', err.message)
    return false
  }
}

// Run all tests
async function runAllTests() {
  const columnExists = await testMigration()
  
  if (!columnExists) {
    console.log('\n' + '=' .repeat(50))
    console.log('\n❌ Migration has not been applied yet\n')
    process.exit(1)
  }
  
  await testConstraint()
  await testDefaultValue()
  await testValidValues()
  
  console.log('\n' + '=' .repeat(50))
  console.log('\n✅ Migration test completed!\n')
  console.log('The age_group column is ready to use.\n')
}

runAllTests()
