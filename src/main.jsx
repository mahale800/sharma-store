import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

import { registerSW } from 'virtual:pwa-register';

let updateSW;

const registerServiceWorker = () => {
  updateSW = registerSW({
    onNeedRefresh() {
      if (confirm('New content available. Reload?')) {
        updateSW(true);
      }
    },
    onOfflineReady() {
      console.log('App is ready for offline work.');
    },
    onRegisterError(error) {
      console.error('SW registration failed:', error);
    },
  });
};

// Register service worker only in production
if (import.meta.env.PROD) {
  registerServiceWorker();
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
