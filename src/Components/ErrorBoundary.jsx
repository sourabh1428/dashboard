import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Error Boundary component to catch JavaScript errors anywhere in the child component tree,
 * log those errors, and display a fallback UI instead of crashing the whole app.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRefresh = () => {
    // Refresh the page
    window.location.reload();
  };

  handleGoHome = () => {
    // Navigate to home page
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex flex-col items-center">
              <AlertTriangle className="h-16 w-16 text-yellow-400 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Oops! Something went wrong</h1>
              <p className="text-gray-400 text-center mb-4">
                We're sorry, but there was an error loading this page.
              </p>
              
              {process.env.NODE_ENV !== 'production' && this.state.error && (
                <div className="w-full bg-gray-900 rounded p-4 mb-4 overflow-auto">
                  <p className="text-red-400 font-mono text-sm break-words">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo && (
                    <details className="mt-2">
                      <summary className="text-gray-400 cursor-pointer">Stack trace</summary>
                      <pre className="text-gray-400 text-xs mt-2 overflow-auto max-h-64">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </div>
              )}
              
              <div className="flex gap-4">
                <Button 
                  onClick={this.handleRefresh}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refresh Page
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:bg-gray-700"
                >
                  Go to Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary; 