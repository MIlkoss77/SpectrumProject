import React, { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { genCandles } from '@/services/ta/mockFeed'
import { ema, rsi, macd } from '@/services/ta/indicators'
import { IchimokuCloud } from 'technicalindicators'
import { fetchSignalsSnapshot } from '@/services/providers/signals'
import { ArrowLeft, TrendingUp, TrendingDown, Activity, Zap, Eye, Loader2 } from 'lucide-react'
import './dashboard.css'

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

  useEffect(() => {
    fetchSignalsSnapshot().then(data => {
      setItems(data)
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="relative">
        <div className="w-12 h-12 rounded-full border-2 border-cyan-500/20 border-t-cyan-500 animate-spin" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Zap size={14} className="text-cyan-400 animate-pulse" />
        </div>
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
          <span className="dx-tag bg-cyan-500/10 text-cyan-400 border-cyan-500/30">{t('ui.live_scanning') || 'LIVE SCANNING'}</span>
        </div>
        <p className="text-white/40 text-sm max-w-xl">
          {t('pages.signals.description') || 'Real-time market analysis detecting high-probability setups across multiple timeframes with neural network accuracy.'}
        </p>
      </div>

      <div className="dx-grid-premium">
        {items.map(item => {
          const isPositive = item.change24h >= 0
          const isBuy = item.signal === 'BUY' || item.signal === 'BULLISH'
          const accentColor = isBuy ? '#22d3ee' : '#ef4444'

          return (
            <div
              key={item.id}
              className="action-card group relative overflow-hidden transition-all duration-300 hover:scale-[1.02] cursor-pointer"
              style={{
                borderColor: isBuy ? 'rgba(34,211,238,0.2)' : 'rgba(239,68,68,0.1)',
                background: 'rgba(20, 20, 25, 0.7)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                padding: '16px'
              }}
              onClick={() => onSelect(item.symbol, item.timeframe)}
            >
              <div className={`absolute -inset-1 opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl ${isBuy ? 'bg-cyan-400' : 'bg-red-400'}`} />

              <div className="relative z-10 flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg border ${isBuy ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {item.symbol.substring(0, 1)}
                  </div>
                  <div>
                    <div className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">{item.symbol}</div>
                    <div className="text-[9px] font-mono font-bold text-white/30 uppercase">{item.timeframe} Range</div>
                  </div>
                </div>
                <div className="action-status font-bold tracking-wider text-[9px] px-2 py-0.5 rounded bg-black/40 border border-white/5"
                  style={{ color: accentColor, borderColor: `${accentColor}40` }}>
                  {item.signal}
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between mb-4">
                <div>
                  <div className="text-xl font-mono font-bold text-white tabular-nums">${item.price?.toLocaleString()}</div>
                  <div className={`flex items-center gap-1 text-[10px] font-bold ${isPositive ? 'text-cyan-400' : 'text-red-400'}`}>
                    {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {item.change24h?.toFixed(2)}%
                  </div>
                </div>
                <div className="w-20 h-8 opacity-60 group-hover:opacity-100 transition-opacity">
                  <MiniSparkline data={item.sparkline} color={accentColor} height={32} />
                </div>
              </div>

              <div className="relative z-10 pt-4 border-t border-white/5">
                <div className="action-score w-full mb-3">
                  <div className="flex justify-between text-[9px] uppercase font-bold text-white/30 mb-1">
                    <span>{t('ui.ai_confidence') || 'AI Confidence'}</span>
                    <span style={{ color: accentColor }}>{Math.round(item.confidence * 100)}%</span>
                  </div>
                  <div className="score-bar h-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="score-fill h-full rounded-full"
                      style={{
                        width: `${item.confidence * 100}%`,
                        background: accentColor,
                        boxShadow: isBuy ? '0 0 8px rgba(34,211,238,0.5)' : 'none'
                      }} />
                  </div>
                </div>

                <button
                  className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-300"
                  style={{
                    background: isBuy ? 'linear-gradient(90deg, rgba(34,211,238,0.1) 0%, rgba(6,182,212,0.2) 100%)' : 'rgba(255,255,255,0.05)',
                    color: isBuy ? '#22d3ee' : '#fff',
                    border: `1px solid ${isBuy ? 'rgba(34,211,238,0.3)' : 'rgba(255,255,255,0.1)'}`,
                  }}
                >
                  <Eye size={14} /> {t('ui.analyze_setup') || 'ANALYZE SETUP'}
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
  const candles = useMemo(() => {
    let start = 30000
    if (symbol.startsWith('BTC')) start = 67200
    else if (symbol.startsWith('ETH')) start = 3450
    else if (symbol.startsWith('SOL')) start = 145
    else if (symbol.startsWith('BNB')) start = 590
    else if (symbol.startsWith('TON')) start = 5.2
    return genCandles(420, start)
  }, [symbol])

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

  const lastPrice = closes[closes.length - 1]
  const lastRSI = rsi14[rsi14.length - 1]
  const pMin = Math.min(...closes.slice(100), ...(ichimoku.spanB.filter(v => v != null).slice(-300) || []))
  const pMax = Math.max(...closes.slice(100), ...(ichimoku.spanA.filter(v => v != null).slice(-300) || []))
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
          <div className="stat-pill">
            <Zap size={18} color={aiLoading ? 'var(--muted)' : '#ff9800'} className={aiLoading ? 'spin' : ''} />
            <div>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('ui.ai_sentiment') || 'AI Sentiment'}</div>
              <div style={{ fontWeight: 600, color: aiInsight?.sentiment === 'BULLISH' ? '#4caf50' : aiInsight?.sentiment === 'BEARISH' ? '#f44336' : 'var(--text)' }}>
                {aiLoading ? (t('ui.analyzing') || 'Analyzing...') : aiInsight?.sentiment || 'NEUTRAL'}
                {!aiLoading && aiInsight?.confidence > 0 && <span className="data-number" style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>{Math.round(aiInsight.confidence * 100)}%</span>}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t('ui.price') || 'Price'}</div>
              <div className="data-number" style={{ fontSize: 24, fontWeight: 700 }}>${lastPrice?.toFixed(2)}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>RSI</div>
              <div className="data-number" style={{ fontSize: 24, fontWeight: 700, color: lastRSI > 70 ? '#ff3b30' : lastRSI < 30 ? '#4caf50' : 'var(--text)' }}>
                {lastRSI?.toFixed(1)}
              </div>
            </div>
          </div>
        </div>
        {!aiLoading && aiInsight && (
          <div style={{ marginTop: 16, padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 12, fontSize: 14, border: '1px solid rgba(255,255,255,0.05)' }}>
            <strong>💡 AI Insight:</strong> {aiInsight.reason}
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
