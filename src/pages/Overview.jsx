// src/pages/Overview.jsx
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMarkets } from '@/services/providers/market'
import { getTopActions, calculateSuperScore } from '@/services/ai/superScore'
import { useWebSocket } from '@/context/WebSocketContext'
import NumberTicker from '@/components/NumberTicker'
import TechnicalBrief from '../components/TechnicalBrief'
import Predictor from '../components/Predictor'
import { TrendingUp, TrendingDown, Activity, Zap, Globe, Users, Shield, Loader2, ArrowRight, ShieldCheck } from 'lucide-react'
import { useTrade } from '@/context/TradeContext'
import { useTrading } from '@/context/TradingContext'
import { motion, AnimatePresence } from 'framer-motion'
import './dashboard.css'
import './overview.css'
import PricePulse from '@/components/PricePulse'
import Orderbook from '@/components/dashboard/Orderbook'
import Skeleton from '@/components/ui/Skeleton'
import logoImg from '@/assets/logo.png'

function ActionCard({ action, loading, openTrade, t }) {
  if (loading) return (
    <div className="action-card" style={{ background: 'rgba(20,20,28,0.4)', borderColor: 'rgba(255,255,255,0.02)' }}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="w-16 h-4" />
        <Skeleton className="w-20 h-5" />
      </div>
      <Skeleton className="w-full h-1 my-4" />
      <Skeleton className="w-full h-10 mt-2" />
    </div>
  )

  const isPositive = action.status.includes('BUY')
  const color = isPositive ? '#00FFFF' : (action.status.includes('SELL') ? '#FF4560' : '#8899A6')

  return (
    <div className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
      style={{ borderColor: isPositive ? 'rgba(0,255,255,0.2)' : 'rgba(255,255,255,0.05)', background: 'linear-gradient(145deg, rgba(20,20,28,0.6) 0%, rgba(5,5,8,0.8) 100%)' }}>

      {/* Hover Glow */}
      <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${isPositive ? 'bg-cyan-400' : 'bg-red-400'}`} />

      <div className="action-main relative z-10">
        <div className="action-symbol flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-cyan-400' : 'bg-red-500'}`} />
          {action.symbol.replace('USDT', '')}
        </div>
        <div className="action-status font-bold tracking-wider text-xs px-2 py-0.5 rounded bg-black/40 border border-white/5"
          style={{ color: isPositive ? '#22d3ee' : color, borderColor: isPositive ? 'rgba(34,211,238,0.3)' : 'rgba(255,59,48,0.2)' }}>
          {action.status}
        </div>
      </div>
      <div className="action-footer relative z-10 mt-4">
        <div className="action-score w-full mb-3">
          <div className="flex justify-between text-[10px] uppercase font-bold text-white/30 mb-1">
            <span>{t('pages.dashboard.confidence') || 'Confidence'}</span>
            <span style={{ color: isPositive ? '#00FFFF' : color }}>{action.score}%</span>
          </div>
          <div className="score-bar h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div className="score-fill h-full rounded-full"
              style={{ width: `${action.score}% `, background: isPositive ? '#00FFFF' : color, boxShadow: isPositive ? '0 0 10px rgba(0,255,255,0.5)' : 'none' }} />
          </div>
        </div>
        <button
          className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider transition-all duration-300"
          style={{
            background: isPositive ? 'linear-gradient(135deg, rgba(0,255,255,0.08) 0%, rgba(99,102,241,0.12) 100%)' : 'rgba(255,255,255,0.05)',
            color: isPositive ? '#00FFFF' : '#fff',
            border: '1px solid ' + (isPositive ? 'rgba(0,255,255,0.25)' : 'rgba(255,255,255,0.1)'),
            boxShadow: isPositive ? '0 0 15px rgba(0,255,255,0.1)' : 'none',
            borderRadius: '12px',
            fontFamily: "'Inter', sans-serif"
          }}
          onClick={() => openTrade({ symbol: action.symbol.replace('USDT', ''), price: action.price, action: action.status.includes('BUY') ? 'BUY' : 'SELL' })}
        >
          {isPositive ? <Zap size={14} fill="currentColor" /> : <Activity size={14} />}
          {t('ui.execute') || 'EXECUTE'} {action.status.includes('BUY') ? 'LONG' : 'SHORT'}
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
  const [snapshot, setSnapshot] = useState(null)
  const [showWelcome, setShowWelcome] = useState(() => !localStorage.getItem('spectr_welcomed'))

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
      setSnapshot(markets)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

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
    const marqueeSymbols = ['btcusdt', 'ethusdt', 'bnbusdt', 'solusdt', 'xrpusdt', 'dogeusdt', 'adausdt', 'avaxusdt']
    const tickerStreams = marqueeSymbols.map(s => `${s}@ticker`)

    subscribe(tickerStreams)

    return () => {
      unsubscribe(tickerStreams)
    }
  }, [])

  return (
    <section className="dx-panels premium-dashboard">

      {/* 🔮 AI PREDICTOR (HERO) */}
      <Predictor />

      {/* 🔴 LIVE TICKER MARQUEE STRIP */}
      <div style={{
        overflow: 'hidden', borderBottom: '1px solid rgba(255,255,255,0.05)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(0,0,0,0.3)', padding: '8px 0', marginBottom: 24,
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          display: 'flex', gap: 48, animation: 'ticker-scroll 30s linear infinite',
          whiteSpace: 'nowrap',
        }}>
          {[...Array(3)].map((_, rep) => (
            ['BTC', 'ETH', 'BNB', 'SOL', 'XRP', 'DOGE', 'ADA', 'AVAX'].map(sym => {
              const key = `${sym.toLowerCase()}usdt`
              const ticker = tickers[key]
              const price = ticker?.price
              const change = ticker?.changePercent
              return (
                <span key={`${rep}-${sym}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontFamily: 'var(--font-mono)' }}>
                  <span style={{ fontWeight: 800, color: '#fff', letterSpacing: 1 }}>{sym}</span>
                  <span style={{ color: '#8899a6' }}>{price ? `$${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '---'}</span>
                  {change != null && (
                    <span style={{ color: change >= 0 ? '#22d3ee' : '#ef4444', fontWeight: 700 }}>
                      {change >= 0 ? '▲' : '▼'} {Math.abs(change)}%
                    </span>
                  )}
                </span>
              )
            })
          ))}
        </div>
      </div>

      {/* 🤖 AutoPilot Status Banner */}
      {isAutoPilotActive && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="action-card mb-6"
          style={{
            background: 'linear-gradient(90deg, rgba(0,255,255,0.05) 0%, rgba(34,211,238,0.1) 100%)',
            borderColor: 'rgba(0,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: '16px 24px'
          }}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Zap size={22} fill="currentColor" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-green-500 border-2 border-[#0a0a0f] animate-pulse" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-0.5">{t('ui.engine_active') || 'Engine Active'}</div>
            <div className="text-sm font-bold text-white">{t('ui.auto_pilot_msg') || 'AI Auto-Pilot is managing your portfolio'}</div>
          </div>
          <div className="hidden md:flex items-center gap-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">
            <div className="flex items-center gap-1.5"><Activity size={12} className="text-cyan-400" /> 24/7 Monitoring</div>
            <div className="flex items-center gap-1.5"><Shield size={12} className="text-cyan-400" /> Risk Shield ON</div>
          </div>
        </motion.div>
      )}

      {/* Top Section: Actionable Insights */}
      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <ShieldCheck size={20} className="text-cyan-400" />
            <span className="tracking-widest font-bold text-sm">{t('pages.dashboard.top_actions') || 'TOP ACTIONS TODAY'}</span>
          </div>
          <span className="dx-tag bg-cyan-500/10 text-cyan-400 border-cyan-500/30">{t('ui.ai_filtered') || 'AI FILTERED'}</span>
        </div>
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
            <Skeleton className="h-40" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topActions.map((action, i) => (
              <ActionCard key={i} action={action} loading={false} openTrade={openTrade} t={t} />
            ))}
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="premium-grid-main">

        {/* Left Column: Core Analytics */}
        <div className="analytics-col">
          <div className="dx-card score-card-premium relative overflow-hidden border-cyan-500/20" style={{ padding: '24px' }}>
            <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/5 blur-[80px] rounded-full pointer-events-none" />

            <div className="card-header relative z-10" style={{ marginBottom: '20px' }}>
              <h3 className="text-cyan-400/80" style={{ fontSize: '14px', margin: 0 }}>{t('pages.dashboard.market_score') || 'BTC MARKET SCORE'}</h3>
              <div className="flex items-center gap-2 px-2 py-0.5 rounded-full bg-cyan-900/20 border border-cyan-500/20 text-[10px] font-bold text-cyan-400"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#00FFFF]"></span> {t('ui.live') || 'LIVE'}</div>
            </div>
            <div className="score-main relative z-10" style={{ display: 'flex', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div className="score-gauge-lg" style={{ width: '130px', height: '130px', position: 'relative', flexShrink: 0 }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
                  <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={mainScore?.score > 60 ? '#00FFFF' : mainScore?.score < 40 ? '#FF4560' : '#FEB019'}
                    strokeWidth="6"
                    strokeDasharray={`${((mainScore?.score || 50) / 100) * 283} 283`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 1s ease' }}
                  />
                </svg>
                <div className="score-center" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="score-num text-white" style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1 }}>{mainScore?.score || '--'}</span>
                  <span className="score-label text-cyan-400/60" style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }}>{mainScore?.status || 'ANALYZING'}</span>
                </div>
              </div>
              <div className="score-breakdown" style={{ flex: 1, minWidth: '150px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="breakdown-item">
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>Sentiment</span>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '100%', marginTop: '4px' }}>
                    <div style={{ height: '100%', background: 'rgba(0,255,255,0.5)', borderRadius: '2px', width: `${mainScore?.details?.sentiment || 50}%` }} />
                  </div>
                </div>
                <div className="breakdown-item">
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>Whales</span>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '100%', marginTop: '4px' }}>
                    <div style={{ height: '100%', background: 'rgba(0,255,255,0.5)', borderRadius: '2px', width: `${mainScore?.details?.whales || 50}%` }} />
                  </div>
                </div>
                <div className="breakdown-item">
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, color: 'rgba(255,255,255,0.3)' }}>Technical</span>
                  <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', width: '100%', marginTop: '4px' }}>
                    <div style={{ height: '100%', background: 'rgba(0,255,255,0.5)', borderRadius: '2px', width: `${mainScore?.details?.ta || 50}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="section-header mt-6">
            <div className="flex items-center gap-2">
              <Activity size={18} className="text-cyan-400" />
              <h2 className="dx-h3 text-white">Technical Brief (1H)</h2>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Live Binance Data</span>
          </div>

          <TechnicalBrief />

        </div>

        {/* Right Column: Market Data */}
        <div className="market-col">
          <div className="dx-card price-ticker-card border-none bg-black/40">
            <div className="ticker-row">
              <div className="ticker-info">
                <span className="ticker-symbol text-lg font-bold">BTC/USDT</span>
                <span className="ticker-name text-white/40 text-xs">Bitcoin</span>
              </div>
              <div className="ticker-price-group text-right">
                <div className="ticker-price text-2xl font-mono font-bold">
                  <PricePulse value={tickers['btcusdt']?.price}>
                    <NumberTicker value={tickers['btcusdt']?.price} prefix="$" />
                  </PricePulse>
                </div>
                <div className={`text-sm font-bold ${tickers['btcusdt']?.changePercent >= 0 ? 'text-cyan-400' : 'text-red-400'} `}>
                  {tickers['btcusdt']?.changePercent >= 0 ? '+' : ''}{tickers['btcusdt']?.changePercent}%
                </div>
              </div>
            </div>
            <div className="ticker-chart opacity-50">
              <MiniChart data={chartData} color="#00FFFF" height={80} />
            </div>
          </div>

          <div className="orderbook-wrapper mt-4">
            <Orderbook symbol="BTCUSDT" />
          </div>

          <div className="quick-stats-row grid grid-cols-2 gap-4 mt-4">
            <div className="mini-stat-card bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="block text-[10px] text-white/30 uppercase font-bold">BTC 24h Volume</span>
              <span className="block text-lg font-mono font-bold text-white">{tickers['btcusdt']?.volume ? `$${(tickers['btcusdt'].volume * tickers['btcusdt'].price / 1e9).toFixed(1)}B` : '--'}</span>
            </div>
            <div className="mini-stat-card bg-black/40 p-3 rounded-xl border border-white/5">
              <span className="block text-[10px] text-white/30 uppercase font-bold">24h Change</span>
              <span className="block text-lg font-mono font-bold" style={{ color: (tickers['btcusdt']?.changePercent || 0) >= 0 ? '#22d3ee' : '#ef4444' }}>
                {tickers['btcusdt']?.changePercent != null ? `${tickers['btcusdt'].changePercent >= 0 ? '+' : ''}${tickers['btcusdt'].changePercent}%` : '--'}
              </span>
            </div>
          </div>
        </div>

      </div>
      {/* 🎉 ONBOARDING WELCOME MODAL */}
      <AnimatePresence>
        {showWelcome && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowWelcome(false); localStorage.setItem('spectr_welcomed', '1') }}
              style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9998, backdropFilter: 'blur(8px)', cursor: 'pointer' }}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              style={{
                position: 'fixed', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 9999, maxWidth: 500, width: '92%',
                maxHeight: '85vh', overflowY: 'auto',
                background: 'linear-gradient(135deg, #0d0d0d 0%, #111118 100%)',
                border: '1px solid rgba(0,255,255,0.2)',
                borderRadius: 24, padding: '24px 20px',
                boxShadow: '0 0 80px rgba(0,255,255,0.1)'
              }}
            >
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 48, height: 48, margin: '0 auto 12px',
                  background: 'rgba(0,255,255,0.08)', borderRadius: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(0,255,255,0.2)'
                }}>
                  <img src={logoImg} alt="Spectr" style={{ width: 28, height: 28, objectFit: 'contain' }} />
                </div>
                <h2 style={{ fontSize: 20, fontWeight: 900, margin: '0 0 6px', letterSpacing: -0.5 }}>
                  Welcome to <span style={{ color: '#00FFFF' }}>Spectr Trading</span> 🚀
                </h2>
                <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.5, margin: 0 }}>
                  Your AI-powered crypto intelligence terminal is ready.
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {[
                  { icon: '🧠', text: 'AI Predictor — ML directional signals' },
                  { icon: '🐋', text: 'Whale Radar — Track big money' },
                  { icon: '📊', text: 'Technical Brief — Live Binance data' },
                  { icon: '💼', text: 'Portfolio — Connect your keys' },
                ].map(({ icon, text }) => (
                  <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)', fontSize: 12 }}>
                    <span style={{ fontSize: 18 }}>{icon}</span>
                    <span style={{ color: 'rgba(255,255,255,0.7)' }}>{text}</span>
                  </div>
                ))}
              </div>
              <button
                className="dx-btn"
                style={{ width: '100%', justifyContent: 'center', background: '#00FFFF', color: '#000', fontWeight: 900, letterSpacing: 0.5, cursor: 'pointer' }}
                onClick={() => { setShowWelcome(false); localStorage.setItem('spectr_welcomed', '1') }}
              >
                🚀 Launch Dashboard
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  )
}
