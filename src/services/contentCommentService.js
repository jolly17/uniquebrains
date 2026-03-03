/**
 * Content Comment Service
 * Handles CRUD operations for comments on any content page
 * 
 * SCALABLE DESIGN: Uses flexible text identifiers for content pages
 * - No enum restrictions - any page identifier works
 * - Simply pass a unique slug/identifier when using the component
 * - Examples: 'neurodiversity', 'sensory-differences', 'new-guide-2024'
 */

import { supabase } from '../lib/supabase';

/**
 * Common content page identifiers (for convenience, not required)
 * You can use any string identifier - these are just the current pages
 */
export const CONTENT_PAGES = {
  NEURODIVERSITY: 'neurodiversity',
  SENSORY_DIFFERENCES: 'sensory_differences',
  HYGIENE_GUIDE: 'hygiene_guide'
  // Add new pages here for autocomplete, or just pass any string directly
};

/**
 * Get all comments for a specific content page
 * @param {string} contentPage - The content page identifier
 * @param {Object} options - Query options
 * @param {number} options.limit - Maximum number of comments to return
 * @param {number} options.offset - Number of comments to skip (for pagination)
 * @returns {Promise<Array>} Array of comments with user profile info
 */
export async function getCommentsByPage(contentPage, options = {}) {
  const { limit = 50, offset = 0 } = options;

  // First, get the comments
  const { data: comments, error } = await supabase
    .from('content_comments')
    .select('*')
    .eq('content_page', contentPage)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Error fetching comments:', error);
    throw new Error('Failed to load comments');
  }

  if (!comments || comments.length === 0) {
    return [];
  }

  // Get unique user IDs (excluding anonymous)
  const userIds = [...new Set(comments.filter(c => !c.is_anonymous && c.user_id).map(c => c.user_id))];

  // Fetch profiles for those users
  let profilesMap = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (profiles) {
      profilesMap = profiles.reduce((acc, p) => {
        acc[p.id] = p;
        return acc;
      }, {});
    }
  }

  // Merge profiles into comments
  return comments.map(comment => ({
    ...comment,
    profiles: comment.user_id ? profilesMap[comment.user_id] || null : null
  }));
}

/**
 * Get comment count for a specific content page
 * @param {string} contentPage - The content page identifier
 * @returns {Promise<number>} Number of comments
 */
export async function getCommentCount(contentPage) {
  const { count, error } = await supabase
    .from('content_comments')
    .select('*', { count: 'exact', head: true })
    .eq('content_page', contentPage)
    .eq('is_approved', true);

  if (error) {
    console.error('Error fetching comment count:', error);
    return 0;
  }

  return count || 0;
}

/**
 * Create a new comment
 * @param {Object} commentData - The comment data
 * @param {string} commentData.contentPage - The content page identifier (any unique string)
 * @param {string} commentData.commentText - The comment text
 * @param {boolean} commentData.isAnonymous - Whether to post anonymously
 * @param {string} userId - The user's ID
 * @returns {Promise<Object>} The created comment
 */
export async function createComment(commentData, userId) {
  if (!userId) {
    throw new Error('You must be logged in to post a comment');
  }

  const { contentPage, commentText, isAnonymous = false } = commentData;

  // Validate content page identifier
  if (!contentPage || contentPage.trim().length < 1) {
    throw new Error('Content page identifier is required');
  }

  // Validate comment text
  if (!commentText || commentText.trim().length < 3) {
    throw new Error('Comment must be at least 3 characters long');
  }

  if (commentText.length > 2000) {
    throw new Error('Comment must be less than 2000 characters');
  }

  const { data, error } = await supabase
    .from('content_comments')
    .insert({
      content_page: contentPage,
      user_id: userId,
      comment_text: commentText.trim(),
      is_anonymous: isAnonymous
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw new Error('Failed to post comment');
  }

  // Fetch the user's profile if not anonymous
  let profiles = null;
  if (!isAnonymous && userId) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, first_name, last_name')
      .eq('id', userId)
      .single();
    profiles = profile;
  }

  return { ...data, profiles };
}

/**
 * Update an existing comment
 * @param {string} commentId - The comment ID
 * @param {Object} updates - The updates to apply
 * @param {string} updates.commentText - The new comment text
 * @param {string} userId - The user's ID (for authorization)
 * @returns {Promise<Object>} The updated comment
 */
export async function updateComment(commentId, updates, userId) {
  if (!userId) {
    throw new Error('You must be logged in to update a comment');
  }

  const { commentText } = updates;

  // Validate comment text
  if (commentText !== undefined) {
    if (!commentText || commentText.trim().length < 3) {
      throw new Error('Comment must be at least 3 characters long');
    }

    if (commentText.length > 2000) {
      throw new Error('Comment must be less than 2000 characters');
    }
  }

  const { data, error } = await supabase
    .from('content_comments')
    .update({
      comment_text: commentText.trim()
    })
    .eq('id', commentId)
    .eq('user_id', userId) // Ensure user owns the comment
    .select()
    .single();

  if (error) {
    console.error('Error updating comment:', error);
    throw new Error('Failed to update comment');
  }

  return data;
}

/**
 * Delete a comment
 * @param {string} commentId - The comment ID
 * @param {string} userId - The user's ID (for authorization)
 * @returns {Promise<void>}
 */
export async function deleteComment(commentId, userId) {
  if (!userId) {
    throw new Error('You must be logged in to delete a comment');
  }

  const { error } = await supabase
    .from('content_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId); // Ensure user owns the comment

  if (error) {
    console.error('Error deleting comment:', error);
    throw new Error('Failed to delete comment');
  }
}

/**
 * Get comments by a specific user
 * @param {string} userId - The user's ID
 * @returns {Promise<Array>} Array of comments by the user
 */
export async function getCommentsByUser(userId) {
  const { data, error } = await supabase
    .from('content_comments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user comments:', error);
    throw new Error('Failed to load your comments');
  }

  return data || [];
}