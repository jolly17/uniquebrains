/**
 * Script to fix answer_count for all questions
 * This will count actual answers and update the questions table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Use service role key to bypass RLS policies for admin operations
const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function fixAnswerCounts() {
  console.log('🔧 Starting answer count fix...')

  try {
    // Get all questions
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, title, answer_count')

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError)
      return
    }

    console.log(`📊 Found ${questions.length} questions`)

    // For each question, count actual answers and update
    for (const question of questions) {
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('id')
        .eq('question_id', question.id)

      if (answersError) {
        console.error(`❌ Error counting answers for question ${question.id}:`, answersError)
        continue
      }

      const actualCount = answers.length
      const isAnswered = actualCount > 0

      // Update if count is different
      if (question.answer_count !== actualCount) {
        console.log(`📝 Updating question "${question.title}": ${question.answer_count} → ${actualCount}`)
        
        const { error: updateError } = await supabase
          .from('questions')
          .update({ 
            answer_count: actualCount,
            is_answered: isAnswered
          })
          .eq('id', question.id)

        if (updateError) {
          console.error(`❌ Error updating question ${question.id}:`, updateError)
        } else {
          console.log(`✅ Updated successfully`)
        }
      }
    }

    console.log('✅ Answer count fix completed!')

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

fixAnswerCounts()
