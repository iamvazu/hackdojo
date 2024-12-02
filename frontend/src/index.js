import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Error handling for development
if (process.env.NODE_ENV === 'development') {
  window.onerror = function(message, source, lineno, colno, error) {
    console.error('Global error:', { message, source, lineno, colno, error });
    return false;
  };
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
