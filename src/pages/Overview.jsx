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
  const [loading, setLoading] = useState(true)
  const [topActions, setTopActions] = useState([])
  const { tickers } = useWebSocket()
  const [intelStream, setIntelStream] = useState([
    { id: 1, type: 'BULLISH', msg: 'Neural Engine detects whale accumulation on BTC @ $68.4k', time: 'JUST NOW' },
    { id: 2, type: 'NEUTRAL', msg: 'Volatility expansion expected in ETH within 4 hours', time: '2m ago' },
    { id: 3, type: 'BEARISH', msg: 'Liquidity gap identified for SOL below $142.50', time: '5m ago' }
  ])

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000)
    getTopActions().then(setTopActions)
  }, [])

  const coins = ['BTC', 'ETH', 'SOL', 'BNB', 'XRP', 'DOGE', 'AVAX', 'ADA']

  return (
    <div style={{ padding: '24px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 1. TOP BAR: Market Intelligence Strip */}
      <div className="dx-flex dx-items-center dx-justify-between" style={{ marginBottom: '32px', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="dx-flex dx-items-center dx-gap-4">
          <div className="dx-flex dx-items-center dx-gap-2">
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FFFF', boxShadow: '0 0 10px #00FFFF', animation: 'pulse 2s infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#00FFFF', textTransform: 'uppercase', letterSpacing: '2px' }}>Neural Core Online</span>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>Uptime: 99.98% | Latency: 14ms</span>
        </div>
        <div className="sm:dx-hidden dx-flex dx-gap-4">
           {['BINANCE', 'BYBIT', 'MEXC'].map(ex => (
             <span key={ex} style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.2)' }}>{ex} <span style={{ color: '#00FFFF' }}>●</span></span>
           ))}
        </div>
      </div>

      {/* 2. MAIN CONTENT GRID */}
      <div className="dx-grid" style={{ gridTemplateColumns: window.innerWidth > 1200 ? '1fr 380px' : '1fr', gap: '32px' }}>
        
        {/* LEFT COLUMN: Heatmap & Signals */}
        <div className="dx-flex dx-flex-col dx-gap-8">
          
          {/* NEURAL HEATMAP */}
          <section>
            <div className="dx-flex dx-items-center dx-justify-between" style={{ marginBottom: '16px' }}>
              <div className="dx-flex dx-items-center dx-gap-2">
                <Brain size={18} className="text-cyan-400" />
                <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Neural Heatmap</h2>
              </div>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.3)' }}>H4 PROBABILITY MAP</span>
            </div>
            
            <div className="dx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '16px' }}>
              {coins.map(sym => {
                const ticker = tickers[`${sym.toLowerCase()}usdt`]
                const isBull = ticker?.changePercent >= 0
                return (
                  <div key={sym} className="dx-card" style={{ padding: '20px', background: isBull ? 'rgba(0,255,255,0.03)' : 'rgba(255,69,96,0.03)', border: isBull ? '1px solid rgba(0,255,255,0.1)' : '1px solid rgba(255,69,96,0.1)', transition: 'transform 0.2s' }}>
                    <div className="dx-flex dx-justify-between dx-items-start" style={{ marginBottom: '12px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{sym}</span>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: isBull ? '#00FFFF' : '#FF4560' }}>
                        {isBull ? '+' : ''}{ticker?.changePercent || '0.00'}%
                      </span>
                    </div>
                    <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
                      <div style={{ width: `${60 + Math.random() * 30}%`, height: '100%', background: isBull ? '#00FFFF' : '#FF4560' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>
                      {isBull ? 'Accumulation' : 'Distribution'}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          {/* TACTICAL SIGNALS */}
          <section>
            <div className="dx-flex dx-items-center dx-gap-2" style={{ marginBottom: '16px' }}>
              <Zap size={18} className="text-cyan-400" />
              <h2 style={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Tactical Execution</h2>
            </div>
            <div className="dx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '16px' }}>
              {topActions.slice(0, 4).map((action, i) => (
                <ActionCard key={i} action={action} openTrade={openTrade} />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN: Intelligence Stream */}
        <aside className="dx-flex dx-flex-col dx-gap-8">
           <section style={{ height: '100%', minHeight: '600px', background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
             <div className="dx-flex dx-items-center dx-justify-between" style={{ marginBottom: '24px' }}>
               <div className="dx-flex dx-items-center dx-gap-2">
                 <Activity size={18} className="text-cyan-400" />
                 <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Alpha Stream</h3>
               </div>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FFFF' }} />
             </div>

             <div className="dx-flex dx-flex-col dx-gap-4" style={{ flex: 1, overflowY: 'auto' }}>
               {intelStream.map(item => (
                 <div key={item.id} style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', borderLeft: `3px solid ${item.type === 'BULLISH' ? '#00FFFF' : item.type === 'BEARISH' ? '#FF4560' : 'rgba(255,255,255,0.2)'}` }}>
                   <div className="dx-flex dx-justify-between" style={{ marginBottom: '8px' }}>
                     <span style={{ fontSize: '10px', fontWeight: 900, color: item.type === 'BULLISH' ? '#00FFFF' : item.type === 'BEARISH' ? '#FF4560' : 'rgba(255,255,255,0.4)' }}>{item.type}</span>
                     <span style={{ fontSize: '9px', fontWeight: 600, color: 'rgba(255,255,255,0.2)' }}>{item.time}</span>
                   </div>
                   <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.5', margin: 0 }}>{item.msg}</p>
                 </div>
               ))}
             </div>
             
             <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <button style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.1)', color: '#00FFFF', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer' }}>
                  Connect to Neural Core
                </button>
             </div>
           </section>
        </aside>

      </div>
    </div>
  )
}

function ActionCard({ action, openTrade }) {
  const isBuy = action.status.includes('BUY')
  const color = isBuy ? '#00FFFF' : '#FF4560'

  return (
    <div className="dx-card" style={{ padding: '20px', background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '20px' }}>
      <div className="dx-flex dx-justify-between dx-items-center" style={{ marginBottom: '16px' }}>
        <div className="dx-flex dx-items-center dx-gap-3">
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: color, border: `1px solid ${color}30` }}>
            <Zap size={20} fill={isBuy ? 'currentColor' : 'none'} />
          </div>
          <div className="dx-flex dx-flex-col">
            <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff' }}>{action.symbol}</span>
            <span style={{ fontSize: '10px', fontWeight: 800, color: color, textTransform: 'uppercase' }}>{action.status}</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>CONFIDENCE</div>
          <div style={{ fontSize: '18px', fontWeight: 900, color: '#fff' }}>{action.score}%</div>
        </div>
      </div>
      <button 
        onClick={() => openTrade({ symbol: action.symbol, action: isBuy ? 'BUY' : 'SELL' })}
        style={{ width: '100%', padding: '14px', borderRadius: '12px', background: color, color: '#000', fontWeight: 900, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', border: 'none', cursor: 'pointer' }}>
        Execute {isBuy ? 'Long' : 'Short'}
      </button>
    </div>
  )
}
