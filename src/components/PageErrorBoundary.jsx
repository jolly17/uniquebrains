import { Component } from 'react';
import * as Sentry from '@sentry/react';
import './PageErrorBoundary.css';

/**
 * Page-level Error Boundary
 * Catches errors in specific pages without crashing the entire app
 */
class PageErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`PageErrorBoundary (${this.props.pageName}) caught an error:`, error, errorInfo);
    
    // Send to Sentry
    Sentry.captureException(error, {
      tags: {
        errorBoundary: 'page',
        page: this.props.pageName,
      },
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-error-boundary">
          <div className="page-error-content">
            <h2>😕 Failed to load {this.props.pageName}</h2>
            <p>Something went wrong. We've been notified.</p>
            
            <div className="page-error-actions">
              <button onClick={this.handleRetry} className="btn-primary">
                Try Again
              </button>
              <button onClick={() => window.history.back()} className="btn-secondary">
                Go Back
              </button>
            </div>

            {import.meta.env.DEV && this.state.error && (
              <details className="error-details">
                <summary>Error Details (Dev Only)</summary>
                <pre>{this.state.error.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default PageErrorBoundary;
