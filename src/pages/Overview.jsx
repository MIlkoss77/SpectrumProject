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

  const coins = [
    { sym: 'BTC', status: 'Whale Accumulation', sentiment: 'BULLISH', strength: 84 },
    { sym: 'ETH', status: 'Volatility Squeeze', sentiment: 'NEUTRAL', strength: 52 },
    { sym: 'SOL', status: 'Institutional Buy', sentiment: 'BULLISH', strength: 76 },
    { sym: 'BNB', status: 'Resistance Test', sentiment: 'NEUTRAL', strength: 48 },
    { sym: 'XRP', status: 'Distribution', sentiment: 'BEARISH', strength: 31 },
    { sym: 'DOGE', status: 'Retail Surge', sentiment: 'BULLISH', strength: 65 }
  ]

  return (
    <div style={{ padding: '32px', maxWidth: '1600px', margin: '0 auto' }}>
      
      {/* 1. HERO: SYSTEM STATUS */}
      <div style={{ 
        marginBottom: '40px', 
        padding: '24px', 
        background: 'rgba(255,255,255,0.02)', 
        borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'center' }}>
          <div className="dx-flex dx-flex-col">
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Neural Engine</span>
            <div className="dx-flex dx-items-center dx-gap-2">
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FFFF', boxShadow: '0 0 15px #00FFFF' }} />
              <span style={{ fontSize: '14px', fontWeight: 900, color: '#fff' }}>CORE ACTIVE</span>
            </div>
          </div>
          
          <div className="dx-flex dx-flex-col">
            <span style={{ fontSize: '10px', fontWeight: 900, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '6px' }}>Market Sentiment</span>
            <span style={{ fontSize: '14px', fontWeight: 900, color: '#00FFFF' }}>OPTIMISTIC (68%)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
           <div className="dx-flex dx-flex-col">
             <span style={{ fontSize: '9px', fontWeight: 900, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Build Version</span>
             <span style={{ fontSize: '11px', fontWeight: 900, color: 'rgba(255,255,255,0.4)' }}>v5.2.4-STABLE-v7</span>
           </div>
           <button style={{ padding: '10px 24px', borderRadius: '12px', background: 'rgba(0,255,255,0.05)', border: '1px solid rgba(0,255,255,0.1)', color: '#00FFFF', fontSize: '11px', fontWeight: 900, cursor: 'pointer' }}>SYNC STATUS</button>
        </div>
      </div>

      {/* 2. MAIN GRID */}
      <div className="dx-grid" style={{ gridTemplateColumns: window.innerWidth > 1200 ? '1fr 400px' : '1fr', gap: '40px' }}>
        
        {/* LEFT: Intelligence Cards */}
        <div className="dx-flex dx-flex-col dx-gap-8">
          <section>
            <div className="dx-flex dx-items-center dx-gap-3" style={{ marginBottom: '24px' }}>
               <Brain size={20} style={{ color: '#00FFFF' }} />
               <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Neural Intelligence</h2>
            </div>
            
            <div className="dx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
              {coins.map(c => {
                const ticker = tickers[`${c.sym.toLowerCase()}usdt`]
                const color = c.sentiment === 'BULLISH' ? '#00FFFF' : c.sentiment === 'BEARISH' ? '#FF4560' : '#fff'
                return (
                  <div key={c.sym} style={{ padding: '24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '24px', transition: 'all 0.3s' }}>
                    <div className="dx-flex dx-justify-between dx-items-start" style={{ marginBottom: '20px' }}>
                      <div className="dx-flex dx-flex-col">
                        <span style={{ fontSize: '20px', fontWeight: 900, color: '#fff' }}>{c.sym}</span>
                        <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>USDT PERPETUAL</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>${ticker?.price?.toLocaleString() || '---'}</div>
                        <div style={{ fontSize: '10px', fontWeight: 900, color: ticker?.changePercent >= 0 ? '#00FFFF' : '#FF4560' }}>
                           {ticker?.changePercent >= 0 ? '+' : ''}{ticker?.changePercent || '0.00'}%
                        </div>
                      </div>
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                       <div className="dx-flex dx-justify-between" style={{ marginBottom: '6px' }}>
                         <span style={{ fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.2)' }}>PROBABILITY</span>
                         <span style={{ fontSize: '10px', fontWeight: 900, color: color }}>{c.strength}% {c.sentiment}</span>
                       </div>
                       <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${c.strength}%`, height: '100%', background: color, boxShadow: `0 0 10px ${color}` }} />
                       </div>
                    </div>

                    <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                       <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>{c.status}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section>
            <div className="dx-flex dx-items-center dx-gap-3" style={{ marginBottom: '24px' }}>
               <Zap size={20} style={{ color: '#00FFFF' }} />
               <h2 style={{ fontSize: '18px', fontWeight: 900, color: '#fff', letterSpacing: '-0.5px' }}>Top Alpha Actions</h2>
            </div>
            <div className="dx-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
              {(topActions || []).slice(0, 4).map((action, i) => (
                <ActionCard key={i} action={action} openTrade={openTrade} />
              ))}
            </div>
          </section>
        </div>

        {/* RIGHT: Feed */}
        <aside>
           <div style={{ position: 'sticky', top: '120px', padding: '32px', background: 'rgba(10,10,15,0.6)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '32px', height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column' }}>
             <div className="dx-flex dx-items-center dx-justify-between" style={{ marginBottom: '32px' }}>
               <div className="dx-flex dx-items-center dx-gap-3">
                 <Activity size={20} style={{ color: '#00FFFF' }} />
                 <h3 style={{ fontSize: '14px', fontWeight: 900, color: '#fff', textTransform: 'uppercase', letterSpacing: '1px' }}>Alpha Pulse</h3>
               </div>
               <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#00FFFF', animation: 'pulse 2s infinite' }} />
             </div>

             <div style={{ flex: 1, overflowY: 'auto' }} className="custom-scrollbar">
               {(intelStream || []).map(item => (
                 <div key={item.id} style={{ marginBottom: '24px', paddingLeft: '16px', borderLeft: '2px solid rgba(255,255,255,0.05)' }}>
                    <div className="dx-flex dx-justify-between" style={{ marginBottom: '6px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 900, color: item.type === 'BULLISH' ? '#00FFFF' : '#FF4560' }}>{item.type}</span>
                      <span style={{ fontSize: '10px', fontWeight: 600, color: 'rgba(255,255,255,0.2)' }}>{item.time}</span>
                    </div>
                    <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>{item.msg}</p>
                 </div>
               ))}
             </div>

             <div style={{ marginTop: '32px' }}>
                <button style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'linear-gradient(135deg, #00FFFF 0%, #0088FF 100%)', color: '#000', fontWeight: 900, fontSize: '12px', border: 'none', cursor: 'pointer', boxShadow: '0 10px 30px rgba(0,255,255,0.2)' }}>UPGRADE TO PRO ALPHA</button>
             </div>
           </div>
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
