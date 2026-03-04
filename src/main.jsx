import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from '@/components/ErrorBoundary.jsx'
import './i18n'
import { registerSW } from 'virtual:pwa-register'

// Register PWA Service Worker for offline support and auto-updates
registerSW({ immediate: true })

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
)
