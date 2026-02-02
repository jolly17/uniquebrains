import './ErrorState.css';

/**
 * Reusable error state component
 * Shows user-friendly error messages with retry option
 */
export default function ErrorState({ 
  message = 'Something went wrong', 
  onRetry,
  showRetry = true 
}) {
  return (
    <div className="error-state-container">
      <div className="error-state-content">
        <div className="error-icon">😕</div>
        <h3>{message}</h3>
        {showRetry && onRetry && (
          <button onClick={onRetry} className="retry-button">
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
