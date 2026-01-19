import { supabase } from '../lib/supabase'
import { getActiveChannels } from './realtimeService'

/**
 * Message Service - Backend API functions for course messaging and chat
 * Handles group chat and one-on-one messaging between instructors and students
 * Requirements: 5.2 (message broadcasting and persistence)
 */

// Get reference to active channels
const activeChannels = getActiveChannels()

/**
 * Send a message in a course
 * Broadcasts to all channel subscribers via Supabase Realtime
 * @param {string} courseId - Course ID
 * @param {Object} messageData - Message content and metadata
 * @param {string} senderId - Sender user ID
 * @returns {Promise<Object>} Created message
 */
export async function sendMessage(courseId, messageData, senderId) {
  if (!courseId || !senderId) {
    throw new Error('Course ID and sender ID are required')
  }

  try {
    // Verify user has access to this course
    const hasAccess = await checkCourseAccess(courseId, senderId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    // Validate message content
    if (!messageData.content || messageData.content.trim().length === 0) {
      throw new Error('Message content is required')
    }

    if (messageData.content.length > 2000) {
      throw new Error('Message content must be less than 2000 characters')
    }

    // Prepare message data
    const dbMessageData = {
      course_id: courseId,
      sender_id: senderId,
      content: messageData.content.trim(),
      recipient_id: messageData.recipient_id || null, // For one-on-one messages
      is_announcement: messageData.is_announcement || false,
      attachments: messageData.attachments || null
    }

    // For one-on-one courses, validate recipient
    if (messageData.recipient_id) {
      const hasRecipientAccess = await checkCourseAccess(courseId, messageData.recipient_id)
      if (!hasRecipientAccess) {
        throw new Error('Recipient does not have access to this course')
      }
    }

    // Insert message to database
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([dbMessageData])
      .select(`
        *,
        profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .single()

    if (messageError) {
      console.error('Error sending message:', messageError)
      throw new Error(`Failed to send message: ${messageError.message}`)
    }

    // Broadcast message via Realtime Broadcast (doesn't require replication)
    console.log('📡 Broadcasting message to channel:', `course:${courseId}:messages`)
    console.log('📡 Message payload:', message)
    await broadcastMessageToChannel(courseId, 'new_message', message)
    console.log('📡 Broadcast complete')
    
    return message
  } catch (error) {
    console.error('Error in sendMessage:', error)
    throw error
  }
}

/**
 * Broadcast a message to a course channel using Realtime Broadcast
 * This works without database replication
 * @param {string} courseId - Course ID
 * @param {string} eventType - Event type
 * @param {Object} payload - Message payload
 * @returns {Promise<void>}
 */
async function broadcastMessageToChannel(courseId, eventType, payload) {
  try {
    const channelName = `course:${courseId}:messages`
    
    console.log('Looking for existing channel:', channelName)
    console.log('Active channels:', Array.from(activeChannels.keys()))
    
    // Check if channel exists in active channels
    const existingChannel = activeChannels.get(channelName)
    
    if (existingChannel && existingChannel.channel) {
      // Use existing channel
      console.log('Using existing channel for broadcast, state:', existingChannel.channel.state)
      
      const result = await existingChannel.channel.send({
        type: 'broadcast',
        event: eventType,
        payload: payload
      })
      
      console.log('Broadcast result:', result)
    } else {
      // No existing channel - try to get all channels from supabase
      console.log('No existing channel found in activeChannels')
      const allChannels = supabase.getChannels()
      console.log('All Supabase channels:', allChannels.map(c => c.topic))
      
      // Find matching channel - Supabase adds "realtime:" prefix
      const matchingChannel = allChannels.find(c => 
        c.topic === channelName || c.topic === `realtime:${channelName}`
      )
      
      if (matchingChannel) {
        console.log('Found matching channel in Supabase, using it')
        const result = await matchingChannel.send({
          type: 'broadcast',
          event: eventType,
          payload: payload
        })
        console.log('Broadcast result:', result)
      } else {
        console.warn('No channel found - message saved but not broadcast')
      }
    }
    
    console.log('Broadcast sent successfully')
  } catch (error) {
    console.error('Error broadcasting message:', error)
    // Don't throw - message is already saved to DB
  }
}

/**
 * Get messages for a course (group chat)
 * @param {string} courseId - Course ID
 * @param {string} userId - Current user ID
 * @param {number} limit - Number of messages to return (default: 50)
 * @param {string} before - Get messages before this timestamp (for pagination)
 * @returns {Promise<Array>} List of messages
 */
export async function getCourseMessages(courseId, userId, limit = 50, before = null) {
  if (!courseId || !userId) {
    throw new Error('Course ID and user ID are required')
  }

  try {
    // Verify user has access to this course
    const hasAccess = await checkCourseAccess(courseId, userId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .eq('course_id', courseId)
      .is('recipient_id', null) // Only group messages (no recipient)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add pagination if before timestamp is provided
    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching messages:', error)
      throw new Error(`Failed to fetch messages: ${error.message}`)
    }

    // Return in chronological order (oldest first)
    return (messages || []).reverse()
  } catch (error) {
    console.error('Error in getCourseMessages:', error)
    throw error
  }
}

/**
 * Get one-on-one conversation between instructor and student
 * @param {string} courseId - Course ID
 * @param {string} userId - Current user ID
 * @param {string} otherUserId - Other participant ID
 * @param {number} limit - Number of messages to return (default: 50)
 * @param {string} before - Get messages before this timestamp (for pagination)
 * @returns {Promise<Array>} List of messages
 */
export async function getConversation(courseId, userId, otherUserId, limit = 50, before = null) {
  if (!courseId || !userId || !otherUserId) {
    throw new Error('Course ID, user ID, and other user ID are required')
  }

  try {
    // Verify both users have access to this course
    const userAccess = await checkCourseAccess(courseId, userId)
    const otherUserAccess = await checkCourseAccess(courseId, otherUserId)
    
    if (!userAccess || !otherUserAccess) {
      throw new Error('Unauthorized: One or both users do not have access to this course')
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        profiles!sender_id(id, full_name, avatar_url, role)
      `)
      .eq('course_id', courseId)
      .or(`and(sender_id.eq.${userId},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${userId})`)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Add pagination if before timestamp is provided
    if (before) {
      query = query.lt('created_at', before)
    }

    const { data: messages, error } = await query

    if (error) {
      console.error('Error fetching conversation:', error)
      throw new Error(`Failed to fetch conversation: ${error.message}`)
    }

    // Return in chronological order (oldest first)
    return (messages || []).reverse()
  } catch (error) {
    console.error('Error in getConversation:', error)
    throw error
  }
}

/**
 * Get conversation threads for one-on-one courses (instructor view)
 * @param {string} courseId - Course ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Array>} List of conversation threads with last message
 */
export async function getConversationThreads(courseId, instructorId) {
  if (!courseId || !instructorId) {
    throw new Error('Course ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id, course_type')
      .eq('id', courseId)
      .single()

    if (courseError) {
      throw new Error(`Course not found: ${courseError.message}`)
    }

    if (course.instructor_id !== instructorId) {
      throw new Error('Unauthorized: You can only view conversations for your own courses')
    }

    // Get all enrolled students
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('enrollments')
      .select(`
        student_id,
        profiles!student_id(id, full_name, avatar_url)
      `)
      .eq('course_id', courseId)

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError)
      throw new Error(`Failed to fetch enrollments: ${enrollmentError.message}`)
    }

    // Get last message for each student
    const threads = []
    for (const enrollment of enrollments || []) {
      const studentId = enrollment.student_id

      // Get the most recent message between instructor and this student
      const { data: lastMessage, error: messageError } = await supabase
        .from('messages')
        .select(`
          *,
          profiles!sender_id(id, full_name, avatar_url, role)
        `)
        .eq('course_id', courseId)
        .or(`and(sender_id.eq.${instructorId},recipient_id.eq.${studentId}),and(sender_id.eq.${studentId},recipient_id.eq.${instructorId})`)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      threads.push({
        student: enrollment.profiles,
        lastMessage: messageError ? null : lastMessage,
        unreadCount: 0 // TODO: Implement unread count tracking
      })
    }

    // Sort by last message timestamp (most recent first)
    threads.sort((a, b) => {
      if (!a.lastMessage && !b.lastMessage) return 0
      if (!a.lastMessage) return 1
      if (!b.lastMessage) return -1
      return new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
    })

    return threads
  } catch (error) {
    console.error('Error in getConversationThreads:', error)
    throw error
  }
}

/**
 * Mark messages as read (for future unread count implementation)
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @param {string} otherUserId - Other participant ID (for one-on-one)
 * @returns {Promise<boolean>} Success status
 */
export async function markMessagesAsRead(courseId, userId, otherUserId = null) {
  if (!courseId || !userId) {
    throw new Error('Course ID and user ID are required')
  }

  try {
    // Verify user has access to this course
    const hasAccess = await checkCourseAccess(courseId, userId)
    if (!hasAccess) {
      throw new Error('Unauthorized: You do not have access to this course')
    }

    // For now, just log the action (can be expanded to update read status in database)
    console.log(`User ${userId} marked messages as read in course ${courseId}`, otherUserId ? `with ${otherUserId}` : '(group chat)')

    return true
  } catch (error) {
    console.error('Error in markMessagesAsRead:', error)
    throw error
  }
}

/**
 * Get message statistics for instructor dashboard
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<Object>} Message statistics
 */
export async function getMessageStats(instructorId) {
  if (!instructorId) {
    throw new Error('Instructor ID is required')
  }

  try {
    // Get message counts for instructor's courses
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        created_at,
        course_id,
        courses!inner(instructor_id, title, course_type)
      `)
      .eq('courses.instructor_id', instructorId)

    if (error) {
      console.error('Error fetching message stats:', error)
      throw new Error(`Failed to fetch message stats: ${error.message}`)
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000))

    const stats = {
      totalMessages: messages.length,
      messagesToday: messages.filter(m => new Date(m.created_at) >= today).length,
      messagesThisWeek: messages.filter(m => new Date(m.created_at) >= thisWeek).length,
      messagesByCourse: {}
    }

    // Group by course
    messages.forEach(message => {
      const courseTitle = message.courses.title
      if (!stats.messagesByCourse[courseTitle]) {
        stats.messagesByCourse[courseTitle] = 0
      }
      stats.messagesByCourse[courseTitle]++
    })

    return stats
  } catch (error) {
    console.error('Error in getMessageStats:', error)
    throw error
  }
}

/**
 * Delete a message (instructor only)
 * @param {string} messageId - Message ID
 * @param {string} instructorId - Instructor user ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteMessage(messageId, instructorId) {
  if (!messageId || !instructorId) {
    throw new Error('Message ID and instructor ID are required')
  }

  try {
    // Verify instructor owns the course for this message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select(`
        id,
        sender_id,
        course_id,
        courses!inner(instructor_id)
      `)
      .eq('id', messageId)
      .single()

    if (messageError) {
      throw new Error(`Message not found: ${messageError.message}`)
    }

    // Only allow deletion if user is the instructor or the sender
    if (message.courses.instructor_id !== instructorId && message.sender_id !== instructorId) {
      throw new Error('Unauthorized: You can only delete your own messages or messages in your courses')
    }

    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)

    if (deleteError) {
      console.error('Error deleting message:', deleteError)
      throw new Error(`Failed to delete message: ${deleteError.message}`)
    }

    return true
  } catch (error) {
    console.error('Error in deleteMessage:', error)
    throw error
  }
}

/**
 * Check if user has access to a course (instructor or enrolled student)
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} Access status
 */
async function checkCourseAccess(courseId, userId) {
  try {
    console.log('Checking course access:', { courseId, userId })
    
    // Check if user is the instructor
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('instructor_id')
      .eq('id', courseId)
      .single()

    console.log('Course query result:', { course, courseError })

    if (courseError) {
      console.error('Course not found or error:', courseError)
      return false
    }

    if (course.instructor_id === userId) {
      console.log('User is the instructor - access granted')
      return true
    }

    // Check if user is enrolled
    const { data: enrollment, error: enrollmentError } = await supabase
      .from('enrollments')
      .select('id')
      .eq('course_id', courseId)
      .eq('student_id', userId)
      .single()

    console.log('Enrollment query result:', { enrollment, enrollmentError })

    if (enrollmentError) {
      console.error('Not enrolled or error:', enrollmentError)
      return false
    }

    const hasAccess = !!enrollment
    console.log('Access check result:', hasAccess)
    return hasAccess
  } catch (error) {
    console.error('Error checking course access:', error)
    return false
  }
}

/**
 * Broadcast a custom event to a course channel
 * Used for non-database events like typing indicators
 * @param {string} courseId - Course ID
 * @param {string} eventType - Event type (e.g., 'typing', 'presence_update')
 * @param {Object} payload - Event payload
 * @returns {Promise<void>}
 */
export async function broadcastEvent(courseId, eventType, payload) {
  if (!courseId || !eventType) {
    throw new Error('Course ID and event type are required')
  }

  try {
    const channelName = `course:${courseId}:messages`
    
    // Get or create channel
    const channel = supabase.channel(channelName)
    
    // Broadcast event
    await channel.send({
      type: 'broadcast',
      event: eventType,
      payload
    })
    
    console.log(`Event ${eventType} broadcast to ${channelName}`)
  } catch (error) {
    console.error('Error broadcasting event:', error)
    throw error
  }
}

/**
 * Send typing indicator to course channel
 * @param {string} courseId - Course ID
 * @param {string} userId - User ID
 * @param {boolean} isTyping - Whether user is typing
 * @returns {Promise<void>}
 */
export async function sendTypingIndicator(courseId, userId, isTyping) {
  await broadcastEvent(courseId, 'typing', {
    user_id: userId,
    is_typing: isTyping,
    timestamp: new Date().toISOString()
  })
}