import * as Sentry from '@sentry/react';

/**
 * Retry an async operation with exponential backoff
 * @param {Function} operation - The async function to retry
 * @param {Object} options - Retry options
 * @returns {Promise} - Result of the operation
 */
export async function retryOperation(operation, options = {}) {
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
          data: { 
            waitTime, 
            error: error.message,
            attempt: attempt + 1,
          },
        });

        onRetry(attempt + 1, waitTime, error);
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
