// /components/common/ErrorBoundary.jsx
'use client';

import { useState, useEffect } from 'react';
import Button from './Button';

/**
 * Error Boundary Component that catches JavaScript errors
 * and displays a fallback UI instead of crashing
 */
export default function ErrorBoundary({
  children,
  fallback
}) {
  const [error, setError] = useState(null);
  
  useEffect(() => {
    // Create error handler
    const errorHandler = (error, errorInfo) => {
      console.error('Caught error:', error, errorInfo);
      setError(error);
    };
    
    // Set up error event listeners
    window.addEventListener('error', (event) => {
      errorHandler(event.error);
      event.preventDefault();
    });
    
    // Clean up
    return () => {
      window.removeEventListener('error', errorHandler);
    };
  }, []);
  
  const resetError = () => {
    setError(null);
  };
  
  if (error) {
    if (fallback) {
      return typeof fallback === 'function' ? fallback(error, resetError) : fallback;
    }
    
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded my-4" role="alert">
        <h2 className="text-xl font-bold text-red-700 mb-2">Something Went Wrong</h2>
        <div className="text-red-600 mb-4">
          <p className="mb-2">We encountered an error. Please try again.</p>
          {error && (
            <div className="mt-2 text-sm bg-white p-2 rounded border border-red-200 overflow-auto">
              <p>{error.toString()}</p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={resetError}>Try Again</Button>
          <Button 
            variant="secondary" 
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }
  
  return children;
}