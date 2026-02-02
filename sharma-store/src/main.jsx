import { ShopProvider } from './context/ShopContext'; // Keeping imported for now if used elsewhere? No, remove.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import GlobalErrorBoundary from './components/GlobalErrorBoundary';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </React.StrictMode>
);
