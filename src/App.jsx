import React, { Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from '@/context/Web3Context.jsx'
import { WebSocketProvider } from '@/context/WebSocketContext.jsx'
import AppShell from '@/layouts/AppShell.jsx'

// Pages
const Overview = React.lazy(() => import('@/pages/Overview.jsx'))
const Alerts = React.lazy(() => import('@/pages/Alerts.jsx'))
const Signals = React.lazy(() => import('@/pages/Signals.jsx'))
const News = React.lazy(() => import('@/pages/News.jsx'))
const Analytics = React.lazy(() => import('@/pages/Analytics.jsx'))
const NotFound = React.lazy(() => import('@/pages/NotFound.jsx'))
const Arbitrage = React.lazy(() => import('@/pages/Arbitrage.jsx'))
const Staking = React.lazy(() => import('@/pages/Staking.jsx'))
const Academy = React.lazy(() => import('@/pages/Academy.jsx'))
const Settings = React.lazy(() => import('@/pages/Settings.jsx'))
const Pricing = React.lazy(() => import('@/pages/Pricing.jsx'))
const Portfolio = React.lazy(() => import('@/pages/Portfolio.jsx'))
const TA = React.lazy(() => import('@/pages/TA.jsx'))
const Calibration = React.lazy(() => import('@/pages/Calibration.jsx'))
const Forecasts = React.lazy(() => import('@/pages/Forecasts.jsx'))
const Events = React.lazy(() => import('@/pages/Events.jsx'))
const Polymarket = React.lazy(() => import('@/pages/Polymarket.jsx'))
const AuthCallback = React.lazy(() => import('@/pages/AuthCallback.jsx'))
import { TradeProvider } from '@/context/TradeContext.jsx'

import { TradingProvider } from '@/context/TradingContext.jsx'
import TradeModal from '@/components/TradeModal.jsx'



export default function App() {
  return (
    <Web3Provider>
      <TradingProvider>
        <WebSocketProvider>
          <TradeProvider>
            <BrowserRouter>
              <TradeModal />
              <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff', backgroundColor: '#000' }}>Loading...</div>}>
                <Routes>
                  {/* Main App Terminal at Root */}
                  <Route path='/' element={<AppShell />}>
                    <Route index element={<Overview />} />
                    <Route path='portfolio' element={<Portfolio />} />
                    <Route path='alerts' element={<Alerts />} />
                    <Route path='signals' element={<Signals />} />
                    <Route path='news' element={<News />} />
                    <Route path='arbitrage' element={<Arbitrage />} />
                    <Route path='staking' element={<Staking />} />
                    <Route path='academy' element={<Academy />} />
                    <Route path='analytics' element={<Analytics />} />
                    <Route path='pricing' element={<Pricing />} />
                    <Route path='settings' element={<Settings />} />
                    <Route path='forecasts' element={<Forecasts />} />
                    <Route path='events' element={<Events />} />
                    <Route path='polymarket' element={<Polymarket />} />
                  </Route>

                  <Route path='/auth/callback' element={<AuthCallback />} />
                  <Route path='*' element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TradeProvider>
        </WebSocketProvider>
      </TradingProvider>
    </Web3Provider>
  )
}
