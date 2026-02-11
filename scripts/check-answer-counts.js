/**
 * Script to check answer counts in detail
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

async function checkAnswerCounts() {
  console.log('🔍 Checking answer counts in detail...\n')

  try {
    // Get all questions with their answers
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('id, title, answer_count, is_answered')
      .order('created_at', { ascending: false })

    if (questionsError) {
      console.error('❌ Error fetching questions:', questionsError)
      return
    }

    console.log(`📊 Found ${questions.length} questions\n`)

    for (const question of questions) {
      // Count actual answers
      const { data: answers, error: answersError } = await supabase
        .from('answers')
        .select('id, content, created_at')
        .eq('question_id', question.id)

      if (answersError) {
        console.error(`❌ Error counting answers:`, answersError)
        continue
      }

      const actualCount = answers.length
      const match = question.answer_count === actualCount ? '✅' : '❌'

      console.log(`${match} "${question.title.substring(0, 80)}..."`)
      console.log(`   DB answer_count: ${question.answer_count}`)
      console.log(`   Actual answers: ${actualCount}`)
      console.log(`   is_answered: ${question.is_answered}`)
      
      if (answers.length > 0) {
        console.log(`   Answers:`)
        answers.forEach((ans, idx) => {
          console.log(`     ${idx + 1}. ${ans.content.substring(0, 50)}... (${ans.created_at})`)
        })
      }
      console.log('')
    }

  } catch (error) {
    console.error('💥 Unexpected error:', error)
  }
}

checkAnswerCounts()
