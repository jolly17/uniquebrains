import * as Sentry from '@sentry/react';

/**
 * Custom API Error class
 */
export class APIError extends Error {
  constructor(message, code, details) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Handle Supabase errors and send to Sentry
 * @param {Error} error - The error object from Supabase
 * @param {Object} context - Additional context about the operation
 * @returns {APIError} - Formatted API error
 */
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
      errorCode: error.code || 'UNKNOWN',
      operation: context.operation,
    },
    contexts: {
      supabase: {
        ...context,
        hint: error.hint,
        details: error.details,
      },
    },
  });

  // Also log to console in development
  if (import.meta.env.DEV) {
    console.error('Supabase Error:', {
      error: apiError,
      context,
      originalError: error,
    });
  }

  return apiError;
}

/**
 * Handle network errors
 * @param {Error} error - The network error
 * @param {Object} request - Request details
 * @returns {APIError} - Formatted API error
 */
export function handleNetworkError(error, request = {}) {
  const apiError = new APIError(
    'Network error occurred. Please check your connection.',
    'NETWORK_ERROR',
    { originalError: error.message }
  );

  Sentry.captureException(apiError, {
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

  if (import.meta.env.DEV) {
    console.error('Network Error:', { error: apiError, request });
  }

  return apiError;
}

/**
 * Get user-friendly error message
 * @param {Error} error - The error object
 * @returns {string} - User-friendly message
 */
export function getUserFriendlyMessage(error) {
  if (error instanceof APIError) {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found. Please try again.';
      case 'PGRST301':
        return 'You do not have permission to access this resource.';
      case 'NETWORK_ERROR':
        return 'Network error. Please check your internet connection.';
      case '23505':
        return 'This item already exists.';
      case '23503':
        return 'Cannot complete this action due to related data.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  }

  return error.message || 'An unexpected error occurred.';
}
