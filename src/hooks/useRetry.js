import { useState, useCallback } from 'react';
import { retryOperation } from '../utils/retry';
import { getUserFriendlyMessage } from '../lib/errorHandler';

/**
 * Hook for retrying async operations with loading and error states
 * @param {Function} operation - The async operation to execute
 * @param {Object} options - Retry options
 * @returns {Object} - { execute, loading, error, retry }
 */
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
          onRetry: (attempt, waitTime, err) => {
            console.log(`Retrying... (attempt ${attempt})`);
            if (options.onRetry) {
              options.onRetry(attempt, waitTime, err);
            }
          },
        }
      );
      return result;
    } catch (err) {
      const friendlyMessage = getUserFriendlyMessage(err);
      setError(friendlyMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [operation, options]);

  const retry = useCallback(() => {
    return execute();
  }, [execute]);

  return { execute, loading, error, retry };
}
