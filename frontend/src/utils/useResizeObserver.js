import { useEffect } from 'react';

// Utility to handle ResizeObserver errors
export const useResizeObserverFix = () => {
  useEffect(() => {
    // Store the original error handler
    const originalError = window.console.error;
    
    // Create a custom error handler
    window.console.error = (...args) => {
      if (
        args[0]?.includes?.('ResizeObserver') || 
        args[0]?.message?.includes?.('ResizeObserver')
      ) {
        // Ignore ResizeObserver errors
        return;
      }
      originalError.apply(window.console, args);
    };

    // Cleanup function to restore original error handler
    return () => {
      window.console.error = originalError;
    };
  }, []);
};
