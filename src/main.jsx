import React from 'react'
import ReactDOM from 'react-dom/client'
import { hydrate, render } from 'react-dom'
import App from './App'
import './index.css'
import 'leaflet/dist/leaflet.css'
import { initSentry } from './lib/sentry'
import ErrorBoundary from './components/ErrorBoundary'

// Early redirect: If we land on a non-auth page with a ?code= param,
// redirect to /auth/callback BEFORE Supabase client consumes the code.
// This handles Supabase stripping the path from redirect URLs.
const _earlyRedirectParams = new URLSearchParams(window.location.search)
const _earlyRedirectCode = _earlyRedirectParams.get('code')
const _earlyRedirectPath = window.location.pathname

if (_earlyRedirectCode && !_earlyRedirectPath.startsWith('/auth/')) {
  // Check if this is a password recovery flow
  const _isRecovery = localStorage.getItem('password_recovery_pending') === 'true'
  if (_isRecovery) {
    _earlyRedirectParams.set('type', 'recovery')
  }
  window.location.replace(`/auth/callback?${_earlyRedirectParams.toString()}`)
} else {
  // Only initialize the app if we're not redirecting
  
  // Initialize Sentry error tracking
  initSentry()

  // Import admin utility for development
  if (import.meta.env.DEV) {
    import('./utils/makeAdmin.js')
  }

  const rootElement = document.getElementById('root')
  const app = (
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  )

  // Use hydrate for prerendered content, render for normal SPA
  if (rootElement.hasChildNodes()) {
    hydrate(app, rootElement)
  } else {
    ReactDOM.createRoot(rootElement).render(app)
  }
}
