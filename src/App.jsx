import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Web3Provider } from '@/context/Web3Context.jsx'
import { WebSocketProvider } from '@/context/WebSocketContext.jsx'
import AppShell from '@/layouts/AppShell.jsx'

// Pages
import Overview from '@/pages/Overview.jsx'
import Alerts from '@/pages/Alerts.jsx'
import Signals from '@/pages/Signals.jsx'
import News from '@/pages/News.jsx'
import Analytics from '@/pages/Analytics.jsx'
import NotFound from '@/pages/NotFound.jsx'
import Arbitrage from '@/pages/Arbitrage.jsx'
import Staking from '@/pages/Staking.jsx'
import Academy from '@/pages/Academy.jsx'
import Settings from '@/pages/Settings.jsx'
import Pricing from '@/pages/Pricing.jsx'
import Portfolio from '@/pages/Portfolio.jsx'
import TA from '@/pages/TA.jsx'
import Calibration from '@/pages/Calibration.jsx'
import Forecasts from '@/pages/Forecasts.jsx'
import Events from '@/pages/Events.jsx'
import { TradeProvider } from '@/context/TradeContext.jsx'
import { TradingProvider } from '@/context/TradingContext.jsx'
import TradeModal from '@/components/TradeModal.jsx'

import Landing from '@/pages/Landing.jsx'

export default function App() {
  return (
    <Web3Provider>
      <TradingProvider>
        <WebSocketProvider>
          <TradeProvider>
            <BrowserRouter>
              <TradeModal />
              <Routes>
                {/* Landing Page as Root */}
                <Route path='/' element={<Landing />} />

                {/* Main App Terminal at /app */}
                <Route path='/app' element={<AppShell />}>
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
                  <Route path='ta' element={<TA />} />
                  <Route path='calibration' element={<Calibration />} />
                  <Route path='forecasts' element={<Forecasts />} />
                  <Route path='events' element={<Events />} />
                </Route>

                <Route path='*' element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TradeProvider>
        </WebSocketProvider>
      </TradingProvider>
    </Web3Provider>
  )
}
