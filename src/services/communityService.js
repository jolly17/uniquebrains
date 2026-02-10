import { supabase } from '../lib/supabase'

// =====================================================
// TOPICS
// =====================================================

export async function getAllTopics() {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      profiles:created_by (
        id,
        first_name,
        last_name
      ),
      questions:questions(count)
    `)
    .order('is_featured', { ascending: false })
    .order('question_count', { ascending: false })

  if (error) throw error
  
  // Map the actual question count from the join
  return data.map(topic => ({
    ...topic,
    question_count: topic.questions?.[0]?.count || 0
  }))
}

export async function getTopicBySlug(slug) {
  const { data, error } = await supabase
    .from('topics')
    .select(`
      *,
      profiles:created_by (
        id,
        first_name,
        last_name
      )
    `)
    .eq('slug', slug)
    .single()

  if (error) throw error
  return data
}

export async function createTopic(topicData) {
  const { data, error } = await supabase
    .from('topics')
    .insert([topicData])
    .select()
    .single()

  if (error) throw error
  return data
}

// =====================================================
// QUESTIONS
// =====================================================

export async function getQuestionsByTopic(topicSlugOrId, sortBy = 'recent') {
  // First get the topic to get its ID
  let topicId = topicSlugOrId
  
  // If it looks like a slug (contains dashes), fetch the topic first
  if (typeof topicSlugOrId === 'string' && topicSlugOrId.includes('-')) {
    const topic = await getTopicBySlug(topicSlugOrId)
    topicId = topic.id
  }

  let query = supabase
    .from('questions')
    .select(`
      *,
      profiles:author_id (
        id,
        first_name,
        last_name,
        avatar_url
      ),
      topics (
        id,
        name,
        slug
      )
    `)
    .eq('topic_id', topicId)

  // Apply sorting
  if (sortBy === 'recent') {
    query = query.order('created_at', { ascending: false })
  } else if (sortBy === 'popular') {
    query = query.order('vote_count', { ascending: false })
  } else if (sortBy === 'unanswered') {
    query = query.eq('is_answered', false).order('created_at', { ascending: false })
  }

  const { data, error } = await query

  if (error) throw error
  return data
}

export async function getQuestionById(questionId) {
  const { data, error} = await supabase
    .from('questions')
    .select(`
      *,
      profiles:author_id (
        id,
        first_name,
        last_name,
        avatar_url
      ),
      topics (
        id,
        name,
        slug
      )
    `)
    .eq('id', questionId)
    .single()

  if (error) throw error
  
  // Increment view count
  await supabase
    .from('questions')
    .update({ view_count: data.view_count + 1 })
    .eq('id', questionId)

  return data
}

export async function createQuestion(questionData) {
  const { data, error } = await supabase
    .from('questions')
    .insert([questionData])
    .select()
    .single()

  if (error) throw error

  // Increment topic question count
  await supabase.rpc('increment', {
    table_name: 'topics',
    row_id: questionData.topic_id,
    column_name: 'question_count'
  })

  return data
}

export async function updateQuestion(questionId, updates) {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', questionId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteQuestion(questionId) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId)

  if (error) throw error
}

// =====================================================
// ANSWERS
// =====================================================

export async function getAnswersByQuestion(questionId) {
  const { data, error } = await supabase
    .from('answers')
    .select(`
      *,
      profiles:author_id (
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('question_id', questionId)
    .order('is_best_answer', { ascending: false })
    .order('vote_count', { ascending: false })

  if (error) throw error
  return data
}

export async function createAnswer(answerData) {
  const { data, error } = await supabase
    .from('answers')
    .insert([answerData])
    .select()
    .single()

  if (error) throw error

  // Increment question answer count - fetch current count first
  const { data: questionData } = await supabase
    .from('questions')
    .select('answer_count')
    .eq('id', answerData.question_id)
    .single()

  await supabase
    .from('questions')
    .update({ 
      answer_count: (questionData?.answer_count || 0) + 1,
      is_answered: true 
    })
    .eq('id', answerData.question_id)

  return data
}

export async function updateAnswer(answerId, updates) {
  const { data, error } = await supabase
    .from('answers')
    .update(updates)
    .eq('id', answerId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function markBestAnswer(questionId, answerId) {
  // Remove best answer from other answers
  await supabase
    .from('answers')
    .update({ is_best_answer: false })
    .eq('question_id', questionId)

  // Mark this answer as best
  const { data, error } = await supabase
    .from('answers')
    .update({ is_best_answer: true })
    .eq('id', answerId)
    .select()
    .single()

  if (error) throw error

  // Update question with best answer
  await supabase
    .from('questions')
    .update({ best_answer_id: answerId })
    .eq('id', questionId)

  return data
}

// =====================================================
// VOTES
// =====================================================

export async function voteQuestion(questionId, voteType) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to vote')

  // Check if user already voted - use maybeSingle() instead of single()
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('question_id', questionId)
    .maybeSingle()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)
      
      if (error) throw error
      return null
    } else {
      // Update vote type
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert([{
        user_id: user.id,
        question_id: questionId,
        vote_type: voteType
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function voteAnswer(answerId, voteType) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Must be logged in to vote')

  // Check if user already voted - use maybeSingle() instead of single()
  const { data: existingVote } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', user.id)
    .eq('answer_id', answerId)
    .maybeSingle()

  if (existingVote) {
    if (existingVote.vote_type === voteType) {
      // Remove vote if clicking same button
      const { error } = await supabase
        .from('votes')
        .delete()
        .eq('id', existingVote.id)
      
      if (error) throw error
      return null
    } else {
      // Update vote type
      const { data, error } = await supabase
        .from('votes')
        .update({ vote_type: voteType })
        .eq('id', existingVote.id)
        .select()
        .single()
      
      if (error) throw error
      return data
    }
  } else {
    // Create new vote
    const { data, error } = await supabase
      .from('votes')
      .insert([{
        user_id: user.id,
        answer_id: answerId,
        vote_type: voteType
      }])
      .select()
      .single()

    if (error) throw error
    return data
  }
}

export async function getUserVotes(userId, questionIds = [], answerIds = []) {
  const { data, error } = await supabase
    .from('votes')
    .select('*')
    .eq('user_id', userId)
    .or(`question_id.in.(${questionIds.join(',')}),answer_id.in.(${answerIds.join(',')})`)

  if (error) throw error
  return data
}
