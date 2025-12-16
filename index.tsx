import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from '@sentry/react';
import App from './App';
import './index.css';

// Initialize Sentry for production error tracking
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN ||
  "https://a23afca2cde0d067f3350dee16b25960@o4510487721869312.ingest.us.sentry.io/4510487734845440";

Sentry.init({
  dsn: SENTRY_DSN,
  environment: import.meta.env.MODE,
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: 0.1,
  sendDefaultPii: true, // As recommended by Sentry
});

// Expose Sentry to window for console testing
(window as unknown as { Sentry: typeof Sentry }).Sentry = Sentry;

// Send a test message to verify connection
Sentry.captureMessage('Bankey app initialized', 'info');

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