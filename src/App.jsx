import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from '@/context/Web3Context.jsx'
import { WebSocketProvider } from '@/context/WebSocketContext.jsx'
import { AuthProvider } from '@/context/AuthContext.jsx'
import { AppModeProvider } from '@/context/AppModeContext.jsx'
import AppShell from '@/layouts/AppShell.jsx'
import { ErrorBoundary } from 'react-error-boundary'
import ErrorFallback from '@/components/ErrorFallback.jsx'

// Pages
const Overview = React.lazy(() => import('@/pages/Overview.jsx'))
const Alerts = React.lazy(() => import('@/pages/Alerts.jsx'))
const Signals = React.lazy(() => import('@/pages/Signals.jsx'))
const News = React.lazy(() => import('@/pages/News.jsx'))
const Analytics = React.lazy(() => import('@/pages/Analytics.jsx'))
const NotFound = React.lazy(() => import('@/pages/NotFound.jsx'));
const Academy = React.lazy(() => import('@/pages/Academy.jsx'));
const AcademyDashboard = React.lazy(() => import('@/pages/AcademyDashboard.jsx'));
const Meditations = React.lazy(() => import('@/pages/Meditations.jsx'));
const Settings = React.lazy(() => import('@/pages/Settings.jsx'))
const Portfolio = React.lazy(() => import('@/pages/Portfolio.jsx'))
const TA = React.lazy(() => import('@/pages/TA.jsx'))
const Calibration = React.lazy(() => import('@/pages/Calibration.jsx'))
const Forecasts = React.lazy(() => import('@/pages/Forecasts.jsx'))
const Events = React.lazy(() => import('@/pages/Events.jsx'))
const Polymarket = React.lazy(() => import('@/pages/Polymarket.jsx'))
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback.jsx'))
const AdminDashboard = React.lazy(() => import('@/pages/AdminDashboard.jsx'))
const Login = React.lazy(() => import('@/pages/Login.jsx'))

import { TradeProvider } from '@/context/TradeContext.jsx'
import { TradingProvider } from '@/context/TradingContext.jsx'
import TradeModal from '@/components/TradeModal.jsx'

const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh', 
    color: '#fff', 
    backgroundColor: '#000',
    fontFamily: 'Inter, sans-serif'
  }}>
    <div style={{
      width: '50px',
      height: '50px',
      border: '3px solid rgba(255,255,255,0.1)',
      borderTop: '3px solid #2ecc71',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
      marginBottom: '1rem'
    }} />
    <style>{`
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    `}</style>
    <div style={{ fontSize: '0.875rem', letterSpacing: '0.1em', opacity: 0.7 }}>SPECTR TRADING</div>
  </div>
);

export default function App() {
  return (
    <AppModeProvider>
      <Web3Provider>
        <AuthProvider>
          <TradingProvider>
            <WebSocketProvider>
            <TradeProvider>
              <BrowserRouter>
                <TradeModal />
                <ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
                  <Suspense fallback={<LoadingSpinner />}>
                    <Routes>
                      {/* Main App Terminal at Root */}
                      <Route path='/' element={<AppShell />}>
                        <Route index element={<Overview />} />
                        <Route path='portfolio' element={<Portfolio />} />
                        <Route path='alerts' element={<Alerts />} />
                        <Route path='signals' element={<Signals />} />
                        <Route path='news' element={<News />} />
                        <Route path='academy' element={<Academy />} />
                        <Route path='tracker' element={<AcademyDashboard />} />
                        <Route path='meditations' element={<Meditations />} />
                        <Route path='analytics' element={<Analytics />} />
                        <Route path='settings' element={<Settings />} />
                        <Route path='forecasts' element={<Forecasts />} />
                        <Route path='events' element={<Events />} />
                        <Route path='polymarket' element={<Polymarket />} />
                      </Route>

                      <Route path='/login' element={<Login />} />
                      <Route path='/auth/callback' element={<AuthCallback />} />
                      <Route path='/admin' element={<AdminDashboard />} />
                      <Route path='*' element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </BrowserRouter>
            </TradeProvider>
          </WebSocketProvider>
        </TradingProvider>
      </AuthProvider>
    </Web3Provider>
    </AppModeProvider>
  )
}
