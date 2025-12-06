import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';

// Initialize Sentry for production error tracking
console.log('[Sentry Debug] DSN present:', !!import.meta.env.VITE_SENTRY_DSN);

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    integrations: [Sentry.browserTracingIntegration()],
    tracesSampleRate: 0.1, // 10% of transactions for performance monitoring
  });
  console.log('[Sentry Debug] Initialized successfully');
} else {
  console.warn('[Sentry Debug] DSN not found - Sentry will not initialize');
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);