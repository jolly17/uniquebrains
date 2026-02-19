import React from 'react'
import ReactDOM from 'react-dom/client'
import { hydrate, render } from 'react-dom'
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
