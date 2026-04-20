import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

// Manual Service Worker Registration
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(() => console.log("SW registered"))
      .catch(err => console.log("SW error", err));
  });

  // App Update System
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    alert("New update available! Please refresh.");
  });
}

// Push Notification Setup
if ("Notification" in window) {
  Notification.requestPermission().then(permission => {
    if (permission === "granted") {
      console.log("Notifications enabled");
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
