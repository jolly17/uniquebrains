/**
 * Development utility to make a user an admin
 * 
 * IMPORTANT: This is for development/testing only!
 * In production, admin roles should be assigned directly in Supabase dashboard
 * 
 * Usage:
 * 1. Open browser console on your app
 * 2. Import this function (if using dev tools)
 * 3. Call: makeAdmin('user-email@example.com')
 */

import { supabase } from '../lib/supabase'

export async function makeAdmin(email) {
  try {
    // Check if user is already authenticated as admin
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('❌ You must be logged in to use this utility')
      return
    }

    // Update the user's role to admin
    const { data, error } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('email', email)
      .select()
      .single()

    if (error) {
      console.error('❌ Error making user admin:', error.message)
      return
    }

    console.log('✅ Successfully made user admin:', data)
    console.log('🔄 Please refresh the page for changes to take effect')
    
    return data
  } catch (err) {
    console.error('❌ Error:', err)
  }
}

// Make it available in browser console during development
if (import.meta.env.DEV) {
  window.makeAdmin = makeAdmin
}
