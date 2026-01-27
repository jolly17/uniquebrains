/**
 * OAuth Callback Handler
 * 
 * Handles OAuth redirects from Google and GitHub
 * Requirements: 1.6 - OAuth callbacks configuration
 */

import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import './AuthCallback.css'

export function AuthCallback() {
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const hasProcessed = useRef(false)

  useEffect(() => {
    // Prevent double execution in React Strict Mode
    if (hasProcessed.current) {
      return
    }
    
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      hasProcessed.current = true
      try {
        // Get the session from the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          throw sessionError
        }

        if (session) {
          console.log('=== OAuth Callback Debug ===')
          console.log('User ID:', session.user.id)
          console.log('User Email:', session.user.email)
          console.log('User Metadata:', session.user.user_metadata)
          console.log('========================')
          
          // Try to check if user has a profile
          let profile = null
          let profileError = null
          
          try {
            const result = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single()
            
            profile = result.data
            profileError = result.error
          } catch (err) {
            console.log('Profile query error (will attempt to create):', err.message)
            profileError = err
          }

          console.log('🔍 Profile check result:', { profile, profileError })

          // If no profile exists or there was an error, try to create one
          if (!profile || profileError) {
            console.log('🔄 No profile found, creating new profile...')
            try {
              // Extract name from user metadata
              // Google provides: full_name, name, given_name, family_name
              // GitHub provides: full_name, name
              const metadata = session.user.user_metadata || {}
              
              console.log('User metadata:', metadata) // Debug log
              
              let firstName = 'User'
              let lastName = ''
              
              // Try different fields that providers might use
              if (metadata.given_name) {
                // Google provides given_name and family_name
                firstName = metadata.given_name
                lastName = metadata.family_name || ''
              } else if (metadata.full_name) {
                // Fallback to splitting full_name
                const nameParts = metadata.full_name.split(' ')
                firstName = nameParts[0] || 'User'
                lastName = nameParts.slice(1).join(' ') || ''
              } else if (metadata.name) {
                // Some providers use 'name' instead of 'full_name'
                const nameParts = metadata.name.split(' ')
                firstName = nameParts[0] || 'User'
                lastName = nameParts.slice(1).join(' ') || ''
              }
              
              // Check if there's a role preference in localStorage (from OAuth flow)
              const preferredRole = localStorage.getItem('oauth_role_preference') || 'parent'
              console.log('🔍 OAuth role preference from localStorage:', preferredRole)
              localStorage.removeItem('oauth_role_preference') // Clean up
              
              console.log('Attempting to create profile with:', {
                id: session.user.id,
                email: session.user.email,
                first_name: firstName,
                last_name: lastName,
                role: preferredRole,
                avatar_url: metadata.avatar_url || metadata.picture || null
              })

              const { data: insertData, error: insertError } = await supabase
                .from('profiles')
                .insert({
                  id: session.user.id,
                  email: session.user.email,
                  first_name: firstName,
                  last_name: lastName,
                  role: preferredRole, // Use preferred role or default to parent
                  avatar_url: metadata.avatar_url || metadata.picture || null,
                  neurodiversity_profile: [], // Initialize as empty array
                  expertise: [] // Initialize as empty array
                })
                .select()

              if (insertError) {
                // Check if it's a duplicate key error (profile already exists)
                if (insertError.code === '23505') {
                  console.log('✅ Profile already exists (returning user)')
                  // Profile already exists, fetch it
                  const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()
                  
                  profile = existingProfile
                  
                  // If the existing profile has wrong role, try to update it
                  if (profile && profile.role !== 'instructor' && profile.role !== 'student' && preferredRole !== profile.role) {
                    console.log(`🔧 Updating existing profile role from '${profile.role}' to '${preferredRole}'`)
                    const { error: updateError } = await supabase
                      .from('profiles')
                      .update({ role: preferredRole })
                      .eq('id', session.user.id)
                    
                    if (!updateError) {
                      profile.role = preferredRole
                      console.log('✅ Profile role updated successfully')
                    } else {
                      console.error('❌ Failed to update profile role:', updateError)
                    }
                  }
                } else {
                  console.error('❌ Error creating profile:', insertError)
                  console.error('Error code:', insertError.code)
                  console.error('Error message:', insertError.message)
                  console.error('Error details:', insertError.details)
                }
              } else {
                console.log('✅ Profile created successfully! (new user)')
                console.log('Profile data:', insertData)
                console.log('Name:', firstName, lastName)
                // Set profile from insert data
                profile = insertData?.[0] || { role: 'parent' }
                
                // NEW USER - Redirect to onboarding
                console.log('Redirecting new user to onboarding...')
                navigate('/onboarding', {
                  state: {
                    userId: session.user.id,
                    userName: firstName
                  },
                  replace: true
                })
                return // Exit early to prevent normal redirect
              }
            } catch (insertErr) {
              console.error('Insert error:', insertErr)
              // Continue anyway
            }
          } else {
            console.log('✅ Profile already exists')
            console.log('📋 Existing profile role:', profile?.role)
            
            // If existing profile has wrong role, update it
            if (profile && profile.role !== 'instructor' && profile.role !== 'student') {
              console.log('🔧 Existing profile has invalid role, checking for role preference...')
              const preferredRole = localStorage.getItem('oauth_role_preference') || 'student'
              console.log('🔍 OAuth role preference from localStorage:', preferredRole)
              localStorage.removeItem('oauth_role_preference') // Clean up
              
              if (preferredRole !== 'student') {
                console.log(`🔧 Updating existing profile role from 'student' to '${preferredRole}'`)
                try {
                  const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ role: preferredRole })
                    .eq('id', session.user.id)
                  
                  if (!updateError) {
                    profile.role = preferredRole
                    console.log('✅ Profile role updated successfully')
                  } else {
                    console.error('❌ Failed to update profile role:', updateError)
                  }
                } catch (updateErr) {
                  console.error('❌ Update error:', updateErr)
                }
              }
            }
          }

          // Check if user needs onboarding (profile exists but incomplete)
          const userRole = profile?.role || 'parent'
          const needsOnboarding = !profile?.bio && !profile?.neurodiversity_profile?.length
          
          console.log('User role:', userRole)
          console.log('Needs onboarding:', needsOnboarding)
          console.log('Profile completeness:', { 
            bio: profile?.bio, 
            neurodiversity_profile: profile?.neurodiversity_profile 
          })
          
          if (needsOnboarding) {
            console.log('Redirecting to onboarding (incomplete profile)')
            navigate('/onboarding', {
              state: {
                userId: session.user.id,
                userName: profile?.first_name || session.user.user_metadata?.full_name?.split(' ')[0] || 'there'
              },
              replace: true
            })
          } else {
            console.log('Redirecting returning user with role:', userRole)
            
            // Redirect based on user role
            if (userRole === 'instructor') {
              navigate('/teach/dashboard', { replace: true })
            } else if (userRole === 'student') {
              navigate('/learn/dashboard', { replace: true })
            } else {
              // Fallback to marketplace
              navigate('/marketplace', { replace: true })
            }
          }
        } else {
          // No session, redirect to login
          navigate('/login')
        }
      } catch (err) {
        console.error('Auth callback error:', err)
        setError(err.message)
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      }
    }

    handleAuthCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-error">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <p>Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-callback">
      <div className="auth-callback-loading">
        <div className="spinner"></div>
        <p>Completing sign in...</p>
      </div>
    </div>
  )
}
