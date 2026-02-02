# Error Handling & Monitoring - Design Document

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     React Application                        │
│                                                              │
│  ┌──────────────────┐      ┌─────────────────────────────┐ │
│  │ Error Boundaries │      │   Global Error Handler      │ │
│  │  (Component)     │─────▶│   - window.onerror          │ │
│  └──────────────────┘      │   - unhandledrejection      │ │
│                            │   - Sentry.captureException │ │
│  ┌──────────────────┐      └─────────────────────────────┘ │
│  │  API Error       │                    │                  │
│  │  Interceptors    │────────────────────┘                  │
│  └──────────────────┘                                       │
│                                                              │
└──────────────────────────────────┬───────────────────────────┘
                                   │
                                   ▼
                        ┌──────────────────────┐
                        │   Sentry.io          │
                        │   - Error Dashboard  │
                        │   - Alerts           │
                        │   - Issue Tracking   │
                        └──────────────────────┘
```

## Technology Stack

### Core Libraries
- **@sentry/react** - React SDK for error tracking
- **@sentry/vite-plugin** - Source maps upload for debugging
- **React Error Boundaries** - Component-level error catching
- **Custom error utilities** - Error classification and enrichment

### Sentry Configuration
- **Free Tier Limits**: 5,000 events/month
- **Data Retention**: 30 days
- **Source Maps**: Enabled for production debugging
- **Sampling**: 100% for errors, configurable for performance

## Implementation Design

### 1. Sentry Integration

#### 1.1 Installation & Setup
```javascript
// src/lib/sentry.js
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      integrations: [
        new BrowserTracing(),
        new Sentry.Replay({
          maskAllText: true,
          blockAllMedia: true,
        }),
      ],
      
      // Performance Monitoring
      tracesSampleRate: 0.1, // 10% of transactions
      
      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
      
      // Environment
      environment: import.meta.env.MODE,
      
      // Release tracking
      release: import.meta.env.VITE_APP_VERSION,
      
      // Privacy
      beforeSend(event, hint) {
        // Scrub sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers?.Authorization;
        }
        return event;
      },
      
      // Ignore common non-critical errors
      ignoreErrors: [
        'ResizeObserver loop limit exceeded',
        'Non-Error promise rejection captured',
      ],
    });
  }
}

export { Sentry };
```

#### 1.2 User Context
```javascript
// src/lib/sentry.js
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

export function setSentryContext(key, data) {
  Sentry.setContext(key, data);
}
```

### 2. Error Boundaries

#### 2.1 Global Error Boundary
```javascript
// src/components/ErrorBoundary.jsx
import { Component } from 'react';
import * as Sentry from '@sentry/react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h1>Something went wrong</h1>
          <p>We've been notified and are looking into it.</p>
          <button onClick={this.handleReset}>Go to Home</button>
          {import.meta.env.DEV && (
            <pre>{this.state.error?.toString()}</pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

#### 2.2 Page-Level Error Boundaries
```javascript
// src/components/PageErrorBoundary.jsx
import { Component } from 'react';
import * as Sentry from '@sentry/react';

class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'page',
        page: this.props.pageName,
      },
      contexts: {
        react: errorInfo,
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-error">
          <h2>Failed to load {this.props.pageName}</h2>
          <button onClick={this.handleRetry}>Retry</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
```

### 3. API Error Handling

#### 3.1 Supabase Error Interceptor
```javascript
// src/lib/errorHandler.js
import * as Sentry from '@sentry/react';

export class APIError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

export function handleSupabaseError(error, context = {}) {
  const apiError = new APIError(
    error.message || 'An error occurred',
    error.code || 'UNKNOWN',
    error.details || {}
  );

  // Log to Sentry with context
  Sentry.captureException(apiError, {
    tags: {
      errorType: 'supabase',
      errorCode: error.code,
    },
    contexts: {
      supabase: {
        ...context,
        hint: error.hint,
        details: error.details,
      },
    },
  });

  return apiError;
}

export function handleNetworkError(error, request) {
  Sentry.captureException(error, {
    tags: {
      errorType: 'network',
    },
    contexts: {
      request: {
        url: request.url,
        method: request.method,
      },
    },
  });

  return new APIError(
    'Network error occurred',
    'NETWORK_ERROR',
    { originalError: error.message }
  );
}
```

#### 3.2 Service Layer Integration
```javascript
// src/services/courseService.js (example)
import { supabase } from '../lib/supabase';
import { handleSupabaseError } from '../lib/errorHandler';
import * as Sentry from '@sentry/react';

export async function getCourses() {
  try {
    // Add breadcrumb for debugging
    Sentry.addBreadcrumb({
      category: 'api',
      message: 'Fetching courses',
      level: 'info',
    });

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('published', true);

    if (error) {
      throw handleSupabaseError(error, {
        operation: 'getCourses',
        table: 'courses',
      });
    }

    return data;
  } catch (error) {
    // Re-throw to let component handle it
    throw error;
  }
}
```

### 4. Toast Notifications

#### 4.1 Error Toast System
```javascript
// src/components/ErrorToast.jsx
import { useState, useEffect } from 'react';
import './ErrorToast.css';

let toastQueue = [];
let listeners = [];

export function showErrorToast(message, options = {}) {
  const toast = {
    id: Date.now(),
    message,
    type: options.type || 'error',
    duration: options.duration || 5000,
  };
  
  toastQueue.push(toast);
  listeners.forEach(listener => listener(toastQueue));
  
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== toast.id);
    listeners.forEach(listener => listener(toastQueue));
  }, toast.duration);
}

export function ErrorToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const listener = (newToasts) => setToasts([...newToasts]);
    listeners.push(listener);
    return () => {
      listeners = listeners.filter(l => l !== listener);
    };
  }, []);

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast toast-${toast.type}`}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}
```

### 5. Retry Logic

#### 5.1 Retry Wrapper
```javascript
// src/utils/retry.js
import * as Sentry from '@sentry/react';

export async function retryOperation(
  operation,
  options = {}
) {
  const {
    maxRetries = 3,
    delay = 1000,
    backoff = 2,
    onRetry = () => {},
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        const waitTime = delay * Math.pow(backoff, attempt);
        
        Sentry.addBreadcrumb({
          category: 'retry',
          message: `Retry attempt ${attempt + 1}/${maxRetries}`,
          level: 'warning',
          data: { waitTime, error: error.message },
        });

        onRetry(attempt + 1, waitTime);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }

  // All retries failed
  Sentry.captureException(lastError, {
    tags: {
      retryFailed: true,
      attempts: maxRetries + 1,
    },
  });

  throw lastError;
}
```

#### 5.2 React Hook for Retry
```javascript
// src/hooks/useRetry.js
import { useState, useCallback } from 'react';
import { retryOperation } from '../utils/retry';
import { showErrorToast } from '../components/ErrorToast';

export function useRetry(operation, options = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const result = await retryOperation(
        () => operation(...args),
        {
          ...options,
          onRetry: (attempt, waitTime) => {
            showErrorToast(
              `Retrying... (attempt ${attempt})`,
              { type: 'warning', duration: waitTime }
            );
          },
        }
      );
      return result;
    } catch (err) {
      setError(err);
      showErrorToast(err.message || 'Operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [operation, options]);

  return { execute, loading, error };
}
```

### 6. Marketplace Page Error Handling

#### 6.1 Enhanced Marketplace Component
```javascript
// src/pages/Marketplace.jsx (enhanced)
import { useState, useEffect } from 'react';
import { getCourses } from '../services/courseService';
import { useRetry } from '../hooks/useRetry';
import PageErrorBoundary from '../components/PageErrorBoundary';
import * as Sentry from '@sentry/react';

function MarketplaceContent() {
  const [courses, setCourses] = useState([]);
  const { execute: loadCourses, loading, error } = useRetry(getCourses);

  useEffect(() => {
    async function load() {
      try {
        Sentry.addBreadcrumb({
          category: 'navigation',
          message: 'Marketplace page loaded',
          level: 'info',
        });

        const data = await loadCourses();
        setCourses(data);
      } catch (err) {
        // Error already handled by useRetry
        console.error('Failed to load courses:', err);
      }
    }

    load();
  }, [loadCourses]);

  if (loading) {
    return <div>Loading courses...</div>;
  }

  if (error) {
    return (
      <div className="error-state">
        <h2>Failed to load courses</h2>
        <p>{error.message}</p>
        <button onClick={() => loadCourses()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="marketplace">
      {courses.map(course => (
        <CourseCard key={course.id} course={course} />
      ))}
    </div>
  );
}

export default function Marketplace() {
  return (
    <PageErrorBoundary pageName="Marketplace">
      <MarketplaceContent />
    </PageErrorBoundary>
  );
}
```

### 7. Environment Configuration

#### 7.1 Environment Variables
```bash
# .env.example
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
VITE_APP_VERSION=1.0.0
```

#### 7.2 Vite Configuration
```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { sentryVitePlugin } from '@sentry/vite-plugin';

export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      org: 'your-org',
      project: 'your-project',
      authToken: process.env.SENTRY_AUTH_TOKEN,
      sourcemaps: {
        assets: './dist/**',
      },
    }),
  ],
  build: {
    sourcemap: true, // Enable source maps for Sentry
  },
});
```

## Data Flow

### Error Capture Flow
```
1. Error occurs in application
   ↓
2. Caught by Error Boundary OR Global Handler
   ↓
3. Error enriched with context (user, page, breadcrumbs)
   ↓
4. Sent to Sentry with tags and metadata
   ↓
5. Sentry processes and groups similar errors
   ↓
6. Developer receives notification (if configured)
   ↓
7. Developer views error in Sentry dashboard
   ↓
8. Source maps allow viewing original code
```

### User Experience Flow
```
1. User encounters error
   ↓
2. Error Boundary catches it
   ↓
3. User sees friendly error message
   ↓
4. User can retry or navigate away
   ↓
5. Toast notification shows status
   ↓
6. App continues functioning (partial failure)
```

## Sentry Dashboard Configuration

### Issue Grouping
- Group by error message and stack trace
- Custom fingerprinting for API errors by endpoint
- Separate issues by environment (dev/prod)

### Alerts
- **Critical**: Immediate email for auth/payment errors
- **High**: Email digest for repeated errors (>10 in 1 hour)
- **Medium**: Daily summary of new error types

### Tags for Filtering
- `errorType`: supabase, network, ui, auth
- `page`: marketplace, course-detail, profile, etc.
- `userRole`: student, instructor, parent
- `errorCode`: Specific error codes from Supabase

## Privacy & Security

### Data Scrubbing
- Remove Authorization headers
- Mask email addresses in error messages
- Remove cookies from requests
- Block sensitive form fields

### PII Handling
- User ID only (no names/emails in context)
- IP addresses anonymized
- Session replay masks all text by default

## Performance Considerations

### Bundle Size
- Sentry SDK: ~50KB gzipped
- Lazy load Sentry in production only
- Tree-shake unused integrations

### Event Sampling
- 100% error capture (within 5k/month limit)
- 10% performance tracing
- 10% session replay (100% on errors)

### Offline Support
- Sentry queues events when offline
- Syncs when connection restored
- Max 30 events in queue

## Testing Strategy

### Unit Tests
- Test error boundary rendering
- Test error handler functions
- Test retry logic with mocked failures

### Integration Tests
- Test Sentry initialization
- Test error capture with mock DSN
- Test context enrichment

### Manual Testing
- Trigger test errors in dev environment
- Verify errors appear in Sentry
- Test retry flows and user experience

## Rollout Plan

### Phase 1: Setup (Week 1)
- Create Sentry account and project
- Install dependencies
- Configure Sentry initialization
- Add environment variables

### Phase 2: Core Integration (Week 1-2)
- Implement error boundaries
- Add global error handlers
- Integrate with Supabase services
- Add user context tracking

### Phase 3: Enhanced Features (Week 2)
- Implement retry logic
- Add toast notifications
- Configure source maps
- Set up alerts

### Phase 4: Monitoring (Week 3+)
- Monitor error rates
- Tune alert thresholds
- Refine error grouping
- Document common errors

## Success Criteria

### Technical Metrics
- ✅ 100% of unhandled errors captured
- ✅ Source maps working in production
- ✅ Error context includes user and page info
- ✅ Retry logic reduces transient failures by 50%

### User Experience
- ✅ No white screens of death
- ✅ Clear error messages for users
- ✅ Retry buttons work correctly
- ✅ App remains usable during partial failures

### Developer Experience
- ✅ Errors visible in Sentry within 1 minute
- ✅ Stack traces point to original source code
- ✅ Breadcrumbs show user actions before error
- ✅ Alerts notify team of critical issues

## Correctness Properties

### Property 1: Error Capture Completeness
**Statement**: All unhandled errors and promise rejections in the application are captured and sent to Sentry.

**Validates**: Requirements 1.1, 1.2

**Test Strategy**: 
- Trigger various error types (component errors, promise rejections, network failures)
- Verify each error appears in Sentry with correct metadata
- Use property-based testing to generate random error scenarios

### Property 2: User Context Preservation
**Statement**: Every error captured includes the current user's ID and role (if authenticated).

**Validates**: Requirements 1.2, 1.4

**Test Strategy**:
- Generate errors while logged in as different user types
- Verify Sentry events include user context
- Test with unauthenticated users (should not include user data)

### Property 3: Privacy Compliance
**Statement**: No sensitive data (passwords, tokens, PII) is included in error reports sent to Sentry.

**Validates**: Technical Constraints (privacy)

**Test Strategy**:
- Trigger errors with sensitive data in context
- Verify beforeSend hook scrubs sensitive fields
- Property test with various sensitive data patterns

### Property 4: Retry Idempotency
**Statement**: Retrying a failed operation produces the same result as the original operation would have if successful.

**Validates**: Requirements 5.1, 3.5

**Test Strategy**:
- Test retry logic with idempotent operations
- Verify retry count and backoff timing
- Property test with various failure patterns

### Property 5: Error Boundary Isolation
**Statement**: An error in one component does not crash the entire application.

**Validates**: Requirements 2.1, 5.2

**Test Strategy**:
- Trigger errors in nested components
- Verify parent components continue functioning
- Test multiple simultaneous errors in different boundaries

### Property 6: Graceful Degradation
**Statement**: When an error occurs, users can still access unaffected features of the application.

**Validates**: Requirements 5.5, 2.2

**Test Strategy**:
- Simulate partial failures (e.g., one API endpoint down)
- Verify other features remain accessible
- Test navigation and core functionality during errors

## Open Questions

1. Should we enable session replay for all users or only on errors?
   - **Decision**: Only on errors to stay within free tier limits

2. What's the threshold for "critical" errors that need immediate alerts?
   - **Decision**: Auth failures, payment errors, and errors affecting >10 users/hour

3. Should we build a fallback local logging system if Sentry is down?
   - **Decision**: Yes, log to localStorage as backup

4. How do we handle errors in development vs production?
   - **Decision**: Sentry only in production, console.error in development

## Dependencies

### External Services
- Sentry.io account (free tier)
- Source map upload during build

### NPM Packages
- @sentry/react: ^7.x
- @sentry/vite-plugin: ^2.x

### Internal Dependencies
- Existing Supabase client
- React Router for page context
- AuthContext for user information
