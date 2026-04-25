import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { genCandles } from '@/services/ta/mockFeed'
import { ema, rsi, macd } from '@/services/ta/indicators'
import { IchimokuCloud } from 'technicalindicators'
import { fetchSignalsSnapshot } from '@/services/providers/signals'
import { monitor } from '@/services/providers/market'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Zap, Eye, Loader2, Brain } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'
import './dashboard.css'

// - [x] Implement `NetworkMonitor` in `market.js` (Track proxy health)
// - [x] Update `WebSocketContext.jsx` with message throughput and latency trackers
// - [x] Create `ConnectionHub.jsx` component for real-time status monitoring
// - [x] Integrate `ConnectionHub` into `AppShell.jsx` toolbar
// - [x] Add 'SOURCE: LIVE' / 'SOURCE: SIMULATION' badges to `Signals.jsx`
// - [x] Add 'SOURCE: LIVE' / 'SOURCE: SIMULATION' badges to `Overview.jsx`
// - [x] Verify transparency system with manual network toggling

function MiniSparkline({ data, color = '#1AF2FF', height = 40 }) {
  if (!data || data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 100, h = height
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * (h - 4) - 2
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ display: 'block' }}>
      <polyline points={points} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// SignalCard is now inlined in ScannerView for better performance and customization

function Kumo({ spanA, spanB, w, h, min, max }) {
  if (!spanA || !spanB || spanA.length === 0) return null
  const xs = spanA.map((_, i) => (i / (spanA.length - 1)) * (w - 2) + 1)

  const getPoints = (series) => series.map(v => {
    if (v == null) return null
    const y = h - ((v - min) / (max - min)) * (h - 2) - 1
    return isFinite(y) ? y : null
  })

  const ysA = getPoints(spanA)
  const ysB = getPoints(spanB)

  let paths = []
  let currentGroup = []

  for (let i = 0; i < ysA.length; i++) {
    if (ysA[i] != null && ysB[i] != null) {
      currentGroup.push(i)
    } else if (currentGroup.length > 0) {
      paths.push([...currentGroup])
      currentGroup = []
    }
  }
  if (currentGroup.length > 0) paths.push(currentGroup)

  return (
    <g className="ichimoku-kumo" opacity="0.15">
      {paths.map((group, idx) => {
        const topPoints = group.map(i => `${xs[i]},${ysA[i]}`).join(' L ')
        const bottomPoints = [...group].reverse().map(i => `${xs[i]},${ysB[i]}`).join(' L ')
        const isBullish = spanA[group[0]] > spanB[group[0]]
        return (
          <path
            key={idx}
            d={`M ${topPoints} L ${bottomPoints} Z`}
            fill={isBullish ? '#4caf50' : '#ff3b30'}
          />
        )
      })}
    </g>
  )
}

function Line({ points, w, h, color, min, max, gradient }) {
  if (!points || points.length === 0) return null
  const xs = points.map((_, i) => (i / (points.length - 1)) * (w - 2) + 1)
  const ys = points.map(v => {
    if (v == null) return null
    const y = h - ((v - min) / (max - min)) * (h - 2) - 1
    return isFinite(y) ? y : null
  })
  let d = ''
  for (let i = 0; i < ys.length; i++) {
    if (ys[i] == null) continue
    d += (d ? ' L ' : 'M ') + xs[i].toFixed(2) + ' ' + ys[i].toFixed(2)
  }

  const id = `grad-${color.replace('#', '')}`

  return (
    <>
      {gradient && (
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
      )}
      {gradient && d && <path d={`${d} L ${w},${h} L 0,${h} Z`} fill={`url(#${id})`} />}
      <path d={d} fill="none" stroke={color} strokeWidth="2" />
    </>
  )
}

function ScannerView({ onSelect }) {
  const { t } = useTranslation()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [dataStatus, setDataStatus] = useState('UNKNOWN')

  useEffect(() => {
    setDataStatus(monitor.getStatus())
    const unsub = monitor.subscribe(status => setDataStatus(status))
    fetchSignalsSnapshot().then(data => {
      setItems(data)
      setLoading(false)
    })
    return unsub
  }, [])


  if (loading) return (
    <div className="w-full animate-in">
      <div className="overview-hero">
        <div className="hero-header">
          <Skeleton style={{ width: '150px', height: '24px' }} />
          <Skeleton style={{ width: '80px', height: '24px' }} />
        </div>
        <Skeleton style={{ width: '100%', height: '16px', marginTop: '8px' }} />
      </div>
      <div className="dx-grid-premium">

        {[...Array(6)].map((_, i) => (
          <div key={i} className="action-card" style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>

            <div className="flex justify-between">
              <div className="flex gap-2">
                <Skeleton variant="circle" style={{ width: '40px', height: '40px' }} />
                <div className="flex flex-col gap-1">
                  <Skeleton style={{ width: '60px', height: '16px' }} />
                  <Skeleton style={{ width: '40px', height: '10px' }} />
                </div>
              </div>
              <Skeleton style={{ width: '40px', height: '16px' }} />
            </div>
            <Skeleton style={{ width: '100px', height: '28px' }} />
            <Skeleton style={{ width: '100%', height: '20px', marginTop: '4px' }} />
            <div className="mt-auto pt-4 border-t border-white/5">
              <Skeleton style={{ width: '100%', height: '36px', borderRadius: '8px' }} />
            </div>
          </div>
        ))}
      </div>

    </div>
  )

  return (
    <div className="w-full animate-in">
      <div className="overview-hero">
        <div className="hero-header">
          <div className="hero-title">
            <Zap size={20} className="text-cyan-400" />
            <span className="tracking-widest font-bold text-sm uppercase">{t('pages.signals.title') || 'AI SIGNAL SCANNER'}</span>
          </div>
          <div className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${
            dataStatus === 'LIVE' ? 'bg-cyan-500/5 border-cyan-500/20 text-cyan-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dataStatus === 'LIVE' ? 'bg-cyan-400 shadow-[0_0_8px_#00FFFF]' : 'bg-red-500 shadow-[0_0_8px_#FF4560]'}`} />
            {dataStatus === 'LIVE' ? 'Data Source: Verified Binance' : 'Data Source: Synthetic Simulation'}
          </div>
        </div>
        <p className="text-white/40 text-sm max-w-xl">
          {t('pages.signals.description') || 'Real-time market analysis detecting high-probability setups across multiple timeframes with neural network accuracy.'}
        </p>
      </div>

      <div className="dx-grid-premium">


        {items.map(item => {
          const isBuy = item.signal === 'BUY' || item.signal === 'BULLISH'
          const accentColor = isBuy ? '#00FFFF' : '#FF4560'

          return (
            <div
              key={item.id}
              className="group relative overflow-hidden transition-all duration-300 hover:scale-[1.01] cursor-pointer"
              style={{
                background: 'rgba(10, 10, 15, 0.6)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${isBuy ? 'rgba(0,255,255,0.1)' : 'rgba(255,69,96,0.1)'}`,
                borderRadius: '16px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}
              onClick={() => onSelect(item.symbol, item.timeframe)}
            >
              {/* Background Glow */}
              <div style={{ position: 'absolute', top: -20, left: -20, width: 80, height: 80, borderRadius: '50%', background: accentColor, filter: 'blur(40px)', opacity: 0.1, pointerEvents: 'none' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
                {/* Left: Symbol & Signal */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: isBuy ? 'rgba(0,255,255,0.1)' : 'rgba(255,69,96,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: accentColor, border: `1px solid ${isBuy ? 'rgba(0,255,255,0.2)' : 'rgba(255,69,96,0.2)'}` }}>
                    {isBuy ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, color: '#fff', letterSpacing: '-0.02em' }}>{item.symbol.replace('USDT', '')}</span>
                      <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 800 }}>USDT</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                      <span style={{ color: accentColor }}>{item.timeframe}</span>
                      <span style={{ color: 'rgba(255,255,255,0.3)' }}>• Momentum</span>
                    </div>
                  </div>
                </div>

                {/* Right: Price */}
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <span style={{ fontSize: '14px', fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>${item.price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  <span style={{ fontSize: '11px', fontWeight: 800, color: item.change24h >= 0 ? '#00FFFF' : '#FF4560' }}>
                    {item.change24h >= 0 ? '+' : ''}{item.change24h?.toFixed(2)}%
                  </span>
                </div>
              </div>

              {/* Confidence & Button Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10, gap: '16px' }}>
                <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '8px 12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                       <Brain size={10} color="rgba(255,255,255,0.4)" />
                       <span style={{ fontSize: '9px', fontWeight: 800, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Confidence</span>
                     </div>
                     <span style={{ fontSize: '10px', fontFamily: 'monospace', fontWeight: 800, color: '#fff' }}>{Math.round(item.confidence * 100)}%</span>
                  </div>
                  <div style={{ height: '3px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ width: `${item.confidence * 100}%`, height: '100%', background: accentColor, borderRadius: '2px' }} />
                  </div>
                </div>

                <button
                  style={{
                    padding: '10px 16px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '10px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    transition: 'all 0.2s',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'rgba(0,255,255,0.4)'; e.currentTarget.style.color = '#00FFFF'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
                >
                  <Zap size={14} color="#00FFFF" />
                  Analyze Setup
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function DetailView({ symbol, tf, onBack }) {
  const { t } = useTranslation()
  const [candles, setCandles] = useState([])
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    async function loadCandles() {
      setChartLoading(true)
      try {
        const { fetchBinanceKlines } = await import('@/services/providers/market')
        const data = await fetchBinanceKlines(symbol, tf, 240)
        setCandles(data)
      } catch (e) {
        // If the websocket connection failed or Proxy fails, return empty data to enforce real-time necessity
        setCandles([])
      } finally {
        setChartLoading(false)
      }
    }
    loadCandles()
  }, [symbol, tf])

  const highs = useMemo(() => candles.map(c => c.h), [candles])
  const lows = useMemo(() => candles.map(c => c.l), [candles])
  const closes = useMemo(() => candles.map(c => c.c), [candles])

  const ema50 = useMemo(() => ema(closes, 50), [closes])
  const ema200 = useMemo(() => ema(closes, 200), [closes])
  const rsi14 = useMemo(() => rsi(closes, 14), [closes])
  const { macdLine, signalLine } = useMemo(() => macd(closes), [closes])

  const ichimoku = useMemo(() => {
    const data = IchimokuCloud.calculate({
      high: highs,
      low: lows,
      close: closes,
      conversionPeriod: 9,
      basePeriod: 26,
      spanPeriod: 52,
      displacement: 26
    })

    const pad = (arr, key) => {
      const result = new Array(closes.length).fill(null)
      const offset = closes.length - arr.length
      arr.forEach((item, i) => {
        if (i + offset < closes.length) result[i + offset] = item[key]
      })
      return result
    }

    return {
      tenkan: pad(data, 'conversion'),
      kijun: pad(data, 'base'),
      spanA: pad(data, 'spanA'),
      spanB: pad(data, 'spanB')
    }
  }, [highs, lows, closes])

  const lastPrice = closes[closes.length - 1] || 0
  const lastRSI = rsi14[rsi14.length - 1] || 0
  const isStale = candles[0]?._stale
  const dataAge = candles[0]?._age

  // Safe pMin/pMax logic to prevent NaN
  const pMin = Math.min(...closes.slice(100).filter(v => isFinite(v)), ...(ichimoku.spanB.filter(v => v != null).slice(-300) || [])) || 0
  const pMax = Math.max(...closes.slice(100).filter(v => isFinite(v)), ...(ichimoku.spanA.filter(v => v != null).slice(-300) || [])) || 100
  const w = 980, h = 280

  const [aiInsight, setAiInsight] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    async function loadAi() {
      setAiLoading(true)
      try {
        const { getNews } = await import('@/services/providers/news')
        const news = await getNews(true)
        const assetName = symbol.replace('USDT', '')
        const relevant = news.items.find(n => n.title.includes(assetName) || n.tags.includes(assetName))
        if (relevant) {
          setAiInsight({
            sentiment: relevant.sentiment,
            reason: relevant.aiSummary || relevant.summary,
            confidence: relevant.confidence
          })
        } else {
          setAiInsight({ sentiment: 'NEUTRAL', reason: 'No impactful news detected for this asset in the last hour.', confidence: 0.5 })
        }
      } catch (e) {
        console.error(e)
      } finally {
        setAiLoading(false)
      }
    }
    loadAi()
  }, [symbol])

  if (chartLoading) return (
    <div className="dx-panels premium-dashboard">
      <div className="dx-card" style={{ marginBottom: 16 }}>
        <div className="flex items-center gap-4">
          <Skeleton style={{ width: '40px', height: '40px', borderRadius: '10px' }} />
          <div className="flex flex-col gap-2">
            <Skeleton style={{ width: '120px', height: '24px' }} />
            <Skeleton style={{ width: '80px', height: '14px' }} />
          </div>
        </div>
      </div>
      <div className="dx-card main-chart" style={{ height: '320px' }}>
        <Skeleton style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="premium-grid">
         <Skeleton style={{ width: '100%', height: '120px', borderRadius: '16px' }} />
         <Skeleton style={{ width: '100%', height: '120px', borderRadius: '16px' }} />
      </div>
    </div>
  )

  return (
    <div className="dx-panels premium-dashboard">
      <div className="dx-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button className="action-btn secondary" onClick={onBack} style={{ padding: 10 }}>
              <ArrowLeft size={18} />
            </button>
            <div>
              <h2 style={{ margin: 0 }}>{symbol}</h2>
              <span style={{ color: 'var(--muted)', fontSize: 13 }}>{t('ui.timeframe') || 'Timeframe'}: {tf}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
            {isStale && (
              <div className="flex flex-col items-end">
                <span className="px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[9px] font-black uppercase tracking-widest mb-1">
                  Cached Data
                </span>
                <span className="text-[8px] text-white/20 font-mono">{dataAge}s AGO</span>
              </div>
            )}
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('ui.price') || 'Price'}</div>
              <div className="data-number" style={{ fontSize: 24, fontWeight: 700 }}>{lastPrice ? `$${lastPrice.toFixed(2)}` : '---'}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>RSI</div>
              <div className="data-number" style={{ fontSize: 24, fontWeight: 700, color: lastRSI > 70 ? '#ff3b30' : lastRSI < 30 ? '#4caf50' : 'var(--text)' }}>
                {lastRSI > 0 ? lastRSI.toFixed(1) : '---'}
              </div>
            </div>
          </div>
        </div>
        {!aiLoading && aiInsight && (
          <div style={{ 
            marginTop: 20, 
            padding: '16px 20px', 
            background: 'rgba(255,255,255,0.02)', 
            borderRadius: '16px', 
            border: '1px solid rgba(255,255,255,0.05)',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
               <Brain size={16} className="text-cyan-400" />
               <span style={{ fontSize: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)' }}>Neural Insight / Narrative Analysis</span>
            </div>
            <div style={{ fontSize: '13px', lineHeight: '1.7', color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              {(() => {
                const clean = (aiInsight.reason || '').replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
                const truncated = clean.length > 320 ? clean.substring(0, 317) + '...' : clean;
                return truncated;
              })()}
              <a 
                href={aiInsight.url || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: 'var(--brand-cyan)', textDecoration: 'none', marginLeft: '8px', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase' }}
              >
                Read Source →
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="dx-card main-chart">
        <div className="card-header">
          <h3>{t('ui.strategy_ichimoku') || 'Ichimoku Cloud Strategy'}</h3>
          <div className="chart-legend" style={{ fontSize: 10 }}>
            <span className="legend-item"><span className="dot" style={{ background: '#ff3b30' }}></span>Tenkan</span>
            <span className="legend-item"><span className="dot" style={{ background: '#4F46E5' }}></span>Kijun</span>
            <span className="legend-item"><span className="dot" style={{ background: 'rgba(76,175,80,0.3)' }}></span>Kumo (Cloud)</span>
          </div>
        </div>
        <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
          <defs>
            <filter id="glow-signals">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = h * ratio
            const price = pMax - (pMax - pMin) * ratio
            return (
              <g key={i}>
                <line x1="0" y1={y} x2={w} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4,4" />
                <text x="8" y={y - 4} fill="#7A7F87" fontSize="10" fontFamily="var(--font-mono)">${price.toFixed(2)}</text>
              </g>
            )
          })}
          <g filter="url(#glow-signals)">
            <Kumo spanA={ichimoku.spanA} spanB={ichimoku.spanB} w={w} h={h} min={pMin} max={pMax} />
            <Line points={ichimoku.tenkan} w={w} h={h} color="#ff3b30" min={pMin} max={pMax} />
            <Line points={ichimoku.kijun} w={w} h={h} color="#4F46E5" min={pMin} max={pMax} />
            <Line points={closes} w={w} h={h} color="rgba(255, 255, 255, 0.8)" min={pMin} max={pMax} gradient />
          </g>
          {lastPrice != null && (
            <g>
              <line x1="0" y1={h - ((lastPrice - pMin) / (pMax - pMin)) * h} x2={w} y2={h - ((lastPrice - pMin) / (pMax - pMin)) * h} stroke="rgba(26, 242, 255, 0.3)" strokeWidth="1" strokeDasharray="2,2" />
              <rect x={w - 60} y={h - ((lastPrice - pMin) / (pMax - pMin)) * h - 10} width="60" height="20" rx="4" fill="#1AF2FF" />
              <text x={w - 30} y={h - ((lastPrice - pMin) / (pMax - pMin)) * h + 4} fill="#0b0f14" fontSize="10" fontWeight="800" textAnchor="middle" fontFamily="var(--font-mono)">
                ${lastPrice.toFixed(0)}
              </text>
            </g>
          )}
          {closes.map((p, i) => {
            if (i < 1) return null
            const isBuy = ema50[i] > ema200[i] && ema50[i - 1] <= ema200[i - 1]
            const isSell = ema50[i] < ema200[i] && ema50[i - 1] >= ema200[i - 1]
            if (!isBuy && !isSell) return null
            const x = (i / (closes.length - 1)) * (w - 2) + 1
            const y = h - ((p - pMin) / (pMax - pMin)) * (h - 2) - 1
            return (
              <g key={i}>
                <circle cx={x} cy={y} r="6" fill={isBuy ? '#34C759' : '#FF3B30'} stroke="#fff" strokeWidth="2" filter="url(#glow-signals)" />
                <path d={isBuy ? `M ${x} ${y - 12} L ${x - 5} ${y - 7} L ${x + 5} ${y - 7} Z` : `M ${x} ${y + 12} L ${x - 5} ${y + 7} L ${x + 5} ${y + 7} Z`} fill={isBuy ? '#34C759' : '#FF3B30'} />
              </g>
            )
          })}
        </svg>
      </div>

      <div className="premium-grid">
        <div className="dx-card">
          <div className="card-header"><h3>RSI Momentum</h3></div>
          <svg width="100%" height={120} viewBox={`0 0 ${w} 120`} preserveAspectRatio="none">
            <rect x="0" y={120 - 70 / 100 * 120} width={w} height={1} fill="rgba(255,59,48,0.2)" strokeDasharray="2,2" />
            <rect x="0" y={120 - 30 / 100 * 120} width={w} height={1} fill="rgba(76,175,80,0.2)" strokeDasharray="2,2" />
            <Line points={rsi14} w={w} h={120} color="#ff9800" min={0} max={100} />
          </svg>
        </div>
        <div className="dx-card">
          <div className="card-header"><h3>MACD Divergence</h3></div>
          <svg width="100%" height={120} viewBox={`0 0 ${w} 120`} preserveAspectRatio="none">
            <line x1="0" y1="60" x2={w} y2="60" stroke="rgba(255,255,255,0.1)" strokeDasharray="4,4" />
            <Line points={macdLine} w={w} h={120} color="#1AF2FF" min={-200} max={200} />
            <Line points={signalLine} w={w} h={120} color="#4F46E5" min={-200} max={200} />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default function Signals() {
  const [view, setView] = useState('list')
  const [selected, setSelected] = useState({ symbol: 'BTCUSDT', tf: '15m' })

  const handleSelect = (symbol, tf) => {
    setSelected({ symbol, tf })
    setView('detail')
  }

  if (view === 'detail') {
    return <DetailView symbol={selected.symbol} tf={selected.tf} onBack={() => setView('list')} />
  }

  return (
    <div className="dx-panels">
      <ScannerView onSelect={handleSelect} />
    </div>
  )
}
