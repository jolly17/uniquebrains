import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry error tracking
 * Only runs in production with valid DSN
 */
export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;
  const isProd = import.meta.env.PROD;
  
  // Allow testing in dev if DSN is set
  const shouldInit = dsn && (isProd || import.meta.env.DEV);

  if (shouldInit) {
    Sentry.init({
      dsn,
      
      // Integrations
      integrations: [
        // Browser tracing for performance monitoring
        Sentry.browserTracingIntegration(),
        
        // Session replay for debugging
        Sentry.replayIntegration({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions for performance
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION || '1.0.0',
      
      // Privacy: scrub sensitive data before sending
      beforeSend(event, hint) {
        // Remove sensitive headers
        if (event.request) {
          delete event.request.cookies;
          if (event.request.headers) {
            delete event.request.headers.Authorization;
            delete event.request.headers.authorization;
          }
        }
        
        // Remove sensitive query params
        if (event.request?.url) {
          try {
            const url = new URL(event.request.url);
            url.searchParams.delete('token');
            url.searchParams.delete('apikey');
            event.request.url = url.toString();
          } catch (e) {
            // Invalid URL, skip
          }
        }
        
        return event;
      },
      
      // Ignore common non-critical errors
      ignoreErrors: [
        // Browser extensions
        'top.GLOBALS',
        'chrome-extension://',
        'moz-extension://',
        
        // ResizeObserver loop errors (non-critical)
        'ResizeObserver loop limit exceeded',
        'ResizeObserver loop completed with undelivered notifications',
        
        // Network errors that are expected
        'NetworkError',
        'Failed to fetch',
        'Load failed',
        
        // Non-Error promise rejections
        'Non-Error promise rejection captured',
      ],
    });

    console.log('✅ Sentry initialized');
  } else if (!isProd) {
    console.log('ℹ️ Sentry disabled in development');
  } else {
    console.warn('⚠️ Sentry DSN not configured');
  }
}

/**
 * Set user context for error tracking
 * @param {Object} user - User object with id, email, role
 */
export function setSentryUser(user) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Set custom context for debugging
 * @param {string} key - Context key
 * @param {Object} data - Context data
 */
export function setSentryContext(key, data) {
  Sentry.setContext(key, data);
}

/**
 * Add breadcrumb for debugging
 * @param {Object} breadcrumb - Breadcrumb data
 */
export function addBreadcrumb(breadcrumb) {
  Sentry.addBreadcrumb(breadcrumb);
}

/**
 * Manually capture an exception
 * @param {Error} error - Error to capture
 * @param {Object} context - Additional context
 */
export function captureException(error, context = {}) {
  Sentry.captureException(error, context);
}

/**
 * Manually capture a message
 * @param {string} message - Message to capture
 * @param {string} level - Severity level (info, warning, error)
 */
export function captureMessage(message, level = 'info') {
  Sentry.captureMessage(message, level);
}

// Re-export Sentry for direct access if needed
export { Sentry };
