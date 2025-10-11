// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { initServiceWorker } from './swRegistration';

if (import.meta.env.PROD) {
  initServiceWorker();
}


ReactDOM.createRoot(document.getElementById('root')).render(<App />);