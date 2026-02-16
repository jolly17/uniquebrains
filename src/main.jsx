import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { initSentry } from './lib/sentry'
import ErrorBoundary from './components/ErrorBoundary'

// Initialize Sentry error tracking
initSentry()

// Import admin utility for development
if (import.meta.env.DEV) {
  import('./utils/makeAdmin.js')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
