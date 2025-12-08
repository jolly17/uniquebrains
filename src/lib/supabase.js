import { createClient } from '@supabase/supabase-js'

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check your .env file.\n' +
    'Required: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
  )
}

// Create Supabase client with proper auth configuration
// Requirements: 1.2 (JWT 24-hour expiry), 1.5 (session expiration)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'uniquebrains-auth',
    flowType: 'pkce', // Use PKCE flow for better security
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'uniquebrains',
    },
  },
})

// Helper function to check if Supabase is connected
export async function checkSupabaseConnection() {
  try {
    const { error } = await supabase.from('_test').select('*').limit(1)
    
    // PGRST116 means table doesn't exist, which is fine - connection works
    if (error && error.code !== 'PGRST116') {
      console.error('Supabase connection error:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Supabase connection error:', error)
    return false
  }
}

// Export types for TypeScript users (optional)
export default supabase
