import { supabase } from '../lib/supabase'

/**
 * Debug function to check and fix user profile role
 * Use this to manually fix role assignment issues
 */
export async function checkAndFixProfile(userId, correctRole = 'parent') {
  try {
    console.log('🔍 Checking profile for user:', userId)
    
    // Get current profile
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.error('❌ Error fetching profile:', fetchError)
      return { success: false, error: fetchError }
    }

    console.log('📋 Current profile:', profile)

    // Check if role needs fixing
    if (profile.role !== correctRole) {
      console.log(`🔧 Fixing role from '${profile.role}' to '${correctRole}'`)
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: correctRole })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error updating role:', updateError)
        return { success: false, error: updateError }
      }

      console.log('✅ Role updated successfully!')
      return { success: true, updated: true, oldRole: profile.role, newRole: correctRole }
    } else {
      console.log('✅ Role is already correct')
      return { success: true, updated: false, role: profile.role }
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error)
    return { success: false, error }
  }
}

/**
 * Debug function to list all profiles and their roles
 */
export async function listAllProfiles() {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching profiles:', error)
      return
    }

    console.log('📋 All profiles:')
    console.table(profiles)
    return profiles
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

// Make functions available globally for debugging
if (typeof window !== 'undefined') {
  window.checkAndFixProfile = checkAndFixProfile
  window.listAllProfiles = listAllProfiles
}