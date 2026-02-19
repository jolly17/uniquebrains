import { supabase } from '../lib/supabase'

/**
 * Get profile by ID
 * @param {string} profileId - Profile ID
 * @returns {Promise<Object>} Profile data
 */
export async function getProfileById(profileId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single()

  if (error) throw error
  return data
}

/**
 * Get all instructors
 * @returns {Promise<Array>} List of instructor profiles
 */
export async function getAllInstructors() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'instructor')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

/**
 * Update profile
 * @param {string} profileId - Profile ID
 * @param {Object} updates - Profile updates
 * @returns {Promise<Object>} Updated profile data
 */
export async function updateProfile(profileId, updates) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}
