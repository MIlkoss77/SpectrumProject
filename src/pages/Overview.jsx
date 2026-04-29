// src/pages/Overview.jsx
import React, { useEffect, useState, lazy, Suspense } from 'react'
import { useTranslation } from 'react-i18next'
import { getMarkets } from '@/services/providers/market'
import { monitor } from '@/services/providers/market'
import { getTopActions, calculateSuperScore } from '@/services/ai/superScore'

import { useWebSocket } from '@/context/WebSocketContext'
import NumberTicker from '@/components/NumberTicker'
const TechnicalBrief = lazy(() => import('../components/TechnicalBrief'));
const Predictor = lazy(() => import('../components/Predictor'));
import { TrendingUp, TrendingDown, Activity, Zap, Globe, Users, Shield, Loader2, ShieldCheck, Brain, Fish, BarChart3, Briefcase, Rocket } from 'lucide-react'
import { useTrade } from '@/context/TradeContext'
import { useTrading } from '@/context/TradingContext'
import { motion, AnimatePresence } from 'framer-motion'
import './dashboard.css'
import './overview.css'
import PricePulse from '@/components/PricePulse'
const Orderbook = lazy(() => import('@/components/dashboard/Orderbook'));
import Skeleton from '@/components/ui/Skeleton'
import logoImg from '@/assets/logo.png'

const WidgetSuspense = ({ children, height = '200px' }) => (
  <Suspense fallback={<div className="dx-card skeleton-shimmer" style={{ height, minHeight: height, marginBottom: '24px' }} />}>
    {children}
  </Suspense>
);

function ActionCard({ action, loading, openTrade, t }) {
  if (loading) return (
    <div className="dx-card skeleton-shimmer" style={{ padding: '16px', minHeight: '80px', marginBottom: '12px' }}>
      <Skeleton className="w-full h-8" />
    </div>
  )

  const isBuy = action.status.includes('BUY')
  const color = isBuy ? '#00FFFF' : (action.status.includes('SELL') ? '#FF4560' : '#8899A6')

  return (
    <div 
      className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01]"
      style={{ 
        background: 'rgba(10, 10, 15, 0.6)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${isBuy ? 'rgba(0,255,255,0.15)' : 'rgba(255,69,96,0.15)'}`,
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}
    >
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: color, filter: 'blur(40px)', opacity: 0.1, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        {/* Left: Symbol & Signal */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isBuy ? 'rgba(0,255,255,0.1)' : 'rgba(255,69,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, border: `1px solid ${isBuy ? 'rgba(0,255,255,0.2)' : 'rgba(255,69,96,0.2)'}` }}>
            {isBuy ? <TrendingUp size={20} /> : <Activity size={20} />}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{action.symbol.replace('USDT', '')}</span>
            </div>
            <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: isBuy ? '#00FFFF' : color }}>
              {action.status}
            </span>
          </div>
        </div>

        {/* Right: Confidence */}
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confidence</span>
          <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>{action.score}%</span>
        </div>
      </div>

      {/* Button Row */}
      <div style={{ display: 'flex', gap: '12px', position: 'relative', zIndex: 10 }}>
        <button
          style={{
            flex: 1,
            padding: '10px',
            borderRadius: '10px',
            background: isBuy ? 'linear-gradient(90deg, rgba(0,255,255,0.1) 0%, rgba(0,255,255,0.05) 100%)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isBuy ? 'rgba(0,255,255,0.3)' : 'rgba(255,255,255,0.1)'}`,
            color: isBuy ? '#00FFFF' : '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '11px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            cursor: 'pointer'
          }}
          onClick={(e) => {
             e.stopPropagation();
             openTrade({ symbol: action.symbol.replace('USDT', ''), price: action.price, action: isBuy ? 'BUY' : 'SELL' });
          }}
        >
          <Zap size={14} fill={isBuy ? "currentColor" : "none"} />
          {isBuy ? 'Execute Long' : 'Execute Short'}
        </button>
      </div>
    </div>
  )
}


function MiniChart({ data, color = '#22d3ee', height = 60 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1, w = 200, h = height
  const points = data.map((v, i) => `${((i / (data.length - 1)) * w).toFixed(1)},${(h - ((v - min) / range) * (h - 4) - 2).toFixed(1)}`).join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ transition: 'all 0.5s linear' }}
      />
    </svg>
  )
}

export default function Overview() {
  const { t } = useTranslation()
  const { openTrade } = useTrade()
  const { isAutoPilotActive } = useTrading()
  const [loading, setLoading] = useState(true)
  const [topActions, setTopActions] = useState([])
  const [mainScore, setMainScore] = useState(null)
  const [activeTrade, setActiveTrade] = useState(null)
  const [showWelcome, setShowWelcome] = useState(false)
  const [dataStatus, setDataStatus] = useState('UNKNOWN')


  React.useEffect(() => {
    if (showWelcome) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }, [showWelcome])

  const { tickers, isConnected, subscribe, unsubscribe } = useWebSocket()
  const [chartData, setChartData] = useState([])

  // Load Super Score and Actions
  const loadData = async () => {
    setLoading(true)
    try {
      const [actions, score, markets] = await Promise.all([
        getTopActions(),
        calculateSuperScore('BTCUSDT'),
        getMarkets()
      ])
      setTopActions(actions)
      setMainScore(score)
      setMainScore(score)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { 
    loadData() 
    setDataStatus(monitor.getStatus())
    const unsub = monitor.subscribe(status => setDataStatus(status))
    return unsub
  }, [])


  // Update chart with real-time BTC price
  useEffect(() => {
    if (tickers['btcusdt']?.price) {
      setChartData(prev => {
        const p = tickers['btcusdt'].price;
        // Don't add if price hasn't changed to prevent flat lines from overfilling
        if (prev.length > 0 && prev[prev.length - 1] === p) return prev;

        const newArr = [...prev, p]
        return newArr.length > 50 ? newArr.slice(-50) : newArr // Increased points for smoother look
      })
    }
  }, [tickers['btcusdt']?.price])

  // Seed chart on load to look alive immediately
  useEffect(() => {
    if (chartData.length === 0) {
      // Create a nice volatile looking baseline
      let base = 67000;
      const seed = Array.from({ length: 50 }, () => {
        base += (Math.random() - 0.5) * 100;
        return base;
      });
      setChartData(seed)
    }
  }, [])

  // 🔔 Subscribe to Ticker Streams for the Marquee Strip
  useEffect(() => {
    const symbols = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt', 'dogeusdt', 'adausdt', 'avaxusdt']
    const binanceStreams = symbols.map(s => `${s}@ticker`)
    const bybitStreams = symbols.map(s => `tickers.${s.toUpperCase()}`)

    subscribe(binanceStreams, 'binance')
    subscribe(bybitStreams, 'bybit')

    return () => {
      unsubscribe(binanceStreams, 'binance')
      unsubscribe(bybitStreams, 'bybit')
    }
  }, [])

  return (
    <div className="p-4 lg:p-6" style={{ background: '#050505', minHeight: '100vh' }}>
      
      {/* 1. Header & AI Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
           <WidgetSuspense height="240px">
              <Predictor />
           </WidgetSuspense>
        </div>
        
        {/* Market Score Gauge */}
        <div className="group relative overflow-hidden transition-all duration-300"
          style={{
            background: 'rgba(10, 10, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: mainScore?.score > 60 ? '#00FFFF10' : '#FF456010', filter: 'blur(50px)', borderRadius: '50%' }} />
          
          <div className="flex justify-between items-center mb-6">
            <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Market Sentiment</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-[9px] font-bold text-cyan-400">
               <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> LIVE
            </div>
          </div>

          <div className="flex items-center gap-8">
             <div style={{ width: '100px', height: '100px', position: 'relative' }}>
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={mainScore?.score > 60 ? '#00FFFF' : mainScore?.score < 40 ? '#FF4560' : '#FEB019'}
                    strokeWidth="8"
                    strokeDasharray="283"
                    initial={{ strokeDashoffset: 283 }}
                    animate={{ strokeDashoffset: 283 - ((mainScore?.score || 50) / 100) * 283 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span style={{ fontSize: '24px', fontWeight: 900, color: '#fff' }}>{mainScore?.score || '--'}</span>
                  <span style={{ fontSize: '8px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Index</span>
                </div>
             </div>
             <div className="flex-1 flex flex-col gap-3">
                <div className="text-sm font-bold text-white uppercase tracking-tight">{mainScore?.status || 'Analyzing...'}</div>
                <div className="flex flex-col gap-1.5">
                   {['Sentiment', 'Whales', 'Technical'].map((label, idx) => (
                      <div key={label} className="flex flex-col gap-1">
                        <div className="flex justify-between text-[8px] font-black uppercase text-white/30 tracking-widest">
                          <span>{label}</span>
                          <span>{[mainScore?.details?.sentiment, mainScore?.details?.whales, mainScore?.details?.ta][idx] || 50}%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                           <motion.div 
                             initial={{ width: 0 }}
                             animate={{ width: `${[mainScore?.details?.sentiment, mainScore?.details?.whales, mainScore?.details?.ta][idx] || 50}%` }}
                             className="h-full bg-cyan-400/40" 
                           />
                        </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* 2. Live Marquee Strip */}
      <div className="relative overflow-hidden mb-8 border-y border-white/5 bg-white/[0.02] backdrop-blur-md py-3 -mx-4 lg:-mx-6">
        <div className="flex gap-12 animate-ticker-scroll whitespace-nowrap px-4">
           {[...Array(2)].map((_, i) => (
             <React.Fragment key={i}>
                {['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'ADA'].map(sym => {
                  const ticker = tickers[`${sym.toLowerCase()}usdt`]
                  const change = ticker?.changePercent
                  return (
                    <div key={`${sym}-${i}`} className="flex items-center gap-4 min-w-[180px]">
                      <span className="text-xs font-black text-white tracking-widest">{sym}</span>
                      <span className="text-xs font-mono font-bold text-white/80">
                        ${ticker?.price?.toLocaleString(undefined, { minimumFractionDigits: 1 }) || '---'}
                      </span>
                      {change != null && (
                        <span className={`text-[10px] font-bold ${change >= 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                          {change >= 0 ? '▲' : '▼'}{Math.abs(change).toFixed(2)}%
                        </span>
                      )}
                    </div>
                  )
                })}
             </React.Fragment>
           ))}
        </div>
      </div>

      {/* 3. Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Column 1: Actionable Signals */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
             <div className="flex items-center gap-2">
               <Zap size={16} className="text-cyan-400" />
               <h3 className="text-sm font-black text-white uppercase tracking-widest">Active Signals</h3>
             </div>
             <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{dataStatus === 'LIVE' ? 'Real-time' : 'Delayed'}</span>
          </div>
          <div className="flex flex-col gap-3">
             {loading ? [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />) : 
              topActions.map((action, i) => (
                <ActionCard key={i} action={action} loading={false} openTrade={openTrade} t={t} />
              ))
             }
          </div>
        </div>

        {/* Column 2: Technical Analysis Brief */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 px-1">
             <BarChart3 size={16} className="text-cyan-400" />
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Technical Brief</h3>
          </div>
          <WidgetSuspense height="400px">
             <TechnicalBrief />
          </WidgetSuspense>
        </div>

        {/* Column 3: Live Market Pulse */}
        <div className="flex flex-col gap-4">
           <div className="flex items-center gap-2 px-1">
             <Activity size={16} className="text-cyan-400" />
             <h3 className="text-sm font-black text-white uppercase tracking-widest">Market Pulse</h3>
          </div>
          
          {/* Price Card */}
          <div className="dx-card group relative overflow-hidden"
            style={{
              background: 'rgba(10, 10, 15, 0.6)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '24px',
              padding: '20px'
            }}>
             <div className="flex justify-between items-start mb-4">
                <div>
                   <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Bitcoin / USDT</div>
                   <div className="text-2xl font-mono font-bold text-white">
                      <PricePulse value={tickers['btcusdt']?.price}>
                        <NumberTicker value={tickers['btcusdt']?.price} prefix="$" />
                      </PricePulse>
                   </div>
                </div>
                <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${tickers['btcusdt']?.changePercent >= 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-red-500/10 text-red-400'}`}>
                   {tickers['btcusdt']?.changePercent >= 0 ? '+' : ''}{tickers['btcusdt']?.changePercent}%
                </div>
             </div>
             <div className="h-20 opacity-50 -mx-4">
                <MiniChart data={chartData} color="#00FFFF" height={80} />
             </div>
          </div>

          {/* Orderbook */}
          <WidgetSuspense height="350px">
             <Orderbook symbol="BTCUSDT" />
          </WidgetSuspense>
        </div>

      </div>

      {/* 🤖 AutoPilot Status (Floating/Fixed at bottom if active) */}
      <AnimatePresence>
        {isAutoPilotActive && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 md:left-auto md:right-8 md:w-80 z-50 p-4 rounded-2xl border border-cyan-500/30 bg-black/80 backdrop-blur-xl shadow-2xl flex items-center gap-4"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
               <Zap size={20} fill="currentColor" className="animate-pulse" />
            </div>
            <div>
               <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">Auto-Pilot Active</div>
               <div className="text-xs font-bold text-white">AI is managing your positions</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎉 ONBOARDING WELCOME MODAL */}
      <AnimatePresence>
        {showWelcome && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowWelcome(false); localStorage.setItem('spectr_welcomed', '1') }}
              style={{
                position: 'fixed',
                top: 0, left: 0, bottom: 0, right: 0,
                background: 'rgba(0,0,0,0.95)',
                zIndex: 10000,
                backdropFilter: 'blur(12px)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px'
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              style={{
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10001,
                maxWidth: 400,
                width: 'calc(100% - 32px)',
                background: '#0d0d0d',
                border: '1px solid rgba(0,255,255,0.2)',
                borderRadius: 32,
                padding: '40px 32px',
                boxShadow: '0 0 80px rgba(0,255,255,0.15)',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: 64, height: 64, margin: '0 auto 24px',
                background: 'rgba(0,255,255,0.05)', borderRadius: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(0,255,255,0.1)'
              }}>
                <Rocket size={32} className="text-cyan-400" />
              </div>
              
              <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '0 0 12px', letterSpacing: '-0.03em' }}>
                Protocol <span className="text-cyan-400">Initialized</span>
              </h2>
              
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, lineHeight: 1.6, marginBottom: 32 }}>
                Welcome to Spectr. Your neural-powered tactical terminal is ready. Experience institutional-grade intelligence.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <button
                  onClick={() => { setShowWelcome(false); localStorage.setItem('spectr_welcomed', '1') }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    background: '#00FFFF',
                    color: '#000',
                    fontSize: '12px',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 10px 20px rgba(0,255,255,0.2)'
                  }}
                >
                  Enter Terminal
                </button>
                <button
                  onClick={() => { setShowWelcome(false); localStorage.setItem('spectr_welcomed', '1') }}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '16px',
                    background: 'transparent',
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '11px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                  }}
                >
                  Skip Briefing
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
