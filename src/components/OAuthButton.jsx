/**
 * OAuth Button Component
 * 
 * Provides OAuth sign-in functionality for Google and GitHub
 * Requirements: 1.6 - OAuth providers support
 */

import { supabase } from '../lib/supabase'
import './OAuthButton.css'

export function OAuthButton({ provider, children, className = '' }) {
  const handleOAuthSignIn = async () => {
    try {
      // Store the intended redirect URL in localStorage before OAuth flow
      // This will be retrieved after OAuth callback
      const currentPath = window.location.pathname
      const redirectUrl = sessionStorage.getItem('redirectAfterLogin')
      
      if (redirectUrl) {
        // If there's already a redirect URL stored (from login page state), keep it
        localStorage.setItem('oauthRedirectUrl', redirectUrl)
      }
      
      const options = {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }

      // Request additional scopes for Google to get user profile info
      if (provider === 'google') {
        options.scopes = 'email profile'
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: options
      })
      
      if (error) {
        throw error
      }
      
      // OAuth redirect will happen automatically
    } catch (error) {
      console.error(`OAuth ${provider} error:`, error)
      alert(`Failed to sign in with ${provider}: ${error.message}`)
    }
  }

  return (
    <button 
      onClick={handleOAuthSignIn} 
      className={`oauth-button oauth-button-${provider} ${className}`}
      type="button"
    >
      {children}
    </button>
  )
}
